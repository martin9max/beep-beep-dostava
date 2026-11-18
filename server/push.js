// Push obaveštenja (Web Push) za panel lokala: porudžbina iskoči u uglu ekrana i kad je lokal na drugom
// sajtu (npr. YouTube), kad je kartica panela zatvorena ili je pregledač umanjen. Pregledač mora da bude
// pokrenut (na računaru je obično uvek u pozadini). Bez spoljnih biblioteka i usluga: šifrovanje poruke
// (RFC 8291) i potpis (VAPID, RFC 8292) rade preko ugrađenog node:crypto. Ključevi se prave sami pri prvom
// pokretanju i čuvaju u bazi.
import { createCipheriv, createECDH, createHmac, createPrivateKey, generateKeyPairSync, randomBytes, sign } from 'node:crypto'
import { db } from './db.js'

db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    endpoint    TEXT PRIMARY KEY,
    account_id  INTEGER NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    p256dh      TEXT NOT NULL,
    auth        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`)

const b64u = (buf) => Buffer.from(buf).toString('base64url')
const fromB64u = (s) => Buffer.from(s, 'base64url')
const hmac = (key, data) => createHmac('sha256', key).update(data).digest()

/** VAPID ključevi servera (jednom napravljeni, sačuvani u bazi). */
function vapid() {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'vapid_jwk'").get()
  if (row) return JSON.parse(row.value)
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  const jwk = privateKey.export({ format: 'jwk' })
  db.prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('vapid_jwk', ?)").run(JSON.stringify(jwk))
  return jwk
}

/** Javni ključ za pregledač (applicationServerKey), base64url. */
export const publicKey = () => {
  const jwk = vapid()
  return b64u(Buffer.concat([Buffer.from([4]), fromB64u(jwk.x), fromB64u(jwk.y)]))
}

/** Potpisan VAPID token za adresu push servisa (npr. https://fcm.googleapis.com). */
function vapidHeader(endpoint) {
  const jwk = vapid()
  const header = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))
  const body = b64u(
    JSON.stringify({
      aud: new URL(endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600,
      sub: (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://beepbeepdostava.rs').replace(/\/$/, ''),
    }),
  )
  const key = createPrivateKey({ key: jwk, format: 'jwk' })
  const signature = sign('sha256', Buffer.from(`${header}.${body}`), { key, dsaEncoding: 'ieee-p1363' })
  return `vapid t=${header}.${body}.${b64u(signature)}, k=${publicKey()}`
}

/** Šifrovanje poruke za jednog pretplatnika (aes128gcm, RFC 8291). */
function encrypt(sub, payload) {
  const uaPublic = fromB64u(sub.p256dh)
  const authSecret = fromB64u(sub.auth)
  const ecdh = createECDH('prime256v1')
  const asPublic = ecdh.generateKeys()
  const shared = ecdh.computeSecret(uaPublic)
  const ikm = hmac(hmac(authSecret, shared), Buffer.concat([Buffer.from('WebPush: info\0'), uaPublic, asPublic, Buffer.from([1])]))
  const salt = randomBytes(16)
  const prk = hmac(salt, ikm)
  const cek = hmac(prk, Buffer.concat([Buffer.from('Content-Encoding: aes128gcm\0'), Buffer.from([1])])).subarray(0, 16)
  const nonce = hmac(prk, Buffer.concat([Buffer.from('Content-Encoding: nonce\0'), Buffer.from([1])])).subarray(0, 12)
  const cipher = createCipheriv('aes-128-gcm', cek, nonce)
  const body = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()])
  const rs = Buffer.alloc(4)
  rs.writeUInt32BE(4096)
  return Buffer.concat([salt, rs, Buffer.from([asPublic.length]), asPublic, body])
}

/** Sačuvaj pretplatu pregledača lokala (posle "Dozvoli obaveštenja"). */
export function saveSubscription(accountId, sub) {
  const endpoint = typeof sub?.endpoint === 'string' ? sub.endpoint : ''
  const { p256dh, auth } = sub?.keys ?? {}
  if (!/^https:\/\//.test(endpoint) || typeof p256dh !== 'string' || typeof auth !== 'string') return false
  db.prepare(
    `INSERT INTO push_subscriptions (endpoint, account_id, p256dh, auth) VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET account_id = excluded.account_id, p256dh = excluded.p256dh, auth = excluded.auth`,
  ).run(endpoint, accountId, p256dh, auth)
  return true
}

/** Pošalji obaveštenje svim uređajima lokala. `message`: { title, body, tag, url }. */
export async function pushToShop(slug, message) {
  const subs = db
    .prepare('SELECT ps.* FROM push_subscriptions ps JOIN shop_accounts a ON a.id = ps.account_id WHERE a.slug = ?')
    .all(slug)
  await Promise.all(
    subs.map(async (sub) => {
      try {
        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'aes128gcm',
            TTL: '3600', // ako je uređaj ugašen, poruka čeka najviše sat vremena
            Urgency: 'high',
            Authorization: vapidHeader(sub.endpoint),
          },
          body: encrypt(sub, JSON.stringify(message)),
        })
        // pretplata više ne važi (npr. lokal je obrisao podatke pregledača): briše se
        if (res.status === 404 || res.status === 410) db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(sub.endpoint)
        else if (!res.ok) console.error(`Push (${slug}) nije uspeo: ${res.status}`, (await res.text()).slice(0, 200))
      } catch (err) {
        console.error(`Push (${slug}) nije uspeo:`, err.message)
      }
    }),
  )
}

/** Broj uređaja lokala sa uključenim obaveštenjima (za admin). */
export const pushDevices = (accountId) => db.prepare('SELECT COUNT(*) n FROM push_subscriptions WHERE account_id = ?').get(accountId).n
