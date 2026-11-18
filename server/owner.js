// Duga poruka vlasniku na Telegram (cela porudžbina, kupac, dugmad sa porukom kupcu) i kada se šalje.
//
// Redosled za vlasnika: cela porudžbina stiže čim kupac poruči, a posle nje poruke iz panela lokala
// (prihvaćeno, odbijeno, spremno). afterShopAnswer/scheduleFallback (prvo potvrda lokala, pa porudžbina)
// se trenutno ne koriste; resumePending samo dovršava porudžbine koje su ostale da čekaju.
import { db } from './db.js'
import { notify, sendTelegram } from './notify.js'
import { isOnline } from './events.js'
import { etaButtons, formatDin, formatOrder, lineText } from '../src/lib/order.js'
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
    // lokal koji neće videti porudžbinu (nema nalog ili mu panel nije otvoren): vlasnik treba da ga pozove
    ...shopWarnings(parts.filter((p) => p.status === 'nova').map((p) => p.slug)),
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

/** Upozorenja vlasniku za lokale koji porudžbinu možda neće videti. */
export function shopWarnings(slugs) {
  const lines = []
  for (const slug of slugs) {
    const acc = db.prepare('SELECT last_seen, telegram_chat_id FROM shop_accounts WHERE slug = ?').get(slug)
    if (!acc) lines.push(`⚠️ ${nameOf(slug)} nema nalog u panelu: pozovite lokal telefonom.`)
    else if (!isOnline(slug)) {
      const last = acc.last_seen ? ` (poslednji put na vezi: ${acc.last_seen.slice(8, 10)}.${acc.last_seen.slice(5, 7)}. u ${acc.last_seen.slice(11, 16)})` : ' (još nijednom nije bio otvoren)'
      lines.push(
        acc.telegram_chat_id
          ? `ℹ️ ${nameOf(slug)}: panel nije otvoren${last}, porudžbina mu je poslata i na Telegram.`
          : `⚠️ ${nameOf(slug)}: panel nije otvoren${last}. Pozovite lokal.`,
      )
    }
  }
  return lines.length ? [...lines, ''] : []
}

/**
 * Lokalima koji imaju Telegram (upisan u /admin, kartica Lokali): njihov deo porudžbine i dugme za panel.
 * Telegram zvoni i kad telefon spava; prihvatanje i odbijanje i dalje ide u panelu.
 */
export async function sendToShops(id) {
  const o = db.prepare('SELECT id, customer, note, items_json FROM orders WHERE id = ?').get(id)
  if (!o) return
  const panel = `${siteUrl()}/partneri`
  for (const part of JSON.parse(o.items_json)) {
    const chat = db.prepare('SELECT telegram_chat_id FROM shop_accounts WHERE slug = ?').get(part.slug)?.telegram_chat_id
    if (!chat) continue
    const sum = Math.round(part.lines.reduce((t, l) => t + (l.price ?? 0) * l.qty, 0) * 100) / 100
    const message = [
      `🔔 NOVA PORUDŽBINA #${o.id} za ${part.name}`,
      `Kupac: ${o.customer}`,
      '',
      ...part.lines.map(lineText),
      ...(part.request ? [`Napomena za lokal: ${part.request}`] : []),
      ...(o.note ? [`Napomena kupca: ${o.note}`] : []),
      `Ukupno za lokal: ${formatDin(sum)} din${part.lines.some((l) => l.price == null) ? ' + po računu' : ''}`,
      '',
      'Prihvatite ili odbijte porudžbinu u panelu (dugme ispod). Po porudžbinu dolazi Beep Beep dostavljač.',
    ].join('\n')
    await sendTelegram(chat, message, panel.startsWith('https://') ? { inline_keyboard: [[{ text: 'Otvori panel Beep Beep partneri', url: panel }]] } : undefined)
  }
}

/** Lokalima sa Telegramom: kupac je otkazao porudžbinu. */
export async function cancelToShops(id) {
  const parts = db.prepare('SELECT os.slug, a.telegram_chat_id chat FROM order_shops os JOIN shop_accounts a ON a.slug = os.slug WHERE os.order_id = ?').all(id)
  for (const p of parts) if (p.chat) await sendTelegram(p.chat, `🚫 Porudžbina #${id} je OTKAZANA. Ne pripremajte je.`)
}
