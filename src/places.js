// Mesta za dostavu. Koristi ih i server (server/api.js), pa ovde nema import-a slika.
// Negotin: fiksna cena dostave (DELIVERY u data.js). Sela i ostala mesta: cenu javlja dostavljač.
import { normalize } from './catalog.js'

export const CITY = 'Negotin'

// naselja opštine Negotin (bez samog grada)
export const VILLAGES = [
  'Aleksandrovac', 'Brestovac', 'Braćevac', 'Bratujevac', 'Bukovče', 'Velika Kamenica', 'Vidrovac', 'Vratna',
  'Dupljane', 'Dušanovac', 'Jabukovac', 'Jasenica', 'Karbulovo', 'Kobišnica', 'Kovilovo', 'Mala Kamenica',
  'Malajnica', 'Miloševo', 'Mihajlovac', 'Mokranje', 'Plavna', 'Popovica', 'Prahovo', 'Radujevac', 'Rajac',
  'Rečka', 'Rogljevo', 'Samarinovac', 'Sikole', 'Slatina', 'Smedovac', 'Srbovo', 'Tamnič', 'Trnjane',
  'Urovica', 'Crnomasnica', 'Čubra', 'Šarkamen', 'Štubik', 'Bukovo', 'Badnjevo', 'Kusjak',
].sort((a, b) => a.localeCompare(b, 'sr-Latn'))

// Udaljenost od centra Negotina do sela, putem (km, zaokruženo). Izračunato preko OpenStreetMap
// rute; vlasnik može da ispravi broj ako zna tačnije. Cena dostave = km × DELIVERY.perKm.
export const KM = {
  'Aleksandrovac': 25, 'Badnjevo': 3, 'Bratujevac': 5, 'Braćevac': 29, 'Brestovac': 17, 'Bukovo': 5,
  'Bukovče': 7, 'Crnomasnica': 27, 'Dupljane': 13, 'Dušanovac': 11, 'Jabukovac': 29, 'Jasenica': 13,
  'Karbulovo': 13, 'Kobišnica': 7, 'Kovilovo': 23, 'Mala Kamenica': 17, 'Malajnica': 24, 'Mihajlovac': 21,
  'Miloševo': 4, 'Mokranje': 11, 'Plavna': 29, 'Popovica': 26, 'Prahovo': 9, 'Radujevac': 13, 'Rajac': 23,
  'Rečka': 14, 'Rogljevo': 20, 'Samarinovac': 5, 'Sikole': 24, 'Slatina': 24, 'Smedovac': 22, 'Srbovo': 6,
  'Tamnič': 30, 'Trnjane': 19, 'Urovica': 29, 'Velika Kamenica': 42, 'Vidrovac': 7, 'Vratna': 34, 'Čubra': 9,
  'Šarkamen': 20, 'Štubik': 21,
  Kusjak: null, // nema ga na mapi; cena je stalna, vidi FIXED_PRICE
}

// Sela sa stalnom cenom dostave (vlasnik je odredio), umesto km × cena po km
export const FIXED_PRICE = { Badnjevo: 500, 'Miloševo': 600, Samarinovac: 720, Vidrovac: 850, Kusjak: 1200 }
// napomena uz ime sela u izboru mesta (npr. dokle važi cena)
export const PLACE_NOTE = { Kusjak: 'do plaže' }

/**
 * Cena dostave za mesto: Negotin fiksno, selo sa stalnom cenom (FIXED_PRICE) ta cena, ostala sela km × cena po km,
 * drugo mesto (ili selo bez upisanih km) null = cenu javlja dostavljač.
 */
export function deliveryPrice(place, { city, perKm }) {
  if (!place) return undefined
  if (zoneOf(place) === 'grad') return city
  if (FIXED_PRICE[cleanPlace(place)]) return FIXED_PRICE[cleanPlace(place)]
  const km = KM[cleanPlace(place)]
  return km ? km * perKm : null
}

/** Opis cene za prikaz: "23 km × 120 din" (za selo sa stalnom cenom ništa). */
export const deliveryNote = (place, perKm) => {
  if (FIXED_PRICE[cleanPlace(place)]) return ''
  const km = KM[cleanPlace(place)]
  return km ? `${km} km × ${perKm} din` : ''
}

/** 'grad' za Negotin, 'selo' za sve ostalo. */
export const zoneOf = (place) => (normalize(place || '') === normalize(CITY) ? 'grad' : 'selo')

/** Ispravno mesto: Negotin, selo sa spiska, ili drugo mesto koje je kupac upisao. */
export const cleanPlace = (place) => {
  const value = typeof place === 'string' ? place.trim().slice(0, 60) : ''
  const known = [CITY, ...VILLAGES].find((p) => normalize(p) === normalize(value))
  return known ?? value
}

export const isKnownPlace = (place) => [CITY, ...VILLAGES].includes(place)

/** Za stare naloge bez upisanog mesta: traži ime mesta u adresi ("Svetog Save 5 Vidrovac" -> Vidrovac). */
export function guessPlace(address) {
  const text = normalize(address || '')
  return [...VILLAGES, CITY].find((p) => new RegExp(`\\b${normalize(p)}\\b`).test(text)) ?? ''
}

/** Adresa za prikaz i kurira: "Svetog Save 5, Vidrovac". */
export const fullAddress = (address, place) =>
  place && !normalize(address).includes(normalize(place)) ? `${address}, ${place}` : address

/**
 * Link za Google mape (kurir otvara na telefonu). Ako je kupac poslao tačnu lokaciju sa telefona, pin je baš tu;
 * inače Google traži adresu po tekstu, a za sela se dodaje "Negotin" da ne nađe istoimeno selo drugde u Srbiji
 * (na selu ulice i brojevi često nisu na Google mapama, zato je tačna lokacija mnogo bolja).
 */
export const mapsLink = (address, place, coords) => {
  if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) return coordsLink(coords.lat, coords.lng)
  const village = zoneOf(place) === 'selo' && VILLAGES.some((v) => normalize(v) === normalize(place || ''))
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fullAddress(address, place)}${village ? ', Negotin' : ''}, Srbija`)}`
}

/** Pin na tačnim koordinatama (lokacija sa telefona kupca). */
export const coordsLink = (lat, lng) => `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`

/** Koordinate iz pregledača: brojevi u granicama Srbije (inače se ne prihvataju). */
export const cleanCoords = (lat, lng) => {
  const a = Number(lat)
  const b = Number(lng)
  return Number.isFinite(a) && Number.isFinite(b) && a > 41.8 && a < 46.3 && b > 18.8 && b < 23.1 ? { lat: a, lng: b } : null
}

/**
 * U Negotinu adresa mora imati broj kuće (ili "bb" ako ga nema), da ga kupac ne bi upisao samo u napomenu
 * i da dostavljač nađe kuću. Na selu može i opis kuće. Vraća poruku greške ili prazno.
 */
export const addressProblem = (address, place) =>
  zoneOf(place) === 'grad' && !/\d|\bbb\b/i.test(address || '')
    ? 'Upišite i broj kuće u adresu (npr. Hajduk Veljkova 10). Ako kuća nema broj, upišite bb.'
    : ''
