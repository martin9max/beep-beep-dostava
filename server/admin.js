// Admin panel: /admin (korisnici, prijave, porudžbine). Lozinka je ADMIN_PASSWORD u .env.local.
import { timingSafeEqual } from 'node:crypto'
import { db } from './db.js'
import { hashPassword } from './auth.js'
import { customerRecord, trustOf } from './risk.js'
import { events, isOnline, ordersChanged } from './events.js'
import { pushDevices } from './push.js'
import { sources, topPages, visitorsIn, visitsByDay } from './visits.js'
import { SHOPS, shopBySlug } from '../src/catalog.js'
import { formatDin } from '../src/lib/order.js'
import { fullAddress, mapsLink } from '../src/places.js'

// 'na proveri': sumnjiva porudžbina čeka vlasnika (lokali je ne vide); 'nije preuzeta': kupac nije preuzeo (ulazi u ocenu kupca)
const STATUSES = ['na proveri', 'nova', 'prihvaćena', 'u dostavi', 'isporučena', 'nije preuzeta', 'otkazana']
const slugsOf = (id) => db.prepare('SELECT slug FROM order_shops WHERE order_id = ?').all(id).map((r) => r.slug)
const SHOP_LABEL = { nova: 'čeka lokal', prihvaćena: 'prihvaćeno', spremna: 'spremno', odbijena: 'odbijeno' }

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function authorized(req) {
  const user = process.env.ADMIN_USER || 'admin'
  const pass = process.env.ADMIN_PASSWORD
  const [scheme, encoded] = (req.headers.authorization || '').split(' ')
  if (!pass || scheme !== 'Basic' || !encoded) return false
  const given = Buffer.from(Buffer.from(encoded, 'base64').toString('utf8'))
  const expected = Buffer.from(`${user}:${pass}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export async function admin(req, res, next) {
  const url = new URL(req.url, 'http://x')
  if (url.pathname !== '/admin' && !url.pathname.startsWith('/admin/')) return next()

  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex')
  if (!process.env.ADMIN_PASSWORD) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    return res.end('Admin panel je isključen: upišite ADMIN_PASSWORD u .env.local i ponovo pokrenite server.')
  }
  if (!authorized(req)) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="Beep Beep admin", charset="UTF-8"')
    return res.end('Potrebna je prijava.')
  }

  // stalna veza sa stranicom porudžbina: nova porudžbina se pojavi odmah, bez osvežavanja
  if (url.pathname === '/admin/stream') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' })
    res.write('retry: 3000\n\n')
    const onOrders = () => res.write('data: refresh\n\n')
    const ping = setInterval(() => res.write(': ping\n\n'), 25000)
    events.on('orders', onOrders)
    req.on('close', () => {
      clearInterval(ping)
      events.off('orders', onOrders)
    })
    return
  }

  // forme sa admin stranice (promena statusa, brisanje korisnika); samo sa iste adrese
  if (req.method === 'POST') {
    const origin = req.headers.origin
    if (origin && new URL(origin).host !== req.headers.host) {
      res.statusCode = 403
      return res.end('Zabranjeno.')
    }
  }

  // brisanje korisnika: nalog i prijavljeni uređaji nestaju, porudžbine ostaju (sa imenom kupca)
  if (req.method === 'POST' && url.pathname === '/admin/delete-user') {
    const form = await readForm(req)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(form.get('id')))
    if (user) {
      db.prepare('DELETE FROM users WHERE id = ?').run(user.id)
      db.prepare("INSERT INTO logins (user_id, login, success, kind) VALUES (NULL, ?, 1, 'obrisan nalog')").run(
        `${user.name} ${user.surname}, ${user.phone}`,
      )
    }
    res.statusCode = 303
    res.setHeader('Location', `/admin?tab=korisnici${user ? `&obrisan=${encodeURIComponent(`${user.name} ${user.surname}`)}` : ''}`)
    return res.end()
  }

  // promena statusa porudžbine (ako vlasnik ručno skine "na proveri", porudžbina se pušta lokalima)
  if (req.method === 'POST' && url.pathname === '/admin/status') {
    const form = await readForm(req)
    const status = form.get('status')
    if (STATUSES.includes(status)) {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, Number(form.get('id')))
      if (!['na proveri', 'otkazana'].includes(status)) db.prepare('UPDATE orders SET released = 1 WHERE id = ?').run(Number(form.get('id')))
      ordersChanged(slugsOf(Number(form.get('id')))) // npr. otkazana: lokal odmah vidi da ne priprema
    }
    res.statusCode = 303
    res.setHeader('Location', '/admin?tab=porudzbine')
    return res.end()
  }

  // sumnjiva porudžbina: vlasnik je proverio kupca i pušta je lokalima
  if (req.method === 'POST' && url.pathname === '/admin/release') {
    const form = await readForm(req)
    db.prepare("UPDATE orders SET released = 1, status = 'nova' WHERE id = ? AND released = 0").run(Number(form.get('id')))
    ordersChanged(slugsOf(Number(form.get('id'))))
    res.statusCode = 303
    res.setHeader('Location', '/admin?tab=porudzbine')
    return res.end()
  }

  // nalog lokala za panel za lokale: novi ili nova lozinka (isti lokal ima jedan nalog)
  if (req.method === 'POST' && url.pathname === '/admin/shop-account') {
    const form = await readForm(req)
    const slug = form.get('slug')
    const username = (form.get('username') || '').trim().toLowerCase()
    const password = form.get('password') || ''
    let msg
    if (!shopBySlug(slug)) msg = 'Izaberite lokal.'
    else if (!/^[a-z0-9._-]{3,40}$/.test(username)) msg = 'Korisničko ime: 3 do 40 znakova, mala slova, brojevi, tačka, crtica.'
    else if (password.length < 8) msg = 'Lozinka mora imati bar 8 znakova.'
    else if (db.prepare('SELECT 1 FROM shop_accounts WHERE username = ? AND slug != ?').get(username, slug)) msg = 'To korisničko ime već koristi drugi lokal.'
    else {
      db.prepare(
        `INSERT INTO shop_accounts (slug, username, password_hash) VALUES (?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET username = excluded.username, password_hash = excluded.password_hash`,
      ).run(slug, username, hashPassword(password))
      // nova lozinka odjavljuje sve uređaje tog lokala
      db.prepare('DELETE FROM shop_sessions WHERE account_id = (SELECT id FROM shop_accounts WHERE slug = ?)').run(slug)
      msg = `Sačuvano: ${shopBySlug(slug).name} se prijavljuje kao „${username}“.`
    }
    res.statusCode = 303
    res.setHeader('Location', `/admin?tab=lokali&poruka=${encodeURIComponent(msg)}`)
    return res.end()
  }

  // Telegram chat lokala (porudžbine i na Telegram); prazno polje briše
  if (req.method === 'POST' && url.pathname === '/admin/shop-telegram') {
    const form = await readForm(req)
    const chat = (form.get('chat') || '').trim()
    const ok = !chat || /^-?\d{4,20}$/.test(chat)
    if (ok) db.prepare('UPDATE shop_accounts SET telegram_chat_id = ? WHERE slug = ?').run(chat, form.get('slug'))
    res.statusCode = 303
    res.setHeader('Location', `/admin?tab=lokali&poruka=${encodeURIComponent(ok ? 'Telegram lokala je sačuvan.' : 'Chat id mora biti broj (npr. 123456789).')}`)
    return res.end()
  }

  if (req.method === 'POST' && url.pathname === '/admin/shop-delete') {
    const form = await readForm(req)
    db.prepare('DELETE FROM shop_accounts WHERE slug = ?').run(form.get('slug'))
    res.statusCode = 303
    res.setHeader('Location', `/admin?tab=lokali&poruka=${encodeURIComponent('Nalog lokala je obrisan.')}`)
    return res.end()
  }

  const tab = url.searchParams.get('tab') || 'porudzbine'
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(page(tab, url.searchParams.get('obrisan'), url.searchParams.get('poruka')))
}

async function readForm(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 10_000) break
  }
  return new URLSearchParams(raw)
}

function page(tab, deleted, message) {
  const count = (sql) => db.prepare(sql).get().n
  const stats = [
    ['Posetilaca danas', visitorsIn(1)],
    ['Posetilaca 7 dana', visitorsIn(7)],
    ['Posetilaca 30 dana', visitorsIn(30)],
    ['Korisnika', count('SELECT COUNT(*) n FROM users')],
    ['Novih danas', count("SELECT COUNT(*) n FROM users WHERE date(created_at) = date('now','localtime')")],
    ['Prijava danas', count("SELECT COUNT(*) n FROM logins WHERE success = 1 AND kind = 'prijava' AND date(created_at) = date('now','localtime')")],
    ['Neuspelih danas', count("SELECT COUNT(*) n FROM logins WHERE success = 0 AND date(created_at) = date('now','localtime')")],
    ['Porudžbina danas', count("SELECT COUNT(*) n FROM orders WHERE date(created_at) = date('now','localtime')")],
    ['Lokal odbio danas', count("SELECT COUNT(*) n FROM order_shops WHERE status = 'odbijena' AND date(updated_at) = date('now','localtime')")],
  ]
  const tabs = [
    ['porudzbine', 'Porudžbine'],
    ['korisnici', 'Korisnici'],
    ['prijave', 'Prijave'],
    ['lokali', 'Lokali (panel)'],
    ['posete', 'Posete'],
  ]
  const body = { porudzbine: orders, korisnici: users, prijave: logins, lokali: shopAccounts, posete: visits }[tab]?.() ?? ''

  return `<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Beep Beep admin</title>
<style>
  :root { --red:#e3131c; --blue:#1446b8; --navy:#0a2668; --text:#0d2f80; --mute:#4c5f8c; --line:#d5ddf0; --paper:#f1f4fb; color-scheme: light; }
  * { box-sizing: border-box }
  body { margin:0; font:15px/1.5 system-ui, sans-serif; background:var(--paper); color:var(--text) }
  header { background:linear-gradient(90deg,var(--navy),var(--blue)); color:#fff; padding:14px 20px; display:flex; gap:16px; align-items:center; flex-wrap:wrap }
  header b { font-size:18px; font-style:italic; text-transform:uppercase; letter-spacing:.02em } header b span { color:var(--red); text-shadow:0 1px 0 #fff } header a { color:#fff }
  main { max-width:1200px; margin:0 auto; padding:20px 16px 60px }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:18px }
  .stat { background:#fff; border:1px solid var(--line); border-radius:10px; padding:12px 14px }
  .stat b { display:block; font-size:26px; color:var(--blue) }
  nav { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap }
  nav a { padding:8px 14px; border-radius:999px; border:1px solid var(--line); background:#fff; color:var(--text); text-decoration:none; font-weight:600 }
  nav a.on { background:var(--red); border-color:var(--red); color:#fff }
  .wrap { overflow-x:auto; background:#fff; border:1px solid var(--line); border-radius:10px }
  table { border-collapse:collapse; width:100%; min-width:720px }
  th, td { text-align:left; padding:9px 12px; border-bottom:1px solid var(--line); vertical-align:top }
  th { background:#f7f9fd; font-size:13px; color:var(--mute) }
  .ok { color:#1d7a46; font-weight:700 } .no { color:var(--red); font-weight:700 }
  .items { margin:0; padding-left:18px } .items li { margin:0 }
  .shop { font-weight:700; margin-top:4px } .req { color:var(--mute); font-style:italic }
  select, button { font:inherit; padding:4px 6px }
  .empty { padding:30px; text-align:center; color:var(--mute) }
  .st-nova { background:#fff3c4 }
  .notice { background:#dff5dc; border:1px solid #a9dea2; color:#1d6a3a; padding:10px 14px; border-radius:10px; margin:0 0 14px }
  .del { background:none; border:1px solid var(--red); color:var(--red); border-radius:6px; padding:4px 10px; cursor:pointer; font-weight:600 }
  .del:hover { background:var(--red); color:#fff }
  .on { color:#1d7a46; font-weight:700 } .off { color:var(--mute) } .st-otkazana { opacity:.55 }
  .st-proveri { background:#ffe3e3 } .flags { margin:6px 0 0; padding-left:18px; color:#9b1218; font-size:13px } .flags .info { color:#8a5a00 }
  .release { background:#1d7a46; color:#fff; border:0; border-radius:6px; padding:5px 10px; font-weight:700; cursor:pointer; margin-top:6px }
  .ss { font-size:12px; border-radius:999px; padding:1px 8px; background:#eef2fa; white-space:nowrap } .ss.prihvaćeno, .ss.spremno { background:#dff5dc; color:#1d6a3a } .ss.odbijeno { background:#ffe3e3; color:#9b1218 }
  .bar { height:10px; border-radius:5px; background:var(--blue); min-width:2px } .barwrap { width:100%; min-width:80px }
  .trust { font-weight:700; white-space:nowrap } .trust.ok { color:#1d7a46 } .trust.info { color:#8a5a00 } .trust.check, .trust.block { color:var(--red) }
  form.inline { display:flex; gap:8px; flex-wrap:wrap; align-items:end; background:#fff; border:1px solid var(--line); border-radius:10px; padding:14px; margin-bottom:14px }
  form.inline label { display:grid; gap:2px; font-size:13px; color:var(--mute) } form.inline input, form.inline select { padding:7px 8px; border:1px solid var(--line); border-radius:6px }
  .save { background:var(--red); color:#fff; border:0; border-radius:6px; padding:8px 14px; font-weight:700; cursor:pointer }
  /* telefon: svaki red tabele je kartica, a naziv kolone piše iznad podatka (bez pomeranja levo-desno) */
  @media (max-width: 760px) {
    main { padding: 14px 10px 50px }
    .wrap { overflow: visible; background: none; border: 0 }
    table { min-width: 0 }
    table, tbody, tr, td { display: block; width: 100% }
    thead { display: none }
    tr { background: #fff; border: 1px solid var(--line); border-radius: 12px; margin-bottom: 12px; padding: 6px 0 }
    tr.st-nova { background: #fff8dc } tr.st-proveri { background: #ffeaea }
    td { border: 0; padding: 6px 14px }
    td[data-label]:not([data-label=""])::before { content: attr(data-label); display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--mute) }
    form.inline { flex-direction: column; align-items: stretch }
    /* tabele poseta ostaju zbijene tabele i na telefonu (30 redova kao kartice bi bilo predugačko) */
    .keep .wrap { overflow-x: auto; background: #fff; border: 1px solid var(--line) }
    .keep table { display: table } .keep thead { display: table-header-group } .keep tbody { display: table-row-group }
    .keep tr { display: table-row; border: 0; border-radius: 0; margin: 0; padding: 0; background: none }
    .keep td { display: table-cell; width: auto; padding: 6px 10px; border-bottom: 1px solid var(--line) }
    .keep td::before { content: none !important }
  }
</style>
</head>
<body>
<header><b>Beep Beep <span>admin</span></b><a href="/">← sajt</a></header>
<main>
  <div class="stats">${stats.map(([l, n]) => `<div class="stat"><b>${n}</b>${esc(l)}</div>`).join('')}</div>
  ${message ? `<p class="notice">${esc(message)}</p>` : ''}
  ${deleted ? `<p class="notice">Nalog <b>${esc(deleted)}</b> je obrisan iz baze. Njegove porudžbine su ostale u listi porudžbina.</p>` : ''}
  <nav>${tabs.map(([k, l]) => `<a href="/admin?tab=${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>
  ${body}
</main>
<script>
  // naziv kolone uz svaki podatak (vidi se na telefonu, gde je red tabele kartica)
  for (const table of document.querySelectorAll('table')) {
    const heads = [...table.querySelectorAll('thead th')].map((th) => th.textContent.trim())
    for (const row of table.querySelectorAll('tbody tr')) [...row.children].forEach((td, i) => td.setAttribute('data-label', heads[i] || ''))
  }
</script>
${tab === 'porudzbine' ? `<script>
  // nova porudžbina (ili promena kod lokala) osveži listu odmah; ne dok vlasnik bira status u padajućem meniju
  const live = new EventSource('/admin/stream')
  live.onmessage = () => { if (!(document.activeElement && document.activeElement.tagName === 'SELECT')) location.reload() }
</script>` : ''}
</body>
</html>`
}

const table = (head, rows) =>
  rows.length
    ? `<div class="wrap"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
    : '<div class="wrap"><p class="empty">Još nema podataka.</p></div>'

function users() {
  const rows = db
    .prepare(
      `SELECT u.*, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) orders,
              (SELECT MAX(created_at) FROM logins l WHERE l.user_id = u.id AND l.success = 1 AND l.kind != 'odjava') last_login,
              (SELECT MAX(created_at) FROM logins l WHERE l.user_id = u.id AND l.kind = 'odjava') last_logout,
              (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.expires_at > ?) devices
       FROM users u ORDER BY u.id DESC LIMIT 500`,
    )
    .all(Date.now())
  return table(
    ['#', 'Ime i prezime', 'Telefon', 'Email', 'Adresa', 'Porudžbine', 'Ocena kupca', 'Registrovan', 'Poslednja prijava', 'Sada', ''],
    rows.map(
      (u) => `<tr><td>${u.id}</td><td>${u.kind === 'firma' ? `<b>${esc(u.company)}</b> (PIB ${esc(u.pib)}, MB ${esc(u.mb)})<br>` : ''}${esc(u.name)} ${esc(u.surname)}</td><td><a href="tel:${esc(u.phone)}">${esc(u.phone)}</a></td>
      <td>${esc(u.email ?? '')}</td><td>${esc(fullAddress(u.address, u.place))} <a href="${esc(mapsLink(u.address, u.place))}" target="_blank" rel="noopener">📍</a>${u.address_note ? `<br><small>${esc(u.address_note)}</small>` : ''}</td>
      <td>${u.orders}</td><td>${trustCell(u)}</td><td>${esc(u.created_at)}</td><td>${esc(u.last_login ?? '')}</td>
      <td>${u.devices ? `<span class="on">prijavljen</span>` : `<span class="off">odjavljen${u.last_logout ? `<br><small>${esc(u.last_logout)}</small>` : ''}</span>`}</td>
      <td><form method="post" action="/admin/delete-user" onsubmit="return confirm(${esc(JSON.stringify(`Obrisati nalog: ${u.name} ${u.surname} (${u.phone})? Ovo se ne može vratiti.`))})">
        <input type="hidden" name="id" value="${u.id}"><button class="del">Obriši</button></form></td></tr>`,
    ),
  )
}

function logins() {
  const rows = db
    .prepare(
      `SELECT l.*, u.name, u.surname FROM logins l LEFT JOIN users u ON u.id = l.user_id
       ORDER BY l.id DESC LIMIT 300`,
    )
    .all()
  return table(
    ['Vreme', 'Vrsta', 'Uspelo', 'Upisano', 'Korisnik', 'IP adresa', 'Uređaj'],
    rows.map(
      (l) => `<tr><td>${esc(l.created_at)}</td><td>${esc(l.kind)}</td><td class="${l.success ? 'ok' : 'no'}">${l.success ? 'da' : 'ne'}</td>
      <td>${esc(l.login)}</td><td>${l.name ? `${esc(l.name)} ${esc(l.surname)}` : ''}</td><td>${esc(l.ip)}</td>
      <td><small>${esc((l.user_agent || '').slice(0, 90))}</small></td></tr>`,
    ),
  )
}

function orders() {
  const rows = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 200').all()
  return table(
    ['#', 'Vreme', 'Kupac', 'Adresa', 'Stavke', 'Iznos', 'Status'],
    rows.map((o) => {
      const shops = JSON.parse(o.items_json)
      const flags = JSON.parse(o.risk || '[]')
      const held = !o.released && o.status !== 'otkazana'
      const shopState = Object.fromEntries(db.prepare('SELECT slug, status, minutes, reason FROM order_shops WHERE order_id = ?').all(o.id).map((r) => [r.slug, r]))
      const items = shops
        .map(
          (s, i) => `<div class="shop">${i + 1}. ${esc(s.name)} ${shopBadge(shopState[s.slug], held, o.status)}</div><ul class="items">${s.lines
            .map((l) => `<li>${l.qty}× ${esc(l.name)}${l.variant ? ` (${esc(l.variant)})` : ''}${l.price == null ? ' (po računu)' : ''}</li>`)
            .join('')}</ul>${s.request ? `<div class="req">${esc(s.request)}</div>` : ''}`,
        )
        .join('')
      const select = `<form method="post" action="/admin/status"><input type="hidden" name="id" value="${o.id}">
        <select name="status" onchange="this.form.submit()">${STATUSES.map((s) => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select>
        <noscript><button>Sačuvaj</button></noscript></form>`
      const record = customerRecord(o.user_id, o.phone)
      const trust = trustOf(record)
      return `<tr class="st-${held ? 'proveri' : o.status === 'nova' ? 'nova' : o.status === 'otkazana' ? 'otkazana' : ''}"><td>${o.id}</td><td>${esc(o.created_at)}</td>
        <td>${esc(o.customer)}<br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>
          <br><span class="trust ${trust.level}">${esc(trust.label)}</span> <small>(${record.delivered} preuzeto, ${record.noShows} nije)</small>
          ${flags.length ? `<ul class="flags">${flags.map((f) => `<li class="${f.level}">${esc(f.text)}</li>`).join('')}</ul>` : ''}
          ${held ? `<form method="post" action="/admin/release"><input type="hidden" name="id" value="${o.id}"><button class="release">Proverio sam: pošalji lokalima</button></form>` : ''}</td>
        <td>${esc(o.address)}<br><a href="${esc(o.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address.replace(/\s*\(.*\)$/, '') + ', Srbija')}`)}" target="_blank" rel="noopener">📍 mapa${o.lat != null ? ' (tačna)' : ''}</a>${o.note ? `<br><small>Napomena: ${esc(o.note)}</small>` : ''}</td>
        <td>${items}${o.shops > 1 ? `<small><b>${o.shops} lokala</b>, dodatna zaustavljanja: ${o.shops - 1} x 100 din (uračunato u iznos)</small>` : ''}</td>
        <td>${formatDin(o.total)} din<br><small>${o.delivery == null ? 'dostava: javlja dostavljač' : `dostava ${formatDin(o.delivery)} din (${esc(o.place || 'grad')})`}</small></td><td>${select}</td></tr>`
    }),
  )
}

/** Stanje dela porudžbine u panelu lokala (samo za lokale koji imaju nalog). */
function shopBadge(state, held, orderStatus) {
  if (!state) return ''
  if (orderStatus === 'otkazana') return '<span class="ss">otkazano</span>'
  if (!db.prepare('SELECT 1 FROM shop_accounts WHERE slug = ?').get(state.slug)) return '<span class="ss odbijeno">nema nalog u panelu: pozvati</span>'
  if (held) return '<span class="ss">lokal još ne vidi</span>'
  const label = SHOP_LABEL[state.status] ?? state.status
  const extra = state.status === 'prihvaćena' ? `, ${state.minutes} min` : state.status === 'odbijena' ? `: ${esc(state.reason)}` : ''
  // porudžbina čeka, a panel lokala nije otvoren: verovatno je ne vidi
  const closed = state.status === 'nova' && !isOnline(state.slug) ? ' <span class="ss odbijeno">panel zatvoren</span>' : ''
  return `<span class="ss ${label}">${esc(label)}${extra}</span>${closed}`
}

/** Ocena kupca: preuzete, otkazane i nepreuzete porudžbine (interno, kupac je ne vidi). */
function trustCell(u) {
  const r = customerRecord(u.id, u.phone)
  const t = trustOf(r)
  return `<span class="trust ${t.level}">${esc(t.label)}</span><br><small>${r.delivered} preuzeto, ${r.cancelled} otkazano, ${r.noShows} nije preuzeto</small>`
}

/** Nalozi lokala za panel za lokale (partneri.beepbeepdostava.rs). */
function shopAccounts() {
  const accounts = db.prepare('SELECT * FROM shop_accounts ORDER BY slug').all()
  const has = new Set(accounts.map((a) => a.slug))
  const options = SHOPS.map((s) => `<option value="${esc(s.slug)}">${esc(s.name)}${has.has(s.slug) ? ' (ima nalog)' : ''}</option>`).join('')
  return `<form method="post" action="/admin/shop-account" class="inline" autocomplete="off">
      <label>Lokal<select name="slug" required><option value="">izaberite</option>${options}</select></label>
      <label>Korisničko ime<input name="username" required placeholder="npr. pastizza"></label>
      <label>Lozinka (bar 8 znakova)<input name="password" type="text" required minlength="8"></label>
      <button class="save">Sačuvaj nalog</button>
    </form>
    <p style="color:var(--mute);font-size:14px;margin:-4px 0 14px">Lokal se prijavljuje na <b>beepbeepdostava.rs/partneri</b> (dugme Partneri gore na sajtu). Ako lokal već ima nalog, ovo mu menja korisničko ime i lozinku i odjavljuje ga sa svih uređaja.</p>
    ${SHOPS.filter((s) => !has.has(s.slug)).length ? `<p class="notice" style="background:#fff3c4;border-color:#f1d08a;color:#6b4100">Bez naloga u panelu (ne vide porudžbine, treba ih zvati): ${SHOPS.filter((s) => !has.has(s.slug)).map((s) => esc(s.name)).join(', ')}</p>` : ''}
    ${table(
      ['Lokal', 'Korisničko ime', 'Panel', 'Prijavljen uređaja', 'Obaveštenja', 'Telegram lokala (chat id)', ''],
      accounts.map((a) => {
        const devices = db.prepare('SELECT COUNT(*) n FROM shop_sessions WHERE account_id = ? AND expires_at > ?').get(a.id, Date.now()).n
        const panel = isOnline(a.slug)
          ? '<span class="on">otvoren sada</span>'
          : `<span class="off">zatvoren${a.last_seen ? `<br><small>poslednji put ${esc(a.last_seen)}</small>` : '<br><small>još nije otvaran</small>'}</span>`
        const push = pushDevices(a.id)
        return `<tr><td>${esc(shopBySlug(a.slug)?.name ?? a.slug)}</td><td>${esc(a.username)}</td><td>${panel}</td><td>${devices}</td>
          <td>${push ? `<span class="on">uključena (${push})</span>` : '<span class="off">nisu uključena</span>'}</td>
          <td><form method="post" action="/admin/shop-telegram" class="tg"><input type="hidden" name="slug" value="${esc(a.slug)}">
            <input name="chat" value="${esc(a.telegram_chat_id)}" placeholder="npr. 123456789" inputmode="numeric" style="width:130px"> <button class="save">Sačuvaj</button></form></td>
          <td><form method="post" action="/admin/shop-delete" onsubmit="return confirm('Obrisati nalog lokala?')"><input type="hidden" name="slug" value="${esc(a.slug)}"><button class="del">Obriši</button></form></td></tr>`
      }),
    )}
    <p style="color:var(--mute);font-size:14px;margin-top:10px">Telegram lokala: kad je upisan, lokal svaku novu porudžbinu dobija i na Telegram (zvoni i kad telefon spava).
    Lokal prvo pošalje bilo koju poruku botu <b>@beepbeepdostavanegotin_bot</b>, a broj (chat id) vam javlja administrator sajta.</p>`
}

const SOURCE_LABEL = { 'Google pretraga': '🔎 Google pretraga', Instagram: '📸 Instagram', Facebook: '📘 Facebook', TikTok: '🎵 TikTok', WhatsApp: '💬 WhatsApp', Viber: '💜 Viber', Direktno: '➡️ Direktno', 'Sa sajta': '↩️ Sa sajta', 'Druge pretrage': '🔍 Druge pretrage', 'Drugi sajtovi': '🌐 Drugi sajtovi' }

// naziv strane za tabelu poseta: /lokal/kafanica -> "Meni: Kafanica"
const pageName = (path) => {
  if (path === '/') return 'Početna'
  const [, first, second] = path.split('/')
  if (first === 'lokal') return `Meni: ${shopBySlug(second)?.name ?? second}`
  if (first === 'naruci') return `Naruči${second ? `: ${second}` : ''}`
  return { radio: 'Radio', korpa: 'Korpa', nalog: 'Moj nalog', prijava: 'Prijava', registracija: 'Registracija', uslovi: 'Uslovi korišćenja', privatnost: 'Politika privatnosti' }[first] ?? path
}

/** Posete sajta: po danima (30 dana) i najposećenije strane. Bez kolačića, vidi server/visits.js. */
function visits() {
  const days = visitsByDay(30)
  const max = Math.max(1, ...days.map((d) => d.visitors))
  const pages = topPages(30)
  const maxP = Math.max(1, ...pages.map((p) => p.n))
  const bar = (n, m) => `<div class="barwrap"><div class="bar" style="width:${Math.round((n / m) * 100)}%"></div></div>`
  const date = (d) => `${d.slice(8, 10)}.${d.slice(5, 7)}.`
  return `<div class="keep"><p style="color:var(--mute);font-size:14px;margin:0 0 12px">Posetilac je jedan čovek (uređaj) u toku jednog dana; isti čovek dva dana se broji dvaput. Roboti (Google, Facebook...) se ne broje. Bez kolačića, IP adrese se ne čuvaju.</p>
    <h3 style="margin:18px 0 8px">Odakle dolaze (30 dana)</h3>
    ${(() => {
      const list = sources(30)
      const total = list.reduce((t, x) => t + x.n, 0) || 1
      const maxS = Math.max(1, ...list.map((x) => x.n))
      return list.length
        ? table(['Izvor', 'Posetilaca', '', 'Udeo'], list.map((x) => `<tr><td>${esc(SOURCE_LABEL[x.source] ?? x.source)}</td><td><b>${x.n}</b></td><td>${bar(x.n, maxS)}</td><td>${Math.round((x.n / total) * 100)}%</td></tr>`))
        : '<div class="wrap"><p class="empty">Izvori se beleže od sada; prvi se pojave posle sledećih poseta.</p></div>'
    })()}
    <p style="color:var(--mute);font-size:13px;margin:6px 0 0">„Direktno“ su ukucana adresa, sačuvan link, QR kod i linkovi iz WhatsApp-a i Vibera (oni ne javljaju odakle je posetilac došao).</p>
    <h3 style="margin:22px 0 8px">Poslednjih 30 dana</h3>
    ${table(
      ['Dan', 'Posetilaca', '', 'Otvaranja strana'],
      days.map((d) => `<tr><td>${date(d.day)}</td><td><b>${d.visitors}</b></td><td>${bar(d.visitors, max)}</td><td>${d.views}</td></tr>`),
    )}
    <h3 style="margin:22px 0 8px">Najposećenije strane (30 dana)</h3>
    ${table(
      ['Strana', 'Otvaranja', ''],
      pages.map((p) => `<tr><td>${esc(pageName(p.path))}<br><small style="color:var(--mute)">${esc(p.path)}</small></td><td><b>${p.n}</b></td><td>${bar(p.n, maxP)}</td></tr>`),
    )}</div>`
}
