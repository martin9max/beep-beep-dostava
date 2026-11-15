// Zaštita od lažnih porudžbina: procena rizika pre nego što porudžbina stigne lokalima.
// Ništa se ne odbija samo zbog jedne sumnje: sumnjiva porudžbina čeka da je vlasnik pogleda
// (pozove kupca) i odobri u /admin. Odbija se samo nalog koji je 3 ili više puta nije preuzeo.
//
// Nivoi oznaka:
//   'info'  samo napomena vlasniku (npr. preporučen avans), porudžbina ide lokalima odmah
//   'check' porudžbina čeka proveru vlasnika, lokali je ne vide dok je ne odobri
//   'block' nalog je ograničen: porudžbina se ne prima, kupac dobija poruku da pozove
import { db } from './db.js'
import { shopBySlug } from '../src/catalog.js'

export const RULES = {
  bigFirstOrder: 5000, // prva porudžbina preko ovoliko dinara: poziv kupcu pre slanja lokalima
  advance: 10000, // porudžbina preko ovoliko dinara: preporučen avans
  bigQty: 20, // ovoliko komada iste stavke je neobično (osim torti, koje se poručuju po parčetu)
  burstMinutes: 30, // više porudžbina sa istog naloga za ovoliko minuta
  burstCount: 2, // ... ako ih je već ovoliko, nova čeka proveru
}

/** Koliko je kupac porudžbina preuzeo, otkazao i nije preuzeo (za profil kupca i pravila). */
export function customerRecord(userId, phone) {
  const row = db
    .prepare(
      `SELECT
         SUM(status = 'isporučena') delivered,
         SUM(status = 'otkazana') cancelled,
         SUM(status = 'nije preuzeta') noShows,
         COUNT(*) total
       FROM orders WHERE user_id = ? OR phone = ?`,
    )
    .get(userId ?? -1, phone ?? '')
  return { delivered: row.delivered ?? 0, cancelled: row.cancelled ?? 0, noShows: row.noShows ?? 0, total: row.total ?? 0 }
}

/** Ocena kupca za vlasnika: pouzdan, novi, upozorenje, provera, ograničen. */
export function trustOf(record) {
  if (record.noShows >= 3) return { label: 'ograničen', level: 'block' }
  if (record.noShows === 2) return { label: 'obavezna provera', level: 'check' }
  if (record.noShows === 1) return { label: 'upozorenje', level: 'info' }
  if (record.delivered >= 3) return { label: 'pouzdan', level: 'ok' }
  return { label: record.delivered ? 'redovan' : 'novi kupac', level: 'ok' }
}

/**
 * Procena nove porudžbine. Vraća { flags: [{ level, text }], hold, blocked }.
 * hold: porudžbina čeka vlasnika; blocked: ne prima se.
 */
export function assessOrder({ user, shops, total }) {
  const flags = []
  const add = (level, text) => flags.push({ level, text })
  const record = customerRecord(user.id, user.phone)

  // 1) istorija kupca: nepreuzete porudžbine
  if (record.noShows >= 3) add('block', `Kupac ${record.noShows} puta nije preuzeo porudžbinu: nalog je ograničen.`)
  else if (record.noShows === 2) add('check', 'Kupac 2 puta nije preuzeo porudžbinu: obavezna telefonska potvrda.')
  else if (record.noShows === 1) add('info', 'Kupac jednom nije preuzeo porudžbinu (upozorenje).')

  // 2) više porudžbina sa istog naloga u kratkom vremenu
  const recent = db
    .prepare(`SELECT COUNT(*) n FROM orders WHERE (user_id = ? OR phone = ?) AND status != 'otkazana' AND created_at > datetime('now', 'localtime', ?)`)
    .get(user.id, user.phone, `-${RULES.burstMinutes} minutes`).n
  if (recent >= RULES.burstCount) add('check', `Već ${recent} porudžbine sa ovog naloga u poslednjih ${RULES.burstMinutes} min.`)

  // 3) prva porudžbina sa velikim iznosom
  if (!record.delivered && total >= RULES.bigFirstOrder) add('check', `Prva porudžbina ovog kupca, a iznos je ${total} din: pozovite kupca pre slanja lokalima.`)

  // 4) neobično velike količine
  for (const shop of shops) {
    const cakes = shopBySlug(shop.slug)?.slug === 'tortica-989'
    for (const l of shop.lines) {
      if (!cakes && l.qty >= RULES.bigQty) add('check', `Neobično velika količina: ${l.qty}x ${l.name} (${shop.name}).`)
    }
  }

  // 5) avans: velike porudžbine, torte i pokloni, posebni zahtevi
  if (total >= RULES.advance) add('info', `Velika porudžbina (${total} din): preporučen avans.`)
  const special = shops.filter((s) => shopBySlug(s.slug)?.service === 'gifts' && (s.lines.length || s.request))
  if (special.length) add('info', `Torte/pokloni (${special.map((s) => s.name).join(', ')}): avans pre pripreme, po dogovoru.`)

  return {
    flags,
    blocked: flags.some((f) => f.level === 'block'),
    hold: flags.some((f) => f.level === 'check' || f.level === 'block'),
    record,
  }
}
