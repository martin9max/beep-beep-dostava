// Statistika poseta za admin panel: koliko ljudi je otvorilo sajt (danas, 7 dana, 30 dana) i koje strane.
// Bez kolačića i bez spoljnih usluga (Google Analytics i sl.). Posetilac se prepoznaje samo u okviru jednog
// dana, po šifri napravljenoj od IP adrese, pregledača i nasumične "soli" koja se menja svaki dan; IP adresa
// se ne čuva i iz šifre se ne može saznati ko je posetilac. Roboti (Google, Facebook...) se ne broje.
import { createHash, randomBytes } from 'node:crypto'
import { db } from './db.js'

db.exec(`
  -- jedan red = jedan posetilac jednog dana (visitor je jednodnevna šifra)
  CREATE TABLE IF NOT EXISTS visitors (
    day      TEXT NOT NULL,
    visitor  TEXT NOT NULL,
    PRIMARY KEY (day, visitor)
  );
  -- odakle su posetioci došli (jednom po posetiocu dnevno: Google, Instagram, direktno...)
  CREATE TABLE IF NOT EXISTS visit_sources (
    day     TEXT NOT NULL,
    source  TEXT NOT NULL,
    n       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, source)
  );
  -- koliko puta je strana otvorena tog dana
  CREATE TABLE IF NOT EXISTS page_views (
    day   TEXT NOT NULL,
    path  TEXT NOT NULL,
    n     INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (day, path)
  );
`)

const BOTS = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|viber|preview|lighthouse|headless|curl|wget|python|node-fetch|axios|monitor|uptime|scan/i
const today = () => db.prepare("SELECT date('now', 'localtime') d").get().d

/** Nasumična so za danas (čuva se u bazi da bi važila i posle ponovnog pokretanja; stare se brišu). */
function saltFor(day) {
  const key = `visit_salt_${day}`
  const row = db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key)
  if (row) return row.value
  const salt = randomBytes(16).toString('hex')
  db.prepare('INSERT OR IGNORE INTO app_meta (key, value) VALUES (?, ?)').run(key, salt)
  db.prepare("DELETE FROM app_meta WHERE key LIKE 'visit_salt_%' AND key != ?").run(key)
  return db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key).value
}

/**
 * Odakle je posetilac došao. Instagram i Facebook otvaraju link u svom pregledaču i često ne kažu odakle je
 * posetilac, pa se prepoznaju po pregledaču; ostalo po strani sa koje je došao (Referer) ili po ?utm_source=.
 */
function sourceOf(req, url) {
  const ua = req.headers['user-agent'] || ''
  if (/Instagram/i.test(ua)) return 'Instagram'
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'Facebook'
  if (/TikTok|musical_ly|BytedanceWebview/i.test(ua)) return 'TikTok'
  const utm = (url.searchParams.get('utm_source') || '').toLowerCase()
  let host = ''
  try {
    host = new URL(req.headers.referer || '').hostname.replace(/^www\./, '')
  } catch {}
  const from = host || utm
  if (!from) return 'Direktno'
  if (/beepbeepdostava/.test(from)) return 'Sa sajta'
  if (/(^|\.)google\./.test(from) || from === 'google') return 'Google pretraga'
  if (/instagram/.test(from)) return 'Instagram'
  if (/facebook|fb\.com|fb\.me/.test(from)) return 'Facebook'
  if (/whatsapp|wa\.me/.test(from)) return 'WhatsApp'
  if (/viber/.test(from)) return 'Viber'
  if (/tiktok/.test(from)) return 'TikTok'
  if (/bing|yahoo|duckduckgo|yandex|ecosia/.test(from)) return 'Druge pretrage'
  return 'Drugi sajtovi'
}

/** Zabeleži posetu strane (poziva se kad server šalje HTML strane). */
export function recordVisit(req, pathname, url = new URL(req.url, 'http://x')) {
  try {
    if (req.method !== 'GET') return
    const ua = req.headers['user-agent'] || ''
    if (!ua || BOTS.test(ua)) return
    // pregledač ponekad unapred učita stranu koju korisnik možda neće otvoriti: to nije poseta
    if (/prefetch|prerender/i.test(req.headers['sec-purpose'] || req.headers.purpose || '')) return
    const ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || ''
    const day = today()
    const visitor = createHash('sha256').update(`${saltFor(day)}|${ip}|${ua}`).digest('base64url').slice(0, 22)
    const path = pathname.replace(/\/+$/, '') || '/'
    // nov posetilac danas: zabeleži i odakle je došao (prva strana koju je otvorio)
    if (db.prepare('INSERT OR IGNORE INTO visitors (day, visitor) VALUES (?, ?)').run(day, visitor).changes) {
      db.prepare('INSERT INTO visit_sources (day, source, n) VALUES (?, ?, 1) ON CONFLICT(day, source) DO UPDATE SET n = n + 1').run(day, sourceOf(req, url))
    }
    db.prepare('INSERT INTO page_views (day, path, n) VALUES (?, ?, 1) ON CONFLICT(day, path) DO UPDATE SET n = n + 1').run(day, path)
  } catch (err) {
    console.error('Poseta nije zabeležena:', err.message)
  }
}

/** Posetioci u poslednjih `days` dana (zbir dnevnih posetilaca: isti čovek dva dana = 2). */
export const visitorsIn = (days) =>
  db.prepare(`SELECT COUNT(*) n FROM visitors WHERE day > date('now', 'localtime', ?)`).get(`-${days} days`).n

/** Po danima za poslednjih `days` dana: [{ day, visitors, views }]. */
export function visitsByDay(days = 30) {
  const v = Object.fromEntries(
    db.prepare(`SELECT day, COUNT(*) n FROM visitors WHERE day > date('now', 'localtime', ?) GROUP BY day`).all(`-${days} days`).map((r) => [r.day, r.n]),
  )
  const p = Object.fromEntries(
    db.prepare(`SELECT day, SUM(n) n FROM page_views WHERE day > date('now', 'localtime', ?) GROUP BY day`).all(`-${days} days`).map((r) => [r.day, r.n]),
  )
  const out = []
  for (let i = 0; i < days; i++) {
    const day = db.prepare("SELECT date('now', 'localtime', ?) d").get(`-${i} days`).d
    out.push({ day, visitors: v[day] ?? 0, views: p[day] ?? 0 })
  }
  return out
}

/** Najposećenije strane u poslednjih `days` dana. */
export const topPages = (days = 30, limit = 15) =>
  db.prepare(`SELECT path, SUM(n) n FROM page_views WHERE day > date('now', 'localtime', ?) GROUP BY path ORDER BY n DESC LIMIT ?`).all(`-${days} days`, limit)

/** Odakle su posetioci došli u poslednjih `days` dana. */
export const sources = (days = 30) =>
  db.prepare(`SELECT source, SUM(n) n FROM visit_sources WHERE day > date('now', 'localtime', ?) GROUP BY source ORDER BY n DESC`).all(`-${days} days`)
