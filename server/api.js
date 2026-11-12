// API za sajt: /api/... (registracija, prijava, nalog, porudžbine)
import { db } from './db.js'
import { checkPassword, createSession, currentUser, destroySession, hashPassword, recordFailure, tooManyAttempts } from './auth.js'
import { findItem, priceOf, shopBySlug, variantLabel } from '../src/catalog.js'
import { etaButtons, formatOrder, isValidPhone, normalizePhone } from '../src/lib/order.js'
import { deliveryPriceOf } from '../src/data.js'
import { cleanPlace, fullAddress as joinAddress, mapsLink, zoneOf } from '../src/places.js'

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message)
}

const ip = (req) =>
  (process.env.TRUST_PROXY ? req.headers['x-forwarded-for']?.split(',')[0].trim() : null) || req.socket.remoteAddress

/** Podaci korisnika koje browser sme da vidi (bez heša lozinke). */
const publicUser = (u) => ({
  name: u.name,
  surname: u.surname,
  phone: u.phone,
  email: u.email,
  address: u.address,
  place: u.place,
  addressNote: u.address_note,
  kind: u.kind === 'firma' ? 'firma' : 'kupac',
  company: u.company || '',
  pib: u.pib || '',
  mb: u.mb || '',
  companyAddress: u.company_address || '',
  companyPlace: u.company_place || '',
  companyAddressNote: u.company_address_note || '',
})

/** Nalog ima firmu: registrovan kao firma ili je kupac svom nalogu dodao firmu. */
const hasFirm = (u) => Boolean(u?.company)

/** Podaci firme (samo za nalog firme): naziv, PIB (9 cifara) i matični broj (8 cifara). */
function readBusiness(body) {
  const b = {
    company: text(body.company, 120),
    pib: text(body.pib, 20).replace(/\s/g, ''),
    mb: text(body.mb, 20).replace(/\s/g, ''),
  }
  if (b.company.length < 2) fail(400, 'Upišite naziv firme.')
  if (!/^\d{9}$/.test(b.pib)) fail(400, 'PIB mora imati tačno 9 cifara.')
  if (!/^\d{8}$/.test(b.mb)) fail(400, 'Matični broj mora imati tačno 8 cifara.')
  return b
}

/** Kako se kupac zove u porudžbini: firma sa PIB-om i kontakt osobom, ili samo ime i prezime. */
const customerName = (u, asFirm = u.kind === 'firma') =>
  asFirm && hasFirm(u) ? `${u.company} (PIB ${u.pib}), kontakt: ${u.name} ${u.surname}` : `${u.name} ${u.surname}`

/** Adresa firme iz forme (mesto, ulica i broj, dodatno). */
function readFirmAddress(body) {
  const a = { address: text(body.companyAddress), place: cleanPlace(body.companyPlace), note: text(body.companyAddressNote) }
  if (!a.place) fail(400, 'Izaberite mesto firme.')
  if (!a.address) fail(400, 'Upišite adresu firme.')
  return a
}

const text = (value, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function readProfile(body) {
  const p = {
    name: text(body.name, 60),
    surname: text(body.surname, 60),
    email: text(body.email, 120).toLowerCase() || null,
    address: text(body.address),
    place: cleanPlace(body.place),
    addressNote: text(body.addressNote),
  }
  if (!p.name || !p.surname) fail(400, 'Upišite ime i prezime.')
  if (!p.place) fail(400, 'Izaberite mesto (Negotin ili selo).')
  if (!p.address) fail(400, 'Upišite adresu za dostavu.')
  if (!p.email) fail(400, 'Upišite email adresu.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) fail(400, 'Email adresa nije ispravna.')
  return p
}

const routes = {
  'GET /api/me': (req) => {
    const user = currentUser(req)
    return { user: user ? publicUser(user) : null }
  },

  'POST /api/register': (req, res, body) => {
    const profile = readProfile(body)
    const phone = text(body.phone, 30)
    const password = typeof body.password === 'string' ? body.password : ''
    const business = body.kind === 'firma' ? readBusiness(body) : null
    if (!isValidPhone(phone)) fail(400, 'Broj telefona nije ispravan (npr. 064 123 4567).')
    if (password.length < 8) fail(400, 'Lozinka mora imati bar 8 znakova.')
    const normalized = normalizePhone(phone)
    const already = business ? ' Ako je to vaš lični nalog, prijavite se i dodajte firmu u delu „Moj nalog“.' : ' Prijavite se.'
    if (db.prepare('SELECT 1 FROM users WHERE phone = ?').get(normalized)) fail(409, `Ovaj broj telefona je već registrovan.${already}`)
    if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(profile.email)) fail(409, `Ovaj email je već registrovan.${already}`)

    const { lastInsertRowid: id } = db
      .prepare(
        `INSERT INTO users (name, surname, phone, email, password_hash, address, place, address_note, kind, company, pib, mb,
                            company_address, company_place, company_address_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        profile.name, profile.surname, normalized, profile.email, hashPassword(password), profile.address, profile.place, profile.addressNote,
        business ? 'firma' : 'kupac', business?.company ?? '', business?.pib ?? '', business?.mb ?? '',
        business ? profile.address : '', business ? profile.place : '', business ? profile.addressNote : '',
      )
    db.prepare("INSERT INTO logins (user_id, login, success, kind, ip, user_agent) VALUES (?, ?, 1, 'registracija', ?, ?)").run(
      id, normalized, ip(req), req.headers['user-agent'] ?? '',
    )
    createSession(req, res, id)
    // ne čeka se Telegram, da kupac ne čeka na registraciju
    notify(
      'accounts',
      [
        ...(business
          ? ['NOVA FIRMA', business.company, `PIB: ${business.pib}, MB: ${business.mb}`, `Kontakt: ${profile.name} ${profile.surname}`]
          : ['NOVI KORISNIK', `${profile.name} ${profile.surname}`]),
        `Telefon: ${normalized}`,
        `Email: ${profile.email}`,
        `Adresa: ${joinAddress(profile.address, profile.place)}${profile.addressNote ? ` (${profile.addressNote})` : ''}`,
        `Mapa: ${mapsLink(profile.address, profile.place)}`,
      ].join('\n'),
    )
    return { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id)) }
  },

  'POST /api/login': (req, res, body) => {
    const login = text(body.login, 120)
    const password = typeof body.password === 'string' ? body.password : ''
    if (tooManyAttempts(ip(req))) fail(429, 'Previše pokušaja. Sačekajte 15 minuta ili nas pozovite.')

    const user = login.includes('@')
      ? db.prepare('SELECT * FROM users WHERE email = ?').get(login.toLowerCase())
      : db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizePhone(login))
    const ok = Boolean(user && checkPassword(password, user.password_hash))
    db.prepare('INSERT INTO logins (user_id, login, success, ip, user_agent) VALUES (?, ?, ?, ?, ?)').run(
      user?.id ?? null, login, ok ? 1 : 0, ip(req), req.headers['user-agent'] ?? '',
    )
    if (!ok) {
      recordFailure(ip(req))
      reportLoginTrouble(login, user)
      fail(401, 'Pogrešan telefon/email ili lozinka.')
    }
    // prijava za firme: nalog kupca se ovde ne prijavljuje (usluge za firme su samo za naloge firmi)
    if (body.kind === 'firma' && !hasFirm(user)) {
      fail(403, 'Ovaj nalog nema firmu. Prijavite se kao kupac i dodajte firmu u delu „Moj nalog“, ili registrujte firmu.')
    }
    createSession(req, res, user.id)
    return { user: publicUser(user) }
  },

  'POST /api/logout': (req, res) => {
    // odjava se beleži u tabeli prijava, da se u admin panelu vidi ko se odjavio
    const user = currentUser(req)
    if (user) {
      db.prepare("INSERT INTO logins (user_id, login, success, kind, ip, user_agent) VALUES (?, ?, 1, 'odjava', ?, ?)").run(
        user.id, user.phone, ip(req), req.headers['user-agent'] ?? '',
      )
    }
    destroySession(req, res)
    return { ok: true }
  },

  'PUT /api/me': (req, res, body) => {
    const user = requireUser(req)
    const p = readProfile(body)
    if (db.prepare('SELECT 1 FROM users WHERE email = ? AND id != ?').get(p.email, user.id)) fail(409, 'Ovaj email koristi drugi nalog.')
    db.prepare('UPDATE users SET name = ?, surname = ?, email = ?, address = ?, place = ?, address_note = ? WHERE id = ?').run(
      p.name, p.surname, p.email, p.address, p.place, p.addressNote, user.id,
    )

    return { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) }
  },

  // firma u nalogu: dodavanje ili izmena (naziv, PIB, matični broj i adresa firme)
  'PUT /api/firm': (req, res, body) => {
    const user = requireUser(req)
    const b = readBusiness(body)
    const a = readFirmAddress(body)
    const added = !hasFirm(user)
    db.prepare('UPDATE users SET company = ?, pib = ?, mb = ?, company_address = ?, company_place = ?, company_address_note = ? WHERE id = ?').run(
      b.company, b.pib, b.mb, a.address, a.place, a.note, user.id,
    )
    if (added) {
      notify('accounts', ['FIRMA DODATA NALOGU', b.company, `PIB: ${b.pib}, MB: ${b.mb}`, `Vlasnik naloga: ${user.name} ${user.surname}, ${user.phone}`, `Adresa firme: ${joinAddress(a.address, a.place)}`].join('\n'))
    }
    return { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) }
  },

  'GET /api/orders': (req) => {
    const user = requireUser(req)
    const rows = db.prepare('SELECT id, items_json, total, delivery, zone, status, address, created_at FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 30').all(user.id)
    return { orders: rows.map(({ items_json, ...o }) => ({ ...o, shops: JSON.parse(items_json) })) }
  },

  'POST /api/orders': async (req, res, body) => {
    const user = requireUser(req)
    const shops = buildOrder(body)
    // usluge za firme poručuju samo nalozi firmi
    const forFirm = shops.some((s) => shopBySlug(s.slug)?.service === 'other')
    if (forFirm && !hasFirm(user)) {
      fail(403, 'Usluge za firme mogu da poruče samo nalozi sa firmom. Dodajte firmu u delu „Moj nalog“ ili izbacite te usluge iz korpe.')
    }
    // na koga ide porudžbina: firma (adresa firme, naziv i PIB) ili lično (adresa iz naloga)
    const asFirm = hasFirm(user) && (body.deliverTo === 'firma' || forFirm || user.kind === 'firma')
    const base = asFirm && body.deliverTo !== 'licno'
      ? { address: user.company_address || user.address, place: user.company_place || user.place, note: user.company_address ? user.company_address_note : user.address_note }
      : { address: user.address, place: user.place, note: user.address_note }
    // privremena adresa ("nisam kod kuće") ili stalna adresa (lična ili firme)
    const custom = text(body.address)
    const address = custom || base.address
    const place = custom ? cleanPlace(body.place) : base.place
    const addressNote = custom ? text(body.addressNote) : base.note
    if (!place) fail(400, 'Izaberite mesto za dostavu (Negotin ili selo).')
    const fullAddress = joinAddress(address, place) + (addressNote ? ` (${addressNote})` : '')
    const note = text(body.note, 500)
    // cena dostave se računa iz mesta, ne iz browsera
    const zone = zoneOf(place)
    const delivery = deliveryPriceOf(place) // Negotin 500 din, selo km × 120 din, ostalo null
    // cene marketa imaju pare (npr. 104,99), pa se zbir zaokružuje na dve decimale
    const goods = Math.round(shops.reduce((sum, s) => sum + s.lines.reduce((t, l) => t + (l.price ?? 0) * l.qty, 0), 0) * 100) / 100
    const total = goods + (delivery ?? 0)
    const customer = customerName(user, asFirm)

    const { lastInsertRowid: id } = db
      .prepare('INSERT INTO orders (user_id, customer, phone, address, place, note, items_json, shops, total, zone, delivery) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(user.id, customer, user.phone, fullAddress, place, note, JSON.stringify(shops), shops.length, total, zone, delivery)

    // "zapamti kao moju adresu"
    if (body.saveAddress && custom) {
      db.prepare('UPDATE users SET address = ?, place = ?, address_note = ? WHERE id = ?').run(address, place, addressNote, user.id)
    }

    await notify('orders', formatOrder({ id, shops, customer, address: fullAddress, map: mapsLink(address, place), phone: user.phone, note, total, zone: place, delivery }), etaButtons(user.phone, { id: Number(id), shops, total, delivery }))
    return { id: Number(id), total, delivery, place }
  },
}

function requireUser(req) {
  return currentUser(req) ?? fail(401, 'Prijavite se da biste nastavili.')
}

/**
 * Pravi porudžbinu iz korpe. Cene se uzimaju iz kataloga na serveru,
 * pa ih niko ne može promeniti u browseru.
 */
function buildOrder(body) {
  const bySlug = new Map()
  const get = (slug) => {
    const shop = shopBySlug(slug) ?? fail(400, 'Nepoznat lokal.')
    if (!bySlug.has(slug)) bySlug.set(slug, { slug, name: shop.name, lines: [], request: '' })
    return bySlug.get(slug)
  }
  for (const line of Array.isArray(body.items) ? body.items.slice(0, 100) : []) {
    const item = findItem(line.shop, line.id) ?? fail(400, 'Neka stavka više ne postoji u meniju. Osvežite stranicu.')
    const variant = Number.isInteger(line.variant) ? line.variant : 0
    const qty = Math.min(Math.max(parseInt(line.qty, 10) || 0, 0), 200) // do 200 (torte se naručuju po parčetu)
    if (!qty) continue
    get(line.shop).lines.push({ id: item.id, qty, name: item.name, variant: variantLabel(item, variant), price: priceOf(item, variant) })
  }
  for (const [slug, request] of Object.entries(body.requests ?? {})) {
    const value = text(request, 600)
    if (value) get(slug).request = value
  }
  const shops = [...bySlug.values()].filter((s) => s.lines.length || s.request)
  if (!shops.length) fail(400, 'Korpa je prazna.')
  return shops
}

/**
 * Poruke na Telegram, preko istog bota, različitim ljudima:
 *   'orders'   -> TELEGRAM_ORDERS_CHAT_ID   (vlasnik: nove porudžbine)
 *   'accounts' -> TELEGRAM_ACCOUNTS_CHAT_ID (administrator sajta: novi korisnici, problemi sa prijavom)
 * `buttons` (nije obavezno): dugmad sa linkovima ispod poruke (npr. WhatsApp kupcu sa gotovom porukom).
 * U svakom može više chat id-jeva odvojenih zarezom. Bez tokena ili chat id-ja poruka se ne šalje.
 */
async function notify(kind, message, buttons) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const key = kind === 'orders' ? 'TELEGRAM_ORDERS_CHAT_ID' : 'TELEGRAM_ACCOUNTS_CHAT_ID'
  const chats = (process.env[key] || '').split(',').map((c) => c.trim()).filter(Boolean)
  if (!token || !chats.length) return
  await Promise.all(
    chats.map(async (chat) => {
      try {
        const send = (markup) =>
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chat, text: message, ...(markup && { reply_markup: markup }) }),
          })
        let res = await send(buttons)
        // ako Telegram odbije dugmad (npr. predugačka), porudžbina ipak mora da stigne, makar bez dugmadi
        if (!res.ok && buttons) {
          console.error(`Telegram (${chat}) odbio dugmad:`, (await res.text()).slice(0, 200))
          res = await send(null)
        }
        if (!res.ok) console.error(`Telegram (${chat}) nije uspeo:`, (await res.text()).slice(0, 200))
      } catch (err) {
        console.error(`Telegram (${chat}) nije uspeo:`, err.message)
      }
    }),
  )
}

/**
 * Posle 3. neuspele prijave u 15 minuta za isti nalog (ili isti upisani telefon/email)
 * administrator dobija poruku, da može da pozove kupca. Javlja se jednom, ne za svaki pokušaj.
 */
function reportLoginTrouble(login, user) {
  const since = "datetime('now', 'localtime', '-15 minutes')"
  const { n } = user
    ? db.prepare(`SELECT COUNT(*) n FROM logins WHERE user_id = ? AND success = 0 AND created_at > ${since}`).get(user.id)
    : db.prepare(`SELECT COUNT(*) n FROM logins WHERE user_id IS NULL AND login = ? AND success = 0 AND created_at > ${since}`).get(login)
  if (n !== 3) return
  notify(
    'accounts',
    user
      ? [
          'PROBLEM SA PRIJAVOM',
          `Nalog: ${user.name} ${user.surname}, 3 puta pogrešna lozinka.`,
          `Telefon: ${user.phone}`,
          `Email: ${user.email ?? '-'}`,
          'Verovatno je lozinka zaboravljena. Pozovite kupca.',
        ].join('\n')
      : [
          'PROBLEM SA PRIJAVOM',
          `Neko 3 puta pokušava da se prijavi sa: ${login}`,
          'Taj telefon/email nije registrovan (možda je upisao pogrešan broj ili nema nalog).',
        ].join('\n'),
  )
}

async function readBody(req) {
  let size = 0
  const chunks = []
  for await (const chunk of req) {
    size += chunk.length
    if (size > 100_000) fail(413, 'Prevelik zahtev.')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    fail(400, 'Neispravan zahtev.')
  }
}

const send = (res, status, data) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

/** Middleware (radi i u Vite dev serveru i u server/index.js). */
export async function api(req, res, next) {
  const url = new URL(req.url, 'http://x')
  if (!url.pathname.startsWith('/api/')) return next()
  const handler = routes[`${req.method} ${url.pathname}`]
  try {
    if (!handler) fail(404, 'Ne postoji.')
    // zaštita od lažnih zahteva sa drugih sajtova: izmene samo kao JSON
    if (req.method !== 'GET' && !req.headers['content-type']?.startsWith('application/json')) fail(415, 'Očekuje se JSON.')
    const body = req.method === 'GET' ? {} : await readBody(req)
    send(res, 200, await handler(req, res, body))
  } catch (err) {
    if (!(err instanceof HttpError)) console.error(err)
    send(res, err.status ?? 500, { error: err instanceof HttpError ? err.message : 'Greška na serveru. Pokušajte ponovo ili nas pozovite.' })
  }
}
