// Duga poruka vlasniku na Telegram (cela porudžbina, kupac, dugmad sa porukom kupcu) i kada se šalje.
//
// Redosled za vlasnika: cela porudžbina stiže čim kupac poruči, a posle nje poruke iz panela lokala
// (prihvaćeno, odbijeno, spremno). afterShopAnswer/scheduleFallback (prvo potvrda lokala, pa porudžbina)
// se trenutno ne koriste; resumePending samo dovršava porudžbine koje su ostale da čekaju.
import { db } from './db.js'
import { notify } from './notify.js'
import { etaButtons, formatOrder } from '../src/lib/order.js'
import { shopBySlug } from '../src/catalog.js'

export const CONFIRM_MINUTES = Number(process.env.CONFIRM_MINUTES) || 5 // CONFIRM_MINUTES samo za probu (npr. 0.3)

const siteUrl = () => (process.env.SITE_URL || process.env.VITE_SITE_URL || '').replace(/\/$/, '')
const nameOf = (slug) => shopBySlug(slug)?.name ?? slug
const clockAt = (date, minutes) => new Date(date.getTime() + minutes * 60000).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })

/** Da li svi lokali iz porudžbine imaju nalog u panelu (samo tada se čeka njihova potvrda). */
export const allConfirmable = (slugs) => slugs.every((slug) => db.prepare('SELECT 1 FROM shop_accounts WHERE slug = ?').get(slug))

/**
 * Pošalji dugu poruku vlasniku, jednom po porudžbini. `note`: red na vrhu (npr. upozorenje da lokal nije odgovorio).
 * Vraća false ako je već poslata.
 */
export async function sendOwnerOrder(id, note = '') {
  // samo jednom, i kad dva lokala odgovore u istom trenutku
  if (!db.prepare('UPDATE orders SET owner_sent = 1 WHERE id = ? AND owner_sent = 0').run(id).changes) return false
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id)
  if (!o || o.status === 'otkazana') return false
  const shops = JSON.parse(o.items_json)
  const parts = db.prepare('SELECT slug, status, minutes, reason, updated_at FROM order_shops WHERE order_id = ?').all(id)
  const risk = JSON.parse(o.risk || '[]')

  const states = parts.map((p) => {
    if (p.status === 'prihvaćena' || p.status === 'spremna') {
      const at = clockAt(new Date(p.updated_at.replace(' ', 'T')), p.minutes ?? 0)
      return `✅ ${nameOf(p.slug)}: ${p.status === 'spremna' ? 'spremno' : `prihvaćeno, spremno za ${p.minutes} min (oko ${at})`}`
    }
    if (p.status === 'odbijena') return `❌ ${nameOf(p.slug)}: odbio (${p.reason})`
    return `⏳ ${nameOf(p.slug)}: još nije odgovorio`
  })
  const header = [
    ...(note ? [note, ''] : []),
    ...(risk.length
      ? [
          risk.some((f) => f.level !== 'info') ? '⚠️ PAŽNJA, SUMNJIVA PORUDŽBINA. Dobro je pozvati kupca pre polaska:' : 'Napomena za vlasnika:',
          ...risk.map((f) => `• ${f.text}`),
          '',
        ]
      : []),
    // stanje lokala samo ako je neki već odgovorio (porudžbina poslata kasnije, npr. posle ponovnog pokretanja)
    ...(parts.some((p) => p.status !== 'nova') ? ['LOKALI', ...states, ''] : []),
  ].join('\n')

  const body = formatOrder({
    id: o.id,
    shops,
    customer: o.customer,
    address: o.address,
    map: o.map_link || null,
    phone: o.phone,
    note: o.note,
    total: o.total,
    zone: o.place || o.zone,
    delivery: o.delivery,
  })
  const sms = o.sms_token ? `${siteUrl()}/sms/${o.id}/${o.sms_token}` : null
  await notify('orders', header + body, etaButtons(o.phone, { id: o.id, shops, total: o.total, delivery: o.delivery }, sms))
  return true
}

/** Posle odgovora lokala: kad su svi odgovorili, šalje se duga poruka (ako je bar jedan prihvatio). */
export async function afterShopAnswer(id) {
  const parts = db.prepare('SELECT status FROM order_shops WHERE order_id = ?').all(id)
  if (parts.some((p) => p.status === 'nova')) return
  if (parts.every((p) => p.status === 'odbijena')) {
    // svi su odbili: vlasnik je već dobio poruke o odbijanju, duga poruka nije potrebna
    db.prepare('UPDATE orders SET owner_sent = 1 WHERE id = ?').run(id)
    return
  }
  await sendOwnerOrder(id)
}

/** Ako lokal ne odgovori za 5 minuta, duga poruka ide sa upozorenjem. */
export function scheduleFallback(id, delayMs = CONFIRM_MINUTES * 60000) {
  setTimeout(() => {
    const pending = db
      .prepare("SELECT slug FROM order_shops WHERE order_id = ? AND status = 'nova'")
      .all(id)
      .map((p) => nameOf(p.slug))
    sendOwnerOrder(id, `⏰ ${pending.join(', ') || 'Lokal'} nije potvrdio porudžbinu za ${CONFIRM_MINUTES} min. Pozovite lokal.`).catch((err) =>
      console.error('Poruka vlasniku nije poslata:', err.message),
    )
  }, Math.max(delayMs, 0)).unref?.()
}

/** Pri pokretanju servera (npr. posle objave): porudžbine koje još čekaju potvrdu dobijaju svoj rok ponovo. */
export function resumePending() {
  const rows = db
    .prepare("SELECT id, created_at FROM orders WHERE owner_sent = 0 AND status != 'otkazana' AND created_at > datetime('now', 'localtime', '-6 hours')")
    .all()
  for (const r of rows) {
    const created = new Date(r.created_at.replace(' ', 'T')).getTime()
    scheduleFallback(r.id, created + CONFIRM_MINUTES * 60000 - Date.now())
  }
}
