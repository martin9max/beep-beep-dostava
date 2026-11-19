// Naslov, opis i adresa (canonical) za svaku stranu sajta, za Google i za pregled linka pri deljenju.
// Koristi ga scripts/prerender.mjs: svaka strana dobija svoj gotov HTML sa ovim podacima.
// Ovde ne sme biti import-a slika (čita se i van Vite-a).
import { SERVICES, SITE } from './data.js'
import { ALL_ITEMS, SHOPS } from './catalog.js'

const BRAND = 'Beep Beep Dostava Negotin'
const PHONE = '064 44 77 2 77'

// opis koji Google prikazuje ispod naslova: do oko 160 znakova
const clip = (text, max = 158) => (text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max - 1)) + '…')
const list = (items) => (items.length > 1 ? `${items.slice(0, -1).join(', ')} i ${items.at(-1)}` : items[0] ?? '')

// reči po kojima ljudi traže svaku uslugu
const SERVICE_SEO = {
  food: { title: 'Dostava hrane Negotin: pica, burger, roštilj, palačinke', what: 'hranu' },
  market: { title: 'Dostava namirnica i pića Negotin: market do vrata', what: 'namirnice i piće' },
  flowers: { title: 'Dostava cveća Negotin: buketi i aranžmani', what: 'cveće' },
  gifts: { title: 'Dostava torti i poklona Negotin', what: 'torte i poklone' },
  meds: { title: 'Dostava lekova iz apoteke Negotin', what: 'lekove iz apoteke' },
  other: { title: 'Usluge za firme Negotin: pazar u banku, dokumenta, računi', what: 'usluge za firme' },
}

/** Strane koje Google treba da vidi (idu u sitemap i dobijaju svoj gotov HTML). */
export function indexedPaths() {
  return ['/', ...SERVICES.map((s) => `/naruci/${s.key}`), ...SHOPS.map((s) => `/lokal/${s.slug}`), '/radio', '/uslovi', '/privatnost']
}

/** { title, description, path } za stranu, ili null ako strana ne postoji. path je glavna adresa (canonical). */
export function pageMeta(path) {
  if (path === '/') return { title: SITE.title, description: SITE.description, path: '/' }

  const [, first, second] = path.split('/')
  if (first === 'naruci') {
    const service = SERVICES.find((s) => s.key === second) ?? SERVICES[0]
    const seo = SERVICE_SEO[service.key] ?? { title: service.title, what: service.title.toLowerCase() }
    const shops = SHOPS.filter((s) => s.service === service.key).map((s) => s.name)
    return {
      title: `${seo.title} | Beep Beep`,
      description: clip(
        `${service.lead} Poručite ${seo.what} preko sajta${service.key === 'food' && shops.length ? ` iz lokala ${list(shops)}` : ''}, Beep Beep donosi na vašu adresu u Negotinu i okolini. ${PHONE}.`,
      ),
      path: `/naruci/${service.key}`,
    }
  }
  if (first === 'lokal') {
    const shop = SHOPS.find((s) => s.slug === second)
    if (!shop) return null
    const items = ALL_ITEMS.filter((i) => i.shop.slug === shop.slug)
      .slice(0, 4)
      .map((i) => i.item.name)
    const food = shop.service === 'food'
    return {
      title: `${shop.name} Negotin: ${food ? 'meni i dostava hrane' : 'dostava na adresu'} | Beep Beep`,
      description: clip(
        `${food ? `Meni ${shop.name}` : shop.name}${items.length ? `: ${list(items)}` : ''} i još mnogo toga. Poručite preko sajta, Beep Beep dostavlja u Negotinu i okolini. ${PHONE}.`,
      ),
      path: `/lokal/${shop.slug}`,
    }
  }
  const fixed = {
    radio: ['Beep Beep radio: muzika dok čekate dostavu', 'Prvi radio u Negotinu: Moderna, Strana, Domaća zabavna i Folk stanica, besplatno na sajtu Beep Beep dostave.'],
    uslovi: [`Uslovi korišćenja | ${BRAND}`, 'Uslovi korišćenja sajta i poručivanja: porudžbina, cene i dostava, plaćanje, otkazivanje i reklamacije.'],
    privatnost: [`Politika privatnosti | ${BRAND}`, 'Koje podatke prikuplja Beep Beep dostava, zašto, koliko ih čuva, kome ih daje i koja su vaša prava.'],
  }[first]
  return fixed ? { title: fixed[0], description: fixed[1], path: `/${first}` } : null
}
