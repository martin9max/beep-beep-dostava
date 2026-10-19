import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'
import { db } from './db.js'

const SESSION_DAYS = 60
const COOKIE = 'bb_session'

/** Lozinka -> "scrypt$so$heš". Iz heša se lozinka ne može vratiti. */
export function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, 64)
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

export function checkPassword(password, stored) {
  const [, salt, hash] = stored.split('$')
  const expected = Buffer.from(hash, 'base64')
  const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length)
  return timingSafeEqual(actual, expected)
}

const sha = (token) => createHash('sha256').update(token).digest('hex')

export function createSession(res, userId) {
  const token = randomBytes(32).toString('base64url')
  const maxAge = SESSION_DAYS * 24 * 3600
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha(token), userId, Date.now() + maxAge * 1000)
  setCookie(res, `${COOKIE}=${token}; Max-Age=${maxAge}`)
}

export function destroySession(req, res) {
  const token = readCookie(req)
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token))
  setCookie(res, `${COOKIE}=; Max-Age=0`)
}

/** Prijavljeni korisnik iz kolačića, ili null. */
export function currentUser(req) {
  const token = readCookie(req)
  if (!token) return null
  return (
    db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(sha(token), Date.now()) ?? null
  )
}

function readCookie(req) {
  const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  return match?.[1]
}

function setCookie(res, value) {
  // Secure: kolačić ide samo preko https (na pravom sajtu); lokalno je http
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${value}; Path=/; HttpOnly; SameSite=Lax${secure}`)
}

// ograničenje pokušaja: najviše 10 neuspešnih prijava za 15 minuta sa iste adrese
const failed = new Map()
const WINDOW = 15 * 60 * 1000

export function tooManyAttempts(ip) {
  const recent = (failed.get(ip) || []).filter((t) => t > Date.now() - WINDOW)
  failed.set(ip, recent)
  return recent.length >= 10
}

export function recordFailure(ip) {
  failed.set(ip, [...(failed.get(ip) || []), Date.now()])
}
