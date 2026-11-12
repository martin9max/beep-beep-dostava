export const EASE = [0.2, 0.8, 0.2, 1]

export const formatDin = (n) => n.toLocaleString('sr-RS')

const cleanPhone = (phone) => phone.replace(/[\s\-/()]/g, '')

export const isValidPhone = (phone) => /^(\+?381|0)6\d{7,8}$/.test(cleanPhone(phone))

/** Telefon u jednom obliku za bazu: 0641234567 */
export const normalizePhone = (phone) => cleanPhone(phone).replace(/^\+?381/, '0')

const toWhatsApp = (phone) => '381' + cleanPhone(phone).replace(/^(\+?381|0)/, '')

// Telegram prima dugmad samo dok su svi linkovi zajedno kraći od ~9.000 znakova (6 dugmadi),
// pa jedan link sme imati najviše ovoliko; kod velike porudžbine spisak se skraćuje ("i još N stavki")
const MAX_LINK = 1250

/** Spisak porudžbine za kupca: lokali, stavke sa cenama, dostava i ukupno (najviše `max` stavki) */
function orderSummary({ id, shops, total, delivery }, max = Infinity) {
  const lines = []
  let shown = 0
  let hidden = 0
  for (const shop of shops) {
    if (shown >= max) {
      hidden += shop.lines.length
      continue
    }
    lines.push(shop.name)
    for (const l of shop.lines) {
      if (shown >= max) hidden++
      else {
        lines.push(`- ${l.qty}x ${l.name}${l.variant ? ` (${l.variant})` : ''}: ${linePrice(l)}`)
        shown++
      }
    }
    if (shop.request) lines.push(`  Napomena: ${shop.request}`)
  }
  if (hidden) lines.push(`i još ${hidden} ${hidden === 1 ? 'stavka' : 'stavki'}`)
  const byBill = shops.some((s) => s.lines.some((l) => l.price == null))
  return [
    `Vaša porudžbina${id ? ` #${id}` : ''}:`,
    ...lines,
    delivery == null ? 'Dostava: cenu javlja dostavljač' : `Dostava: ${formatDin(delivery)} din`,
    `Ukupno: ${formatDin(total)} din${byBill ? ' + stavke po računu' : ''}${delivery == null ? ' + dostava' : ''}`,
  ].join('\n')
}

/**
 * Poruka kupcu kad vlasnik javi za koliko minuta stiže porudžbina.
 * Sa `order` ({ id, shops, total, delivery }) na početku je i spisak onoga što je kupac poručio.
 */
export const etaMessage = (minutes, order, max) =>
  `${order ? orderSummary(order, max) + '\n\n' : ''}Poštovani/a,\nVaša porudžbina će Vam biti isporučena za ${minutes} min. Hvala Vam na pozivu i ukazanom poverenju.\nVaša Beep Beep Dostava Negotin 😊`

/**
 * Dugmad ispod porudžbine na Telegramu: klik otvara WhatsApp sa kupcem i gotovom porukom
 * (spisak porudžbine + za koliko minuta stiže), vlasnik samo pritisne „pošalji“.
 */
export function etaButtons(phone, order, minutes = [10, 15, 20, 30, 45, 60]) {
  const link = (m, max) => `https://wa.me/${toWhatsApp(phone)}?text=${encodeURIComponent(etaMessage(m, order, max))}`
  // koliko stavki staje u link (proverava se na najdužem, sa dvocifrenim minutima)
  let max = order ? order.shops.reduce((n, s) => n + s.lines.length, 0) : 0
  while (max > 0 && link(60, max).length > MAX_LINK) max--
  if (order && link(60, max).length > MAX_LINK) order = null // ni bez stavki ne staje: samo poruka o minutima
  const buttons = minutes.map((m) => ({ text: `${m} min`, url: link(m, max) }))
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
