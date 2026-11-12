// Stranica /sms/<id>/<kod>: vlasnik je otvara dugmetom "SMS kupcu" ispod porudžbine na Telegramu
// (za kupce bez WhatsApp-a). Izabere za koliko minuta stiže i otvori mu se SMS aplikacija sa brojem
// kupca i gotovom porukom. Telegram dugme ne može samo da otvori SMS, zato postoji ova stranica.
import { timingSafeEqual } from 'node:crypto'
import { db } from './db.js'
import { etaMessage, toSms } from '../src/lib/order.js'

const MINUTES = [10, 15, 20, 30, 45, 60]
// link važi 3 dana: posle toga podaci kupca više nisu dostupni preko njega
const VALID_DAYS = 3

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

const same = (a, b) => {
  const x = Buffer.from(String(a))
  const y = Buffer.from(String(b))
  return x.length === y.length && timingSafeEqual(x, y)
}

// "?&body=" radi i na iPhone-u i na Androidu
const smsLink = (phone, text) => `sms:${toSms(phone)}?&body=${encodeURIComponent(text)}`

function page(res, status, title, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.end(`<!doctype html>
<html lang="sr-Latn-RS">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<style>
  :root { --red: #e3131c; --navy: #0a2668; --ink: #1446b8; --line: #dfe5ef; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f3f6fb; color: var(--navy); font: 16px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 480px; margin: 0 auto; padding: 20px 16px 40px; }
  h1 { margin: 0 0 4px; font-size: 22px; }
  h2 { margin: 26px 0 10px; font-size: 16px; }
  .muted { color: #4a5b80; margin: 0; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 14px 16px; margin-top: 16px; }
  .card p { margin: 2px 0; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  a.btn { display: block; text-align: center; text-decoration: none; font-weight: 700; border-radius: 14px; padding: 16px 6px; font-size: 18px; }
  .red { background: var(--red); color: #fff; }
  .light { background: #fff; color: var(--navy); border: 2px solid var(--line); }
  .call { margin-top: 26px; background: var(--ink); color: #fff; }
  pre { white-space: pre-wrap; font: inherit; font-size: 14px; margin: 0; color: #24365f; }
  details { margin-top: 18px; }
  summary { cursor: pointer; font-weight: 600; }
</style>
</head>
<body><main>${body}</main></body>
</html>`)
}

export function smsPage(req, res, url) {
  const [, , id, token] = url.pathname.split('/')
  const order =
    /^\d+$/.test(id ?? '') && token
      ? db
          .prepare(`SELECT id, customer, phone, items_json, total, delivery, sms_token FROM orders WHERE id = ? AND created_at > datetime('now', 'localtime', '-${VALID_DAYS} days')`)
          .get(Number(id))
      : null
  if (req.method !== 'GET' || !order?.sms_token || !same(order.sms_token, token)) {
    return page(res, 404, 'Link ne važi', '<h1>Link ne važi</h1><p class="muted">Porudžbina ne postoji ili je link stariji od 3 dana. Kupca možete pozvati sa broja iz poruke na Telegramu.</p>')
  }

  const summary = { id: order.id, shops: JSON.parse(order.items_json), total: order.total, delivery: order.delivery }
  const buttons = (withList, cls) =>
    MINUTES.map((m) => `<a class="btn ${cls}" href="${esc(smsLink(order.phone, etaMessage(m, withList ? summary : null)))}">${m} min</a>`).join('')

  page(
    res,
    200,
    `SMS kupcu, porudžbina #${order.id}`,
    `<h1>SMS kupcu</h1>
<p class="muted">Porudžbina #${order.id}: ${esc(order.customer)}, ${esc(order.phone)}</p>

<h2>Za koliko minuta stiže?</h2>
<div class="grid">${buttons(true, 'red')}</div>
<p class="muted" style="margin-top:10px">Otvoriće se poruke sa upisanim brojem kupca i tekstom. Samo pritisnite pošalji.</p>

<h2>Kraća poruka, bez spiska porudžbine</h2>
<div class="grid">${buttons(false, 'light')}</div>

<details class="card">
  <summary>Kako izgleda poruka</summary>
  <pre style="margin-top:10px">${esc(etaMessage(20, summary))}</pre>
</details>

<a class="btn call" href="tel:${esc(toSms(order.phone))}">Pozovi kupca</a>`,
  )
}
