// Panel za lokale (partnere): poseban sajt, odvojen od glavnog, samo za lokale.
// Na internetu: partneri.beepbeepdostava.rs (server/index.js ga služi kad zahtev stigne na tu adresu).
// Na računaru: `npm run partneri` pokreće ga na http://localhost:3001 (ista baza kao glavni sajt).
//
// Lokal vidi samo svoj deo porudžbine (stavke, cene, napomenu za lokal), broj porudžbine i ime kupca, bez adrese
// i telefona: po porudžbinu dolazi Beep Beep dostavljač. Sumnjive porudžbine lokal ne vidi dok ih
// vlasnik ne odobri (server/risk.js). Kad lokal prihvati, odbije ili javi da je spremno, vlasnik
// dobija poruku na Telegram.
import { createServer } from 'node:http'
import { createHash, randomBytes } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const standalone = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (standalone) for (const file of ['.env', '.env.local']) if (existsSync(file)) process.loadEnvFile(file)
process.env.TZ ||= 'Europe/Belgrade' // vreme kao u Negotinu, i kad server radi u drugoj zoni

const { db } = await import('../server/db.js')
const { checkPassword, recordFailure, tooManyAttempts } = await import('../server/auth.js')
const { notify } = await import('../server/notify.js')
const { events } = await import('../server/events.js')
const { afterShopAnswer } = await import('../server/owner.js')
const { shopBySlug } = await import('../src/catalog.js')
const { lineText, rejectMessage, waLink } = await import('../src/lib/order.js')

const COOKIE = 'bb_partner'
const SESSION_DAYS = 90
const STATUSES = ['nova', 'prihvaćena', 'spremna', 'odbijena']
const DAYS_SHOWN = 2 // porudžbine iz poslednja 2 dana

const sha = (t) => createHash('sha256').update(t).digest('hex')
const ip = (req) => (process.env.TRUST_PROXY ? req.headers['x-forwarded-for']?.split(',')[0].trim() : null) || req.socket.remoteAddress

function readCookie(req) {
  return (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))?.[1]
}
function setCookie(req, res, value) {
  const https = req.socket.encrypted || req.headers['x-forwarded-proto']?.split(',')[0].trim() === 'https'
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict${https ? '; Secure' : ''}`)
}

function currentShop(req) {
  const token = readCookie(req)
  if (!token) return null
  return (
    db
      .prepare('SELECT a.* FROM shop_sessions s JOIN shop_accounts a ON a.id = s.account_id WHERE s.token_hash = ? AND s.expires_at > ?')
      .get(sha(token), Date.now()) ?? null
  )
}

/** Kupac za lokal: ime i prezime (ili firma), bez telefona i adrese (po porudžbinu dolazi dostavljač). */
const customerForShop = (customer) => customer

/** Porudžbine jednog lokala: samo njegov deo. */
function ordersFor(slug) {
  return db
    .prepare(
      `SELECT o.id, o.customer, o.items_json, o.created_at, o.status order_status, os.status, os.minutes, os.reason, os.updated_at
       FROM order_shops os JOIN orders o ON o.id = os.order_id
       WHERE os.slug = ? AND o.released = 1 AND o.created_at > datetime('now', 'localtime', ?)
       ORDER BY o.id DESC LIMIT 100`,
    )
    .all(slug, `-${DAYS_SHOWN} days`)
    .map((o) => {
      const part = JSON.parse(o.items_json).find((s) => s.slug === slug) ?? { lines: [], request: '' }
      const sum = Math.round(part.lines.reduce((t, l) => t + (l.price ?? 0) * l.qty, 0) * 100) / 100
      return {
        id: o.id,
        time: o.created_at,
        customer: customerForShop(o.customer),
        lines: part.lines.map((l) => ({ qty: l.qty, name: l.name, variant: l.variant, price: l.price })),
        request: part.request,
        sum,
        byBill: part.lines.some((l) => l.price == null),
        status: o.order_status === 'otkazana' ? 'otkazana' : o.status,
        minutes: o.minutes,
        reason: o.reason,
        updated: o.updated_at,
      }
    })
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message)
}
const text = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const routes = {
  'GET /api/me': (req) => {
    const acc = currentShop(req)
    return { shop: acc ? { name: shopBySlug(acc.slug)?.name ?? acc.slug, username: acc.username } : null }
  },

  'POST /api/login': (req, res, body) => {
    if (tooManyAttempts(ip(req))) fail(429, 'Previše pokušaja. Sačekajte 15 minuta.')
    const acc = db.prepare('SELECT * FROM shop_accounts WHERE username = ?').get(text(body.username, 60).toLowerCase())
    if (!acc || !checkPassword(typeof body.password === 'string' ? body.password : '', acc.password_hash)) {
      recordFailure(ip(req))
      fail(401, 'Pogrešno korisničko ime ili lozinka.')
    }
    const token = randomBytes(32).toString('base64url')
    db.prepare('INSERT INTO shop_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)').run(sha(token), acc.id, Date.now() + SESSION_DAYS * 864e5)
    setCookie(req, res, `${token}; Max-Age=${SESSION_DAYS * 86400}`)
    return { shop: { name: shopBySlug(acc.slug)?.name ?? acc.slug, username: acc.username } }
  },

  'POST /api/logout': (req, res) => {
    const token = readCookie(req)
    if (token) db.prepare('DELETE FROM shop_sessions WHERE token_hash = ?').run(sha(token))
    setCookie(req, res, '; Max-Age=0')
    return { ok: true }
  },

  'GET /api/orders': (req) => {
    const acc = currentShop(req) ?? fail(401, 'Prijavite se.')
    return { orders: ordersFor(acc.slug) }
  },

  // lokal menja stanje svog dela porudžbine: prihvaćena (za koliko minuta), spremna, odbijena (razlog)
  'POST /api/status': async (req, res, body) => {
    const acc = currentShop(req) ?? fail(401, 'Prijavite se.')
    const id = Number(body.id)
    const status = body.status
    if (!STATUSES.includes(status) || status === 'nova') fail(400, 'Nepoznat status.')
    const row = db
      .prepare(`SELECT os.*, o.released, o.status order_status FROM order_shops os JOIN orders o ON o.id = os.order_id WHERE os.order_id = ? AND os.slug = ?`)
      .get(id, acc.slug)
    if (!row || !row.released) fail(404, 'Porudžbina ne postoji.')
    if (row.order_status === 'otkazana') fail(409, 'Ova porudžbina je otkazana.')
    const minutes = status === 'prihvaćena' ? Math.min(Math.max(parseInt(body.minutes, 10) || 0, 1), 180) : row.minutes
    const reason = status === 'odbijena' ? text(body.reason, 300) || 'bez razloga' : ''
    db.prepare("UPDATE order_shops SET status = ?, minutes = ?, reason = ?, updated_at = datetime('now', 'localtime') WHERE order_id = ? AND slug = ?").run(
      status, minutes, reason, id, acc.slug,
    )
    events.emit('orders', [acc.slug]) // odmah osveži drugu stranicu istog lokala (telefon i računar) i admin panel
    const { message, buttons } = ownerMessage(id, acc.slug, status, minutes, reason)
    await notify('orders', message, buttons)
    // kad su svi lokali iz porudžbine odgovorili: tek tada vlasniku ide cela porudžbina
    if (status !== 'spremna') await afterShopAnswer(id)
    return { orders: ordersFor(acc.slug) }
  },
}

const siteUrl = () => (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '')
const nameOf = (slug) => shopBySlug(slug)?.name ?? slug
const clock = (minutes) => new Date(Date.now() + minutes * 60000).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })
const STATE = { nova: 'još nije odgovorio', prihvaćena: 'prihvaćeno', spremna: 'spremno', odbijena: 'ODBIO' }

/**
 * Poruka vlasniku na Telegram kad lokal prihvati, odbije ili javi da je spremno.
 * Kod odbijanja: šta je odbijeno i zašto, stanje ostalih lokala, kupac i dugmad sa gotovom porukom kupcu.
 */
function ownerMessage(id, slug, status, minutes, reason) {
  const order = db.prepare('SELECT id, customer, phone, address, items_json, sms_token FROM orders WHERE id = ?').get(id)
  const parts = db.prepare('SELECT slug, status, minutes, reason FROM order_shops WHERE order_id = ?').all(id)
  const shop = nameOf(slug)
  const part = JSON.parse(order.items_json).find((s) => s.slug === slug) ?? { lines: [] }
  const others = parts.filter((p) => p.slug !== slug)
  const otherLines = others.map(
    (p) => `- ${nameOf(p.slug)}: ${STATE[p.status] ?? p.status}${p.status === 'prihvaćena' && p.minutes ? `, spremno za ${p.minutes} min` : ''}${p.status === 'odbijena' && p.reason ? ` (${p.reason})` : ''}`,
  )
  const customer = [`Kupac: ${order.customer}`, `Telefon: ${order.phone}`, `Adresa: ${order.address}`]
  const all = (s) => parts.every((p) => p.status === s)

  if (status === 'prihvaćena') {
    return {
      message: [
        `✅ PRIHVAĆENO #${id}: ${shop}`,
        `Spremno za ${minutes} min (oko ${clock(minutes)}).`,
        ...(others.length ? ['', 'Ostali lokali:', ...otherLines] : []),
        ...(others.length && all('prihvaćena') ? ['', 'Svi lokali su prihvatili porudžbinu.'] : []),
        '',
        customer[0],
      ].join('\n'),
    }
  }
  if (status === 'spremna') {
    return {
      message: [
        `🛍️ SPREMNO #${id}: ${shop}`,
        'Porudžbina čeka dostavljača u lokalu.',
        ...(others.length ? ['', 'Ostali lokali:', ...otherLines] : []),
        ...(others.length && all('spremna') ? ['', 'Svi lokali su spremni, dostavljač može da krene.'] : []),
        '',
        ...customer,
      ].join('\n'),
    }
  }
  // odbijena
  const partial = others.some((p) => p.status !== 'odbijena')
  const text = rejectMessage({ id, shop, reason, lines: part.lines, partial })
  const sms = order.sms_token && siteUrl().startsWith('https://') ? `${siteUrl()}/sms/${id}/${order.sms_token}` : null
  return {
    message: [
      `❌ LOKAL ODBIO PORUDŽBINU #${id}`,
      `Lokal: ${shop}`,
      `Razlog: ${reason}`,
      'Odbijeno:',
      ...part.lines.map(lineText),
      ...(part.request ? [`  Napomena za lokal bila je: ${part.request}`] : []),
      '',
      ...(others.length ? ['Ostali lokali u ovoj porudžbini:', ...otherLines] : ['Cela porudžbina je bila samo iz ovog lokala.']),
      '',
      'KUPAC',
      ...customer.map((l) => l.replace(/^Kupac: /, 'Ime: ')),
      '',
      'Šta dalje: javite kupcu (dugme ispod otvara gotovu poruku), ponudite zamenu iz drugog lokala ili otkažite porudžbinu u /admin.',
    ].join('\n'),
    buttons: {
      inline_keyboard: [
        [{ text: 'WhatsApp kupcu: lokal odbio', url: waLink(order.phone, text) }],
        ...(sms ? [[{ text: 'SMS kupcu (nema WhatsApp)', url: sms }]] : []),
      ],
    },
  }
}


async function readBody(req) {
  let raw = ''
  for await (const chunk of req) {
    raw += chunk
    if (raw.length > 20_000) fail(413, 'Prevelik zahtev.')
  }
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    fail(400, 'Neispravan zahtev.')
  }
}

const APP = path.join(here, 'app.html')
const SOUND = path.join(here, 'zvuk.mp3') // isti "beep beep" kao kad trokolica stigne na početnoj

/**
 * Ceo panel za lokale: stranica (/), zvuk (/zvuk.mp3) i API (/api/...).
 * Radi na partneri.<domen>/ i na <domen>/partneri/ (dugme "Partneri" u zaglavlju sajta).
 */
export async function partneri(req, res) {
  const url = new URL(req.url, 'http://x')
  url.pathname = url.pathname.replace(/^\/partneri(?=\/|$)/, '') || '/'
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  res.setHeader('X-Frame-Options', 'DENY')
  if (url.pathname === '/zvuk.mp3') {
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.end(readFileSync(SOUND))
  }
  res.setHeader('Cache-Control', 'no-store')
  if (url.pathname === '/api/stream') return stream(req, res)
  if (!url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // stranica se čita pri svakom zahtevu da izmene odmah važe i bez ponovnog pokretanja (mala je)
    return res.end(readFileSync(APP))
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  try {
    const handler = routes[`${req.method} ${url.pathname}`] ?? fail(404, 'Ne postoji.')
    if (req.method !== 'GET' && !req.headers['content-type']?.startsWith('application/json')) fail(415, 'Očekuje se JSON.')
    const body = req.method === 'GET' ? {} : await readBody(req)
    res.end(JSON.stringify(await handler(req, res, body)))
  } catch (err) {
    if (!(err instanceof HttpError)) console.error(err)
    res.statusCode = err.status ?? 500
    res.end(JSON.stringify({ error: err instanceof HttpError ? err.message : 'Greška na serveru.' }))
  }
}

/**
 * Stalna veza sa otvorenom stranicom lokala (Server-Sent Events): čim stigne porudžbina za ovaj lokal,
 * stranica dobija "refresh" i odmah je prikaže, bez osvežavanja. Na 25 sekundi ide prazan signal da
 * veza ne bi bila prekinuta zbog neaktivnosti.
 */
function stream(req, res) {
  const acc = currentShop(req)
  if (!acc) {
    res.statusCode = 401
    return res.end()
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' })
  res.write('retry: 3000\n\n')
  const onOrders = (slugs) => slugs.includes(acc.slug) && res.write('data: refresh\n\n')
  const ping = setInterval(() => res.write(': ping\n\n'), 25000)
  events.on('orders', onOrders)
  req.on('close', () => {
    clearInterval(ping)
    events.off('orders', onOrders)
  })
}

if (standalone) {
  const PORT = Number(process.env.PARTNERI_PORT) || 3001
  createServer(partneri).listen(PORT, () => console.log(`Panel za lokale radi na http://localhost:${PORT}`))
}
