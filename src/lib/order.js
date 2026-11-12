export const EASE = [0.2, 0.8, 0.2, 1]

export const formatDin = (n) => n.toLocaleString('sr-RS')

const cleanPhone = (phone) => phone.replace(/[\s\-/()]/g, '')

export const isValidPhone = (phone) => /^(\+?381|0)6\d{7,8}$/.test(cleanPhone(phone))

/** Telefon u jednom obliku za bazu: 0641234567 */
export const normalizePhone = (phone) => cleanPhone(phone).replace(/^\+?381/, '0')

const toWhatsApp = (phone) => '381' + cleanPhone(phone).replace(/^(\+?381|0)/, '')

/** Poruka kupcu kad vlasnik javi za koliko minuta stiže porudžbina */
export const etaMessage = (minutes) =>
  `Poštovani/a,\nVaša porudžbina će Vam biti isporučena za ${minutes} min. Hvala Vam na pozivu i ukazanom poverenju.\nVaša Beep Beep Dostava Negotin 😊`

/**
 * Dugmad ispod porudžbine na Telegramu: klik otvara WhatsApp sa kupcem i gotovom porukom,
 * vlasnik samo pritisne „pošalji“ (minuti mogu i da se izmene pre slanja).
 */
export function etaButtons(phone, minutes = [10, 15, 20, 30, 45, 60]) {
  const link = (m) => `https://wa.me/${toWhatsApp(phone)}?text=${encodeURIComponent(etaMessage(m))}`
  const buttons = minutes.map((m) => ({ text: `${m} min`, url: link(m) }))
  return { inline_keyboard: [buttons.slice(0, 3), buttons.slice(3)] }
}

/** Cena stavke u poruci: "900 din" ili "1.800 din (po 900)"; bez cene "po računu" */
const linePrice = ({ qty, price }) => {
  if (price == null) return 'po računu'
  const sum = formatDin(Math.round(price * qty * 100) / 100)
  return qty > 1 ? `${sum} din (po ${formatDin(price)})` : `${sum} din`
}

/**
 * Tekst porudžbine koju vlasnik dobija (Telegram, admin panel).
 * `shops`: [{ name, lines: [{ qty, name, variant, price }], request }]
 */
export function formatOrder({ id, shops, customer, address, map, phone, note, total, zone, delivery }) {
  const now = new Date()
  // gore sve o porudžbini, dole sve o kupcu (vlasnik je tako tražio, preglednije je)
  return [
    `NOVA PORUDŽBINA #${id}`,
    `Primljeno: ${now.toLocaleDateString('sr-RS')} u ${now.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}`,
    ...shops.flatMap((shop, i) => [
      '',
      `${i + 1}. ${shop.name}`,
      ...shop.lines.map((l) => `- ${l.qty}x ${l.name}${l.variant ? ` (${l.variant})` : ''}: ${linePrice(l)}`),
      ...(shop.request ? [`  Napomena za lokal: ${shop.request}`] : []),
    ]),
    '',
    ...(shops.length > 1 ? [`Više lokala: ${shops.length} (dodatna zaustavljanja: ${shops.length - 1})`] : []),
    ...(note ? [`Napomena: ${note}`] : []),
    delivery == null ? `Dostava: ${zone}, cenu javlja dostavljač kupcu` : `Dostava: ${zone}, ${formatDin(delivery)} din`,
    `Ukupno: ${formatDin(total)} din${shops.some((s) => s.lines.some((l) => l.price == null)) ? ' + stavke po računu' : ''}${delivery == null ? ' + dostava' : ''}`,
    '',
    'KUPAC',
    `Ime: ${customer}`,
    `Adresa: ${address}`,
    ...(map ? [`Lokacija: ${map}`] : []),
    `Telefon: ${phone}`,
    `WhatsApp: wa.me/${toWhatsApp(phone)}`,
    '',
    'Za koliko minuta stiže? Dugme ispod otvara WhatsApp sa gotovom porukom kupcu.',
  ].join('\n')
}
