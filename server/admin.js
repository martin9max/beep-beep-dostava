// Admin panel: /admin (korisnici, prijave, porudžbine). Lozinka je ADMIN_PASSWORD u .env.local.
import { timingSafeEqual } from 'node:crypto'
import { db } from './db.js'
import { formatDin } from '../src/lib/order.js'
import { fullAddress, mapsLink } from '../src/places.js'

const STATUSES = ['nova', 'prihvaćena', 'u dostavi', 'isporučena', 'otkazana']

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

  // promena statusa porudžbine
  if (req.method === 'POST' && url.pathname === '/admin/status') {
    const form = await readForm(req)
    if (STATUSES.includes(form.get('status'))) {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(form.get('status'), Number(form.get('id')))
    }
    res.statusCode = 303
    res.setHeader('Location', '/admin?tab=porudzbine')
    return res.end()
  }

  const tab = url.searchParams.get('tab') || 'porudzbine'
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(page(tab, url.searchParams.get('obrisan')))
}

async function readForm(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 10_000) break
  }
  return new URLSearchParams(raw)
}

function page(tab, deleted) {
  const count = (sql) => db.prepare(sql).get().n
  const stats = [
    ['Korisnika', count('SELECT COUNT(*) n FROM users')],
    ['Novih danas', count("SELECT COUNT(*) n FROM users WHERE date(created_at) = date('now','localtime')")],
    ['Prijava danas', count("SELECT COUNT(*) n FROM logins WHERE success = 1 AND kind = 'prijava' AND date(created_at) = date('now','localtime')")],
    ['Neuspelih danas', count("SELECT COUNT(*) n FROM logins WHERE success = 0 AND date(created_at) = date('now','localtime')")],
    ['Porudžbina danas', count("SELECT COUNT(*) n FROM orders WHERE date(created_at) = date('now','localtime')")],
  ]
  const tabs = [
    ['porudzbine', 'Porudžbine'],
    ['korisnici', 'Korisnici'],
    ['prijave', 'Prijave'],
  ]
  const body = { porudzbine: orders, korisnici: users, prijave: logins }[tab]?.() ?? ''

  return `<!doctype html>
<html lang="sr-Latn">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Beep Beep admin</title>
<style>
  :root { --red:#d71e28; --blue:#1673c4; --line:#d7deea; --paper:#f3f5fa; color-scheme: light; }
  * { box-sizing: border-box }
  body { margin:0; font:15px/1.5 system-ui, sans-serif; background:var(--paper); color:#1b2b3d }
  header { background:var(--blue); color:#fff; padding:14px 20px; display:flex; gap:16px; align-items:center; flex-wrap:wrap }
  header b { font-size:18px } header a { color:#fff }
  main { max-width:1200px; margin:0 auto; padding:20px 16px 60px }
  .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-bottom:18px }
  .stat { background:#fff; border:1px solid var(--line); border-radius:10px; padding:12px 14px }
  .stat b { display:block; font-size:26px; color:var(--blue) }
  nav { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap }
  nav a { padding:8px 14px; border-radius:999px; border:1px solid var(--line); background:#fff; color:#1b2b3d; text-decoration:none; font-weight:600 }
  nav a.on { background:var(--red); border-color:var(--red); color:#fff }
  .wrap { overflow-x:auto; background:#fff; border:1px solid var(--line); border-radius:10px }
  table { border-collapse:collapse; width:100%; min-width:720px }
  th, td { text-align:left; padding:9px 12px; border-bottom:1px solid var(--line); vertical-align:top }
  th { background:#f8f9fc; font-size:13px; color:#55779a }
  .ok { color:#1d7a46; font-weight:700 } .no { color:var(--red); font-weight:700 }
  .items { margin:0; padding-left:18px } .items li { margin:0 }
  .shop { font-weight:700; margin-top:4px } .req { color:#55779a; font-style:italic }
  select, button { font:inherit; padding:4px 6px }
  .empty { padding:30px; text-align:center; color:#55779a }
  .st-nova { background:#fff3c4 }
  .notice { background:#dff5dc; border:1px solid #a9dea2; color:#1d6a3a; padding:10px 14px; border-radius:10px; margin:0 0 14px }
  .del { background:none; border:1px solid var(--red); color:var(--red); border-radius:6px; padding:4px 10px; cursor:pointer; font-weight:600 }
  .del:hover { background:var(--red); color:#fff }
  .on { color:#1d7a46; font-weight:700 } .off { color:#55779a } .st-otkazana { opacity:.55 }
</style>
</head>
<body>
<header><b>Beep Beep admin</b><a href="/">← sajt</a></header>
<main>
  <div class="stats">${stats.map(([l, n]) => `<div class="stat"><b>${n}</b>${esc(l)}</div>`).join('')}</div>
  ${deleted ? `<p class="notice">Nalog <b>${esc(deleted)}</b> je obrisan iz baze. Njegove porudžbine su ostale u listi porudžbina.</p>` : ''}
  <nav>${tabs.map(([k, l]) => `<a href="/admin?tab=${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</nav>
  ${body}
</main>
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
    ['#', 'Ime i prezime', 'Telefon', 'Email', 'Adresa', 'Porudžbina', 'Registrovan', 'Poslednja prijava', 'Sada', ''],
    rows.map(
      (u) => `<tr><td>${u.id}</td><td>${esc(u.name)} ${esc(u.surname)}</td><td><a href="tel:${esc(u.phone)}">${esc(u.phone)}</a></td>
      <td>${esc(u.email ?? '')}</td><td>${esc(fullAddress(u.address, u.place))} <a href="${esc(mapsLink(u.address, u.place))}" target="_blank" rel="noopener">📍</a>${u.address_note ? `<br><small>${esc(u.address_note)}</small>` : ''}</td>
      <td>${u.orders}</td><td>${esc(u.created_at)}</td><td>${esc(u.last_login ?? '')}</td>
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
      <td>${esc(l.login)}</td><td>${l.name ? `${esc(l.name)} ${esc(l.surname)}` : '–'}</td><td>${esc(l.ip)}</td>
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
      const items = shops
        .map(
          (s, i) => `<div class="shop">${i + 1}. ${esc(s.name)}</div><ul class="items">${s.lines
            .map((l) => `<li>${l.qty}× ${esc(l.name)}${l.variant ? ` (${esc(l.variant)})` : ''}${l.price == null ? ' – po računu' : ''}</li>`)
            .join('')}</ul>${s.request ? `<div class="req">${esc(s.request)}</div>` : ''}`,
        )
        .join('')
      const select = `<form method="post" action="/admin/status"><input type="hidden" name="id" value="${o.id}">
        <select name="status" onchange="this.form.submit()">${STATUSES.map((s) => `<option${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select>
        <noscript><button>Sačuvaj</button></noscript></form>`
      return `<tr class="st-${o.status === 'nova' ? 'nova' : o.status === 'otkazana' ? 'otkazana' : ''}"><td>${o.id}</td><td>${esc(o.created_at)}</td>
        <td>${esc(o.customer)}<br><a href="tel:${esc(o.phone)}">${esc(o.phone)}</a></td>
        <td>${esc(o.address)}<br><a href="${esc(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address.replace(/\s*\(.*\)$/, '') + ', Srbija')}`)}" target="_blank" rel="noopener">📍 mapa</a>${o.note ? `<br><small>Napomena: ${esc(o.note)}</small>` : ''}</td>
        <td>${items}${o.shops > 1 ? `<small><b>${o.shops} lokala</b>, dodatna zaustavljanja: ${o.shops - 1}</small>` : ''}</td>
        <td>${formatDin(o.total)} din<br><small>${o.delivery == null ? 'dostava: javlja dostavljač' : `dostava ${formatDin(o.delivery)} din (grad)`}</small></td><td>${select}</td></tr>`
    }),
  )
}
