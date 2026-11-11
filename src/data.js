import { deliveryPrice } from './places.js'
import { FOLK, MODERNA } from './radio-youtube'

export const PHONE = '064 44 77 2 77'

// podaci za pretraživače (SEO) i deljenje linka
export const SITE = {
  name: 'Beep Beep Dostava Negotin',
  title: 'Beep Beep Dostava Negotin | Hrana, lekovi, cveće, torte i sve ostalo do vrata',
  description:
    'Beep Beep dostava od 2020. godine: hrana, piće, namirnice, lekovi, cveće, torte i pokloni. Negotin, okolna sela i šire, sve u termo kutiji. Pozovite 064 44 77 2 77.',
  city: 'Negotin',
  postalCode: '19300',
}

// Podaci o firmi koje upisuje vlasnik. Prazno polje se ne prikazuje na sajtu.
export const BUSINESS = {
  address: 'Trg Đorđa Stanojevića, Negotin', // sa Google mapa
  hours: '', // npr. 'Svaki dan 10 do 23h'
  legal: '', // npr. 'Beep Beep doo, PIB 123456789, MB 12345678, Hajduk Veljkova 10, Negotin'
}

// cena dostave: u Negotinu fiksno, za sela po kilometru (kilometri su u places.js, KM);
// za mesto van spiska cenu javlja dostavljač
export const DELIVERY = {
  city: 500, // din, dostava u Negotinu
  perKm: 120, // din po km do sela
}
export const deliveryPriceOf = (place) => deliveryPrice(place, DELIVERY)

// Radio u zaglavlju: YouTube video (type: 'video') ili plejlista (type: 'playlist').
// Ako neka stanica prestane da radi, zamenite id (deo linka posle v= ili list=).

export const NAV = [
  { href: '#pocetna', label: 'Početna' },
  { href: '#usluge', label: 'Usluge' },
  { href: '#o-nama', label: 'O nama' },
  { href: '#recenzije', label: 'Recenzije' },
  { href: '#pitanja', label: 'Pitanja' },
  { href: '#kontakt', label: 'Kontakt' },
]

// kratke činjenice u crvenoj kartici na početnom ekranu
export const HERO_STATS = [
  ['Sve', 'od pice do ključeva'],
  ['I šire', 'Negotin, sela i dalje'],
  ['Keš', 'plaćate kad preuzmete'],
]

// stanice Beep Beep radija. type 'youtube': YouTube plejlista (yt.list) ili prenos uživo (yt.video), plejer mora da se vidi;
// type 'own': naš program iz public/radio/pesme/<key> sa našom špicom između pesama (spisak pravi `npm run radio`)
export const RADIO = [
  { key: 'moderna', label: 'Moderna', desc: 'Novi domaći hitovi', emoji: '🎧', type: 'youtube', yt: { videos: MODERNA } },
  { key: 'strana', label: 'Strana', desc: 'Strana muzika uz Beep Beep špicu', emoji: '🌍', type: 'own' },
  { key: 'ambijent', label: 'Ambijent', desc: 'Opuštena muzika za svaki trenutak', emoji: '🎶', type: 'own' },
  { key: 'folk', label: 'Folk', desc: 'Narodna i folk muzika', emoji: '🎤', type: 'youtube', yt: { videos: FOLK } },
]

export const PARTNERS = ['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4', 'Partner 5', 'Partner 6']

// sajtovi partnera (ključ je ime fajla logoa u src/assets/partners). Klik na logo u traci "Naši partneri"
// otvara ovaj sajt; ako sajta nema, a partner ima meni kod nas, otvara se njegov meni na našem sajtu.
// Upisuju se samo provereni, zvanični sajtovi (može i Facebook ili Instagram stranica).
export const PARTNER_LINKS = {
  Bajka: 'https://picerijabajkanegotin.com',
}

// usluge: naslov, kratak podnaslov (lead, crveno) i slogan (plavo) ispod slike
export const SERVICES = [
  {
    key: 'food',
    label: 'hrana',
    title: 'Dostava hrane',
    lead: 'Vaše omiljeno jelo, na vašoj adresi!',
    slogan: 'Beep Beep dostava, kada vam se jede, a ne izlazi!',
  },
  {
    key: 'market',
    label: 'namirnice',
    title: 'Dostava pića i namirnica',
    lead: 'Sve što vam treba, bez odlaska u kupovinu!',
    slogan: 'Vi pravite spisak. Mi završavamo posao!',
  },
  {
    key: 'flowers',
    label: 'cveće',
    title: 'Dostava cveća',
    lead: 'Iznenađenja koja stižu pravo na vrata!',
    slogan: 'Vi birate cvet. Mi dostavljamo osmeh!',
  },
  {
    key: 'gifts',
    label: 'torte i pokloni',
    title: 'Dostava torti i poklona',
    lead: 'Svaki poseban trenutak zaslužuje posebno iznenađenje!',
    slogan: 'Kilometri nisu prepreka kada želite nekoga da obradujete!',
  },
  {
    key: 'meds',
    label: 'lekovi',
    title: 'Dostava lekova',
    lead: 'Kada vam je potrebno, a ne možete sami do apoteke!',
    slogan: 'Manje brige oko odlaska. Više vremena za ono što je važno!',
  },
  {
    key: 'other',
    label: 'za firme',
    title: 'Usluge za firme',
    lead: 'Pazar u banku, dokumenta na pravo mesto, a vi ostajete u radnji!',
    slogan: 'Vi vodite posao, a mi završavamo obaveze!',
  },
]

// posebna usluga, istaknuta u sekciji Usluge
// premium usluga, istaknuta crvena kartica ispod usluga
export const PREMIUM = {
  badge: 'Premium usluga',
  title: 'Dostava iz inostranstva',
  text: 'Živite u inostranstvu, a želite da obradujete nekog bliskog u Srbiji? Poručite preko nas hranu, cveće, tortu ili poklon, a mi to donosimo na njegova vrata, uz vašu poruku.',
  steps: ['Vi poručite odakle god da ste', 'Mi kupimo i spakujemo', 'Vaš bližnji dobija na vratima'],
}

// više adresa u jednoj vožnji (napomena u premium kartici i u korpi)
export const EXTRA_STOP = {
  title: 'Dodatno zaustavljanje',
  note: 'Svako dodatno zaustavljanje se posebno naplaćuje.',
  hint: 'Treba da svratimo na više mesta, od jednog do drugog? Može, u istoj vožnji.',
}

// recenzije sa Google mapa (prepisane iz originala, samo su dodate kvačice)
export const REVIEWS_URL = 'https://www.google.com/maps?cid=16704170277850894301'
export const RATING = { score: '5,0', count: 42 }
export const REVIEWS = [
  {
    name: 'Dragana Lukić',
    text: 'Brzi, tačni, ljubazni, kulturni, vaspitani. Svaka čast. Sve pohvale.',
  },
  {
    name: 'Nikola Pešić',
    text: 'Najbolje u gradu i šire. Moje lično iskustvo: brzi, i najbitnije, dostavljač je gotivac. Jaka 10.',
  },
  {
    name: 'Cvećara Cuca',
    text: 'Ne postoje reči kojima bih ovog čoveka nahvalio... ukratko: brz, tačan, ažuran... i pre svega ljubazan!',
  },
  {
    name: 'Vuk Mijucić',
    text: 'Odličan 5! Brzina, usluga, ljubaznost. Od mene ozbiljna preporuka.',
  },
  {
    name: 'Adrian Adi',
    text: 'Brza i dobra usluga, ljubaznost, preporučujem!',
  },
  {
    name: 'Nenad Dumitrikić',
    text: 'Odlična saradnja, moje iskrene preporuke i poverenje.',
  },
  {
    name: 'Tomislav Milenković',
    text: 'Prava stvar. I za mlade i za stare, za sve uzraste.',
  },
  {
    name: 'Marko Kulc',
    text: 'Sve preporuke, brzi, tačni i profesionalni.',
  },
  {
    name: 'Snežana Jevtić',
    text: 'Najjača dostava na svetu, sve pohvale! 👍',
  },
  {
    name: 'Lazar Kostić',
    text: 'Odlična dostava, brz, pristojan, pravedan.',
  },
  {
    name: 'Slavka Ranković',
    text: 'Dostava je prva liga, brzi i efikasni.',
  },
  {
    name: 'Neda Grekulović',
    text: 'Super brzi, najbolji, najuslužniji! 😊',
  },
  {
    name: 'Stefan Vojinović',
    text: 'Brza dostava, svaka čast!',
  },
  {
    name: 'Ivana Simonović',
    text: 'Najbolja dostava u gradu!',
  },
  {
    name: 'Filip Dobrić',
    text: 'Jedini u gradu!',
  },
]

// česta pitanja, po grupama (redosled je redosled na sajtu)
export const FAQ_GROUPS = [
  [
    'Porudžbina',
    [
      ['Kako da naručim?', 'Naručite preko sajta, pozovite nas ili pišite na WhatsApp. Recite šta vam treba i gde, a mi vam odmah kažemo cenu i kada stižemo.'],
      ['Šta sve dostavljate?', 'Hranu, piće, namirnice, lekove, cveće, torte i poklone. Za firme nosimo pazar u banku, dokumenta i pakete i plaćamo račune. Ako staje u termo kutiju, vozimo ga.'],
      ['Dostavljate li alkohol i cigarete?', 'Ne.'],
    ],
  ],
  [
    'Cena i plaćanje',
    [
      ['Koliko košta dostava?', 'U Negotinu dostava košta 500 dinara. Za sela se plaća 120 dinara po kilometru od Negotina, a tačnu cenu vidite pri naručivanju, čim izaberete selo.'],
      ['Može li više adresa u jednoj vožnji?', 'Može. Kurir staje gde god treba, a svako dodatno zaustavljanje se posebno naplaćuje.'],
    ],
  ],
  [
    'Dostava',
    [
      ['Dostavljate li van Negotina?', 'Da. Pored grada vozimo po okolnim selima i šire. Pozovite i dogovorićemo se.'],
      ['Koliko brzo stižete?', 'Zavisi od lokala i gužve. Tačno vreme vam kažemo kada potvrdimo porudžbinu, i držimo se toga.'],
      ['Da li je moguća dostava iz inostranstva?', 'Jeste, to je naša premium usluga: iz inostranstva poručite hranu, cveće, tortu ili poklon za nekog bliskog, a mi dostavljamo na njegovu adresu u Srbiji. Pišite nam na WhatsApp i dogovaramo detalje.'],
    ],
  ],
]

// ista pitanja u jednoj listi (za Google, FAQPage)
export const FAQ = FAQ_GROUPS.flatMap(([, items]) => items)
