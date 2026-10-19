export const PHONE = '064 44 77 277'

// podaci za pretraživače (SEO) i deljenje linka
export const SITE = {
  name: 'Beep Beep Dostava Negotin',
  title: 'Beep Beep Dostava Negotin | Hrana, lekovi, cveće, torte i sve ostalo do vrata',
  description:
    'Beep Beep dostava od 2020. godine: hrana, piće, namirnice, lekovi, cveće, torte i pokloni. Negotin, okolna sela i šire, sve u termo kutiji. Pozovite 064 44 77 277.',
  city: 'Negotin',
  postalCode: '19300',
}

// Podaci o firmi koje upisuje vlasnik. Prazno polje se ne prikazuje na sajtu.
export const BUSINESS = {
  address: 'Trg Đorđa Stanojevića, Negotin', // sa Google mapa
  hours: '', // npr. 'Svaki dan 10 do 23h'
  legal: '', // npr. 'Beep Beep doo, PIB 123456789, MB 12345678, Hajduk Veljkova 10, Negotin'
}

// cena dostave: u Negotinu fiksno; za sela i ostala mesta cenu javlja dostavljač (mesta su u places.js)
export const DELIVERY = {
  zones: {
    grad: { label: 'U Negotinu', price: 400 },
    selo: { label: 'Okolna sela i van grada', price: null }, // cenu javlja dostavljač
  },
}

export const NAV = [
  { href: '#pocetna', label: 'Početna' },
  { href: '#o-nama', label: 'O nama' },
  { href: '#usluge', label: 'Usluge' },
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

export const PARTNERS = ['Partner 1', 'Partner 2', 'Partner 3', 'Partner 4', 'Partner 5', 'Partner 6']

export const SERVICES = [
  {
    key: 'food',
    label: 'hrana',
    title: 'Dostava hrane',
    text: 'Pica, roštilj, palačinke, šta god vam se jede. Iz restorana pravo u termo kutiju, pa pravo na vaš sto.',
  },
  {
    key: 'market',
    label: 'namirnice',
    title: 'Piće i namirnice',
    text: 'Hleb, mleko, voda, sokovi i sve iz marketa, bez guranja na kasi. Alkohol i cigarete ne dostavljamo.',
  },
  {
    key: 'meds',
    label: 'lekovi',
    title: 'Dostava lekova',
    text: 'Bolesni ste, a apoteka je na drugom kraju grada? Ostanite u krevetu, mi idemo po lekove umesto vas.',
  },
  {
    key: 'flowers',
    label: 'cveće',
    title: 'Cveće',
    text: 'Buket ili saksija iz cvećare, za rođendan, izvinjenje ili samo tako. Vi smislite poruku, mi ćemo zvono.',
  },
  {
    key: 'gifts',
    label: 'torte i pokloni',
    title: 'Torte i pokloni',
    text: 'Torta stiže cela, poklon stiže na vreme. Iznenađenje ostaje vaše, mi samo pazimo da ne zakasni.',
  },
  {
    key: 'other',
    label: 'ostale dostave',
    title: 'Ostale dostave',
    text: 'Isporučujemo sve: dokumenta, lične stvari, pa čak i zaboravljene ključeve. Javite se i uverite se zašto je dostava sa nama najpraktičnija.',
  },
]

// posebna usluga, istaknuta u sekciji Usluge
export const EXTRA_STOP = {
  title: 'Dodatno zaustavljanje',
  text: 'Apoteka, pa pekara, pa paket kod komšije? Jedan kurir, jedna vožnja, više adresa. Vi nabrojite gde treba da svratimo, mi obilazimo redom.',
  note: 'Svako dodatno zaustavljanje se posebno naplaćuje.',
}

// recenzije sa Google mapa (prepisane iz originala, samo su dodate kvačice)
export const REVIEWS_URL = 'https://www.google.com/maps?cid=16704170277850894301'
export const RATING = { score: '5,0', count: 43 }
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
]

// česta pitanja, po grupama (redosled je redosled na sajtu)
export const FAQ_GROUPS = [
  [
    'Porudžbina',
    [
      ['Kako da naručim?', 'Pozovite nas ili pišite na Viber. Recite šta vam treba i gde, a mi vam odmah kažemo cenu i kada stižemo.'],
      ['Šta sve dostavljate?', 'Hranu, piće, namirnice, lekove, cveće, torte, poklone, dokumenta, ključeve... Ako staje u termo kutiju, vozimo ga.'],
      ['Dostavljate li alkohol i cigarete?', 'Ne.'],
    ],
  ],
  [
    'Cena i plaćanje',
    [
      ['Koliko košta dostava?', 'U Negotinu dostava košta 400 dinara. Za okolna sela i dalje cenu vam javlja dostavljač pre nego što krene, bez iznenađenja.'],
      ['Kako se plaća?', 'Gotovinom, kada vam kurir preda porudžbinu.'],
      ['Može li više adresa u jednoj vožnji?', 'Može. Kurir staje gde god treba, a svako dodatno zaustavljanje se posebno naplaćuje.'],
    ],
  ],
  [
    'Dostava',
    [
      ['Dostavljate li van Negotina?', 'Da. Pored grada vozimo po okolnim selima i šire. Pozovite i dogovorićemo se.'],
      ['Koliko brzo stižete?', 'Zavisi od lokala i gužve. Tačno vreme vam kažemo kada potvrdimo porudžbinu, i držimo se toga.'],
      ['Da li hrana stiže topla?', 'Stiže. Svaka porudžbina putuje u termo kutiji, pa toplo ostaje toplo, a hladno ostaje hladno.'],
    ],
  ],
]

// ista pitanja u jednoj listi (za Google, FAQPage)
export const FAQ = FAQ_GROUPS.flatMap(([, items]) => items)
