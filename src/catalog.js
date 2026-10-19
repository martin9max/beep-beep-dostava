// Lokali, kategorije i digitalni meniji za stranicu "Naruči" (/naruci).
// Ovaj fajl čita i server (server/api.js) da bi sam izračunao cenu porudžbine,
// pa ovde ne sme biti import-a slika ni drugih fajlova.
//
// !!! MENIJI I CENE SU PRIMER. Zamenite ih pravim menijima lokala. !!!
//
// Cena stavke:
//   price: 650                       jedna cena u dinarima
//   price: [['32 cm', 650], ['50 cm', 1250]]   više veličina
//   price: null                      "po računu" (market, apoteka), kurir plati pa vi vratite
// Lokal sa `request` ima i polje gde kupac sam napiše šta mu treba.
//
// Slike: src/assets/photos/kategorije/<key>.jpg i src/assets/photos/lokali/<slug>.jpg
// (dok ih nema, prikazuje se emoji na obojenoj pozadini).

// kategorije po usluzi (key usluge je isti kao u SERVICES u data.js)
export const CATEGORIES = {
  food: [
    { key: 'burger', label: 'Burger', emoji: '🍔' },
    { key: 'pica', label: 'Pica', emoji: '🍕' },
    { key: 'palacinke', label: 'Palačinke', emoji: '🥞' },
    { key: 'rostilj', label: 'Roštilj', emoji: '🍖' },
    { key: 'giros', label: 'Giros i tortilje', emoji: '🌯' },
    { key: 'pasta', label: 'Pasta', emoji: '🍝' },
    { key: 'sendvic', label: 'Sendviči', emoji: '🥪' },
    { key: 'salata', label: 'Salate', emoji: '🥗' },
    { key: 'dorucak', label: 'Doručak', emoji: '🍳' },
    { key: 'kuvano', label: 'Kuvana jela', emoji: '🍲' },
    { key: 'desert', label: 'Deserti', emoji: '🍨' },
  ],
  market: [
    { key: 'pekara', label: 'Hleb i peciva', emoji: '🥖' },
    { key: 'mlecno', label: 'Mleko i mlečno', emoji: '🥛' },
    { key: 'pice', label: 'Voda i sokovi', emoji: '🧃' },
    { key: 'voce', label: 'Voće i povrće', emoji: '🍎' },
    { key: 'slatkisi', label: 'Slatkiši i grickalice', emoji: '🍫' },
    { key: 'kafa', label: 'Kafa i čaj', emoji: '☕' },
    { key: 'higijena', label: 'Higijena', emoji: '🧴' },
  ],
  meds: [
    { key: 'recept', label: 'Lekovi na recept', emoji: '💊' },
    { key: 'bezrecepta', label: 'Bez recepta', emoji: '🩹' },
    { key: 'vitamini', label: 'Vitamini', emoji: '🍊' },
    { key: 'bebe', label: 'Za bebe', emoji: '🍼' },
  ],
  flowers: [
    { key: 'buketi', label: 'Buketi', emoji: '💐' },
    { key: 'ruze', label: 'Ruže', emoji: '🌹' },
    { key: 'saksije', label: 'Saksijsko cveće', emoji: '🪴' },
  ],
  gifts: [
    { key: 'cokoladne', label: 'Čokoladne torte', emoji: '🍫' },
    { key: 'dvesprata', label: 'Torte na dva sprata', emoji: '🎂' },
    { key: 'pokloni', label: 'Pokloni', emoji: '🎁' },
  ],
  other: [
    { key: 'dokumenta', label: 'Dokumenta', emoji: '📄' },
    { key: 'paketi', label: 'Paketi', emoji: '📦' },
  ],
}

export const SHOPS = [
  // ---------------- HRANA ----------------
  {
    slug: 'picerija-kastelo',
    name: 'Picerija Kastelo',
    service: 'food',
    emoji: '🍕',
    about: 'Pice iz peći, sendviči i pasta.',
    menu: [
      {
        title: 'Pice',
        cat: 'pica',
        items: [
          { id: 'margarita', name: 'Margarita', desc: 'Pelat, sir, origano', price: [['32 cm', 650], ['50 cm', 1300]] },
          { id: 'kapricoza', name: 'Kapričoza', desc: 'Pelat, sir, šunka, pečurke', price: [['32 cm', 790], ['50 cm', 1550]] },
          { id: 'kastelo', name: 'Kastelo specijal', desc: 'Pelat, sir, kulen, slanina, jaje, ljuta papričica', price: [['32 cm', 890], ['50 cm', 1750]] },
          { id: 'cetiri-sira', name: 'Četiri sira', desc: 'Pavlaka, gauda, gorgonzola, mocarela, parmezan', price: [['32 cm', 920], ['50 cm', 1800]] },
          { id: 'vegetarijana', name: 'Vegetarijana', desc: 'Pelat, sir, paprika, tikvice, masline, kukuruz', price: [['32 cm', 760], ['50 cm', 1480]] },
        ],
      },
      {
        title: 'Sendviči',
        cat: 'sendvic',
        items: [
          { id: 'sendvic-sunka', name: 'Sendvič šunka-sir', desc: 'Domaći hleb, šunka, sir, salata, majonez', price: 390 },
          { id: 'sendvic-pileci', name: 'Pileći sendvič', desc: 'Pileći file sa roštilja, sir, povrće, tartar', price: 480 },
        ],
      },
      {
        title: 'Pasta',
        cat: 'pasta',
        items: [
          { id: 'karbonara', name: 'Karbonara', desc: 'Pančeta, žumance, parmezan', price: 720 },
          { id: 'bolonjeze', name: 'Bolonjeze', desc: 'Sos od mlevenog mesa i paradajza', price: 690 },
        ],
      },
      {
        title: 'Salate',
        cat: 'salata',
        items: [{ id: 'cezar', name: 'Cezar salata', desc: 'Piletina, zelena salata, kruton, parmezan, cezar dresing', price: 640 }],
      },
      {
        title: 'Dodaci',
        items: [
          { id: 'kecap', name: 'Kečap ili pavlaka', price: 60 },
          { id: 'coca-cola', name: 'Coca-Cola 0,5 l', price: 180 },
        ],
      },
    ],
  },
  {
    slug: 'kafanica',
    name: 'Kafanica',
    service: 'food',
    emoji: '🍖',
    about: 'Roštilj, domaća kuvana jela i doručak.',
    menu: [
      {
        title: 'Roštilj',
        cat: 'rostilj',
        items: [
          { id: 'cevapi', name: 'Ćevapi', desc: 'Lepinja, luk, kajmak', price: [['5 kom', 520], ['10 kom', 890]] },
          { id: 'pljeskavica', name: 'Pljeskavica', desc: 'U lepinji, sa prilozima po izboru', price: [['200 g', 560], ['300 g', 720]] },
          { id: 'gurmanska', name: 'Gurmanska pljeskavica', desc: 'Punjena kačkavaljem i slaninom', price: 790 },
          { id: 'mesano-meso', name: 'Mešano meso', desc: 'Ćevapi, pljeskavica, kobasica, vešalica, pomfrit (za 2 osobe)', price: 1890 },
          { id: 'pileca-krilca', name: 'Pileća krilca', desc: '500 g, sa pomfritom', price: 760 },
        ],
      },
      {
        title: 'Burgeri',
        cat: 'burger',
        items: [{ id: 'kafanski-burger', name: 'Kafanski burger', desc: 'Domaća pljeskavica, kajmak, luk, ajvar u somunu', price: 620 }],
      },
      {
        title: 'Kuvana jela',
        cat: 'kuvano',
        items: [
          { id: 'pasulj', name: 'Prebranac sa kobasicom', price: 590 },
          { id: 'sarma', name: 'Sarma', desc: '3 komada, sa hlebom', price: 650 },
          { id: 'gulas', name: 'Teleći gulaš', price: 720 },
        ],
      },
      {
        title: 'Doručak',
        cat: 'dorucak',
        items: [
          { id: 'kajgana', name: 'Kajgana sa slaninom', desc: '3 jajeta, hleb', price: 420 },
          { id: 'omlet', name: 'Omlet sa sirom i šunkom', price: 450 },
        ],
      },
      {
        title: 'Salate',
        cat: 'salata',
        items: [
          { id: 'sopska', name: 'Šopska salata', price: 320 },
          { id: 'srpska', name: 'Srpska salata', price: 290 },
        ],
      },
    ],
  },
  {
    slug: 'life-picerija',
    name: 'Life picerija',
    service: 'food',
    emoji: '🍔',
    about: 'Pice, burgeri, giros i slatke palačinke.',
    menu: [
      {
        title: 'Pice',
        cat: 'pica',
        items: [
          { id: 'life-margarita', name: 'Margarita', desc: 'Pelat, mocarela, bosiljak', price: [['30 cm', 620], ['45 cm', 1150]] },
          { id: 'life-specijal', name: 'Life specijal', desc: 'Pelat, sir, šunka, kulen, pečurke, masline', price: [['30 cm', 850], ['45 cm', 1600]] },
          { id: 'life-ljuta', name: 'Ljuta', desc: 'Pelat, sir, čorizo, feferoni, luk', price: [['30 cm', 820], ['45 cm', 1550]] },
        ],
      },
      {
        title: 'Burgeri',
        cat: 'burger',
        items: [
          { id: 'cheeseburger', name: 'Čizburger', desc: '150 g junetine, čedar, kiseli krastavac, sos', price: 590 },
          { id: 'dupli', name: 'Dupli burger', desc: '2 × 150 g junetine, dupli čedar, slanina', price: 820 },
          { id: 'chicken-burger', name: 'Pileći burger', desc: 'Pohovani file, salata, majonez', price: 560 },
        ],
      },
      {
        title: 'Giros i tortilje',
        cat: 'giros',
        items: [
          { id: 'giros', name: 'Giros pileći', desc: 'Pita, piletina, pomfrit, caciki', price: 520 },
          { id: 'tortilja', name: 'Tortilja', desc: 'Piletina, sir, povrće, ljuti sos', price: 540 },
        ],
      },
      {
        title: 'Sendviči',
        cat: 'sendvic',
        items: [{ id: 'life-sendvic', name: 'Topli sendvič', desc: 'Šunka, sir, kečap', price: 350 }],
      },
      {
        title: 'Palačinke',
        cat: 'palacinke',
        items: [
          { id: 'life-nutela', name: 'Palačinka nutela', price: 320 },
          { id: 'life-plazma', name: 'Nutela + plazma', price: 360 },
        ],
      },
    ],
  },
  {
    slug: 'pastizza',
    name: 'Pastizza',
    service: 'food',
    emoji: '🍝',
    about: 'Italijanska kuhinja: pasta, pica i deserti.',
    menu: [
      {
        title: 'Pasta',
        cat: 'pasta',
        items: [
          { id: 'pz-karbonara', name: 'Špagete karbonara', price: 760 },
          { id: 'pz-pesto', name: 'Penne pesto', desc: 'Bosiljak, pinjoli, parmezan, piletina', price: 790 },
          { id: 'pz-quattro', name: 'Njoke četiri sira', price: 820 },
          { id: 'pz-lazanje', name: 'Lazanje', desc: 'Bolonjeze sos, bešamel', price: 850 },
        ],
      },
      {
        title: 'Pice',
        cat: 'pica',
        items: [
          { id: 'pz-prsuta', name: 'Pica pršuta', desc: 'Pelat, mocarela, pršuta, rukola', price: [['32 cm', 920], ['50 cm', 1790]] },
          { id: 'pz-tuna', name: 'Tuna', desc: 'Pelat, mocarela, tunjevina, luk', price: [['32 cm', 880], ['50 cm', 1700]] },
        ],
      },
      {
        title: 'Salate',
        cat: 'salata',
        items: [{ id: 'pz-kaprese', name: 'Kaprese', desc: 'Paradajz, mocarela, bosiljak', price: 590 }],
      },
      {
        title: 'Deserti',
        cat: 'desert',
        items: [
          { id: 'tiramisu', name: 'Tiramisu', price: 420 },
          { id: 'panakota', name: 'Panakota', desc: 'Sa šumskim voćem', price: 380 },
        ],
      },
    ],
  },
  {
    slug: 'la-moara',
    name: 'La Moara',
    service: 'food',
    emoji: '🥞',
    about: 'Slatke i slane palačinke, vafli i doručak.',
    menu: [
      {
        title: 'Slatke palačinke',
        cat: 'palacinke',
        items: [
          { id: 'lm-nutela', name: 'Nutela', price: 330 },
          { id: 'lm-nutela-banana', name: 'Nutela i banana', price: 380 },
          { id: 'lm-plazma', name: 'Nutela, plazma, šlag', price: 400 },
          { id: 'lm-dzem', name: 'Džem od šljiva', price: 260 },
          { id: 'lm-moara', name: 'La Moara specijal', desc: 'Bela čokolada, maline, keks, šlag', price: 450 },
        ],
      },
      {
        title: 'Slane palačinke',
        cat: 'palacinke',
        items: [
          { id: 'lm-slana', name: 'Šunka, sir, pečurke', price: 420 },
          { id: 'lm-pileca', name: 'Piletina, sir, pavlaka', price: 460 },
        ],
      },
      {
        title: 'Doručak',
        cat: 'dorucak',
        items: [{ id: 'lm-dorucak', name: 'Engleski doručak', desc: 'Jaja, slanina, kobasica, pasulj, tost', price: 590 }],
      },
      {
        title: 'Deserti',
        cat: 'desert',
        items: [
          { id: 'lm-vafl', name: 'Vafl sa sladoledom', price: 420 },
          { id: 'lm-sladoled', name: 'Sladoled', desc: '3 kugle po izboru', price: 300 },
        ],
      },
    ],
  },

  // ---------------- PIĆE I NAMIRNICE ----------------
  {
    slug: 'market',
    name: 'Market po izboru',
    service: 'market',
    emoji: '🛒',
    about: 'Kupujemo u marketu koji vi kažete. Plaćate po računu, kad kurir donese.',
    request: { label: 'Nešto što nije na spisku?', placeholder: 'npr. 2 kg brašna T-400, jogurt 1 l (Imlek), market Idea kod pošte' },
    menu: [
      { title: 'Hleb i peciva', cat: 'pekara', items: [
        { id: 'hleb', name: 'Hleb beli', price: null },
        { id: 'hleb-integralni', name: 'Hleb integralni', price: null },
        { id: 'kifle', name: 'Kifle (5 kom)', price: null },
      ] },
      { title: 'Mleko i mlečno', cat: 'mlecno', items: [
        { id: 'mleko', name: 'Mleko 1 l', price: null },
        { id: 'jogurt', name: 'Jogurt 1 l', price: null },
        { id: 'jaja', name: 'Jaja (10 kom)', price: null },
        { id: 'sir', name: 'Sir beli 500 g', price: null },
      ] },
      { title: 'Voda i sokovi', cat: 'pice', items: [
        { id: 'voda', name: 'Voda 1,5 l', price: null },
        { id: 'voda-pak', name: 'Voda 6 × 1,5 l', price: null },
        { id: 'sok', name: 'Sok 1 l', price: null },
      ] },
      { title: 'Voće i povrće', cat: 'voce', items: [
        { id: 'banane', name: 'Banane 1 kg', price: null },
        { id: 'jabuke', name: 'Jabuke 1 kg', price: null },
        { id: 'krompir', name: 'Krompir 2 kg', price: null },
      ] },
      { title: 'Slatkiši i grickalice', cat: 'slatkisi', items: [
        { id: 'cokolada', name: 'Čokolada 100 g', price: null },
        { id: 'cips', name: 'Čips', price: null },
      ] },
      { title: 'Kafa i čaj', cat: 'kafa', items: [
        { id: 'kafa', name: 'Mlevena kafa 200 g', price: null },
        { id: 'caj', name: 'Čaj', price: null },
      ] },
      { title: 'Higijena', cat: 'higijena', items: [
        { id: 'toalet-papir', name: 'Toalet papir', price: null },
        { id: 'deterdzent', name: 'Deterdžent za sudove', price: null },
      ] },
    ],
  },

  // ---------------- LEKOVI ----------------
  {
    slug: 'apoteka',
    name: 'Apoteka po izboru',
    service: 'meds',
    emoji: '💊',
    about: 'Idemo po lekove u apoteku koju vi kažete. Za lek na recept kuriru dajte recept ili broj eRecepta.',
    request: { label: 'Koji lekovi vam trebaju?', placeholder: 'npr. Brufen 400 mg, 1 kutija. eRecept za lek X, LBO 12345678901. Apoteka u centru.' },
    menu: [
      { title: 'Lekovi na recept', cat: 'recept', items: [
        { id: 'erecept', name: 'Preuzimanje leka na eRecept', desc: 'Napišite u polju ispod LBO i naziv leka', price: null },
        { id: 'papirni-recept', name: 'Preuzimanje leka na papirni recept', desc: 'Kurir prvo dolazi po recept', price: null },
      ] },
      { title: 'Bez recepta', cat: 'bezrecepta', items: [
        { id: 'protiv-bolova', name: 'Lek protiv bolova', desc: 'Napišite koji u polju ispod', price: null },
        { id: 'flasteri', name: 'Flasteri', price: null },
        { id: 'toplomer', name: 'Toplomer', price: null },
      ] },
      { title: 'Vitamini', cat: 'vitamini', items: [
        { id: 'vitamin-c', name: 'Vitamin C', price: null },
        { id: 'magnezijum', name: 'Magnezijum', price: null },
      ] },
      { title: 'Za bebe', cat: 'bebe', items: [
        { id: 'pelene', name: 'Pelene', desc: 'Napišite veličinu i marku', price: null },
        { id: 'adaptirano', name: 'Adaptirano mleko', price: null },
      ] },
    ],
  },

  // ---------------- CVEĆE ----------------
  {
    slug: 'cvecara-cuca',
    name: 'Cvećara Cuca',
    service: 'flowers',
    emoji: '💐',
    about: 'Buketi, ruže i saksijsko cveće. Uz buket može i čestitka sa vašom porukom.',
    request: { label: 'Poruka na čestitki', placeholder: 'npr. Srećan rođendan, mama! Voli te Ana' },
    menu: [
      { title: 'Buketi', cat: 'buketi', items: [
        { id: 'buket-mali', name: 'Mešani buket', price: [['mali', 1500], ['srednji', 2500], ['veliki', 3800]] },
        { id: 'buket-gerberi', name: 'Buket gerbera', price: 1800 },
        { id: 'buket-tulipani', name: 'Buket tulipana', desc: 'Sezonski', price: 2200 },
      ] },
      { title: 'Ruže', cat: 'ruze', items: [
        { id: 'ruza', name: 'Ruža (komad)', price: 250 },
        { id: 'ruze-11', name: '11 crvenih ruža', price: 2900 },
        { id: 'ruze-kutija', name: 'Ruže u kutiji', price: [['mala', 3500], ['velika', 6500]] },
      ] },
      { title: 'Saksijsko cveće', cat: 'saksije', items: [
        { id: 'orhideja', name: 'Orhideja', price: 2400 },
        { id: 'saksija', name: 'Sobna biljka', desc: 'Po izboru cvećare', price: 1600 },
      ] },
      { title: 'Aranžmani', cat: 'aranzmani', items: [
        { id: 'aranzman', name: 'Aranžman u korpi', price: 3200 },
        { id: 'aranzman-cokolada', name: 'Aranžman sa čokoladom', price: 2700 },
      ] },
    ],
  },

  // ---------------- TORTE I POKLONI ----------------
  {
    slug: 'poslasticarnica',
    name: 'Poslastičarnica',
    service: 'gifts',
    emoji: '🎂',
    about: 'Torte po porudžbini i kolači na komad. Tortu poručite bar dan ranije.',
    request: { label: 'Natpis na torti i datum', placeholder: 'npr. „Srećan 7. rođendan, Luka“, za subotu 18h' },
    menu: [
      { title: 'Čokoladne torte', cat: 'cokoladne', items: [
        { id: 'cokoladna', name: 'Čokoladna torta', desc: 'Tamna čokolada, ganaš', price: [['1 kg', 2600], ['2 kg', 5000]] },
        { id: 'nutela-torta', name: 'Nutela torta', price: [['1 kg', 2800], ['2 kg', 5400]] },
        { id: 'svarcvald', name: 'Švarcvald', desc: 'Čokolada i višnje', price: [['1 kg', 2700], ['2 kg', 5200]] },
      ] },
      { title: 'Torte na dva sprata', cat: 'dvesprata', items: [
        { id: 'dva-sprata', name: 'Torta na dva sprata', desc: 'Ukus po izboru, dekoracija po dogovoru', price: [['3 kg', 8500], ['4 kg', 11000]] },
        { id: 'svadbena', name: 'Svadbena / krštenje', desc: 'Dva ili tri sprata, po dogovoru', price: [['5 kg', 14000], ['7 kg', 19500]] },
      ] },
      { title: 'Voćne torte', cat: 'vocne', items: [
        { id: 'jagoda', name: 'Torta sa jagodama', price: [['1 kg', 2500], ['2 kg', 4800]] },
        { id: 'sumsko-voce', name: 'Šumsko voće', price: [['1 kg', 2700], ['2 kg', 5200]] },
      ] },
      { title: 'Dečje torte', cat: 'decje', items: [
        { id: 'decja', name: 'Dečja torta sa slikom', desc: 'Jestiva slika junaka po izboru', price: [['1,5 kg', 4200], ['2 kg', 5400]] },
        { id: 'broj', name: 'Torta u obliku broja', price: 4800 },
      ] },
      { title: 'Kolači', cat: 'kolaci', items: [
        { id: 'krempita', name: 'Krempita', price: 220 },
        { id: 'baklava', name: 'Baklava (kom)', price: 150 },
        { id: 'mafini', name: 'Mafini (4 kom)', price: 480 },
      ] },
    ],
  },
  {
    slug: 'pokloni',
    name: 'Poklon po izboru',
    service: 'gifts',
    emoji: '🎁',
    about: 'Napišite šta i gde da kupimo ili preuzmemo, mi dostavljamo kao iznenađenje.',
    request: { label: 'Koji poklon i odakle?', placeholder: 'npr. igračka iz prodavnice X, upakovati kao poklon, dostaviti u subotu do 12h' },
    menu: [
      { title: 'Pokloni', cat: 'pokloni', items: [
        { id: 'poklon-paket', name: 'Poklon paket sa slatkišima', price: null },
        { id: 'balon', name: 'Baloni sa helijumom', price: null },
      ] },
    ],
  },

  // ---------------- OSTALE DOSTAVE ----------------
  {
    slug: 'kurir',
    name: 'Beep Beep kurir',
    service: 'other',
    emoji: '🛵',
    about: 'Preuzmemo bilo šta sa jedne adrese i odnesemo na drugu: dokumenta, ključeve, pakete.',
    request: { label: 'Šta i odakle da preuzmemo?', placeholder: 'npr. ključevi kod komšije, Hajduk Veljkova 12, stan 4. Ili spisak za kupovinu.' },
    menu: [
      { title: 'Usluge', items: [
        { id: 'dokumenta', name: 'Preuzimanje dokumenata', price: null, cat: 'dokumenta' },
        { id: 'kljucevi', name: 'Dostava ključeva', price: null, cat: 'kljucevi' },
        { id: 'paket', name: 'Paket do 10 kg', price: null, cat: 'paketi' },
        { id: 'spisak', name: 'Kupovina po spisku', desc: 'Spisak napišite u polju ispod', price: null, cat: 'spisak' },
      ] },
    ],
  },
]

// ---------- pomoćne funkcije (koriste ih i stranice i server) ----------

export const shopBySlug = (slug) => SHOPS.find((s) => s.slug === slug)

/** Kategorije u kojima lokal ima bar jednu stavku. */
export const shopCategories = (shop) =>
  new Set(shop.menu.flatMap((section) => section.items.map((item) => item.cat || section.cat)).filter(Boolean))

export const itemCategory = (section, item) => item.cat || section.cat

/** Sve stavke svih lokala, za pretragu. */
export const ALL_ITEMS = SHOPS.flatMap((shop) =>
  shop.menu.flatMap((section) => section.items.map((item) => ({ shop, section, item, cat: itemCategory(section, item) }))),
)

export function findItem(shopSlug, itemId) {
  const shop = shopBySlug(shopSlug)
  for (const section of shop?.menu ?? []) {
    const item = section.items.find((i) => i.id === itemId)
    if (item) return item
  }
  return null
}

/** Cena za izabranu veličinu (variant je indeks), null ako je "po računu". */
export function priceOf(item, variant = 0) {
  if (Array.isArray(item.price)) return item.price[variant]?.[1] ?? null
  return item.price
}

export const variantLabel = (item, variant = 0) => (Array.isArray(item.price) ? item.price[variant]?.[0] : '')

/** Minimalna cena za prikaz ("od 650 din"). */
export const startingPrice = (item) => (Array.isArray(item.price) ? item.price[0][1] : item.price)

/** Za pretragu bez kvačica: "Palačinke" -> "palacinke". */
export const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'dj')
