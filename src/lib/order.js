export const EASE = [0.2, 0.8, 0.2, 1]

export const formatDin = (n) => n.toLocaleString('sr-RS')

const cleanPhone = (phone) => phone.replace(/[\s\-/()]/g, '')

export const isValidPhone = (phone) => /^(\+?381|0)6\d{7,8}$/.test(cleanPhone(phone))

/** Telefon u jednom obliku za bazu: 0641234567 */
export const normalizePhone = (phone) => cleanPhone(phone).replace(/^\+?381/, '0')

const toWhatsApp = (phone) => '381' + cleanPhone(phone).replace(/^(\+?381|0)/, '')

/**
 * Tekst porudžbine koju vlasnik dobija (Telegram, admin panel).
 * `shops`: [{ name, lines: [{ qty, name, variant, price }], request }]
 */
export function formatOrder({ id, shops, customer, address, map, phone, note, total, zone, delivery }) {
  const now = new Date()
  return [
    `NOVA PORUDŽBINA #${id}`,
    ...shops.flatMap((shop, i) => [
      '',
      `${i + 1}. ${shop.name}`,
      ...shop.lines.map((l) => `- ${l.qty}x ${l.name}${l.variant ? ` (${l.variant})` : ''}${l.price == null ? ' – po računu' : ''}`),
      ...(shop.request ? [`  Napomena za lokal: ${shop.request}`] : []),
    ]),
    '',
    ...(shops.length > 1 ? [`Više lokala: ${shops.length} (dodatna zaustavljanja: ${shops.length - 1})`] : []),
    ...(note ? [`Napomena: ${note}`] : []),
    `Kupac: ${customer}`,
    `Adresa: ${address}`,
    ...(map ? [`Mapa: ${map}`] : []),
    `Telefon: ${phone}`,
    delivery == null ? `Dostava: ${zone} – cenu javlja dostavljač kupcu` : `Dostava: ${zone} – ${formatDin(delivery)} din`,
    `Ukupno: ${formatDin(total)} din${shops.some((s) => s.lines.some((l) => l.price == null)) ? ' + stavke po računu' : ''}${delivery == null ? ' + dostava' : ''}`,
    `Primljeno: ${now.toLocaleDateString('sr-RS')} u ${now.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`,
    `Javi kupcu (WhatsApp): wa.me/${toWhatsApp(phone)}`,
  ].join('\n')
}
