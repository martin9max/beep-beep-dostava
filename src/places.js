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
  'Urovica', 'Crnomasnica', 'Čubra', 'Šarkamen', 'Štubik',
].sort((a, b) => a.localeCompare(b, 'sr-Latn'))

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

/** Link za Google mape (kurir otvara na telefonu). */
export const mapsLink = (address, place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${fullAddress(address, place)}, Srbija`)}`
