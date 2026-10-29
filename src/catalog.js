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
// Lokal sa `request` ima i polje gde kupac sam napiše šta mu treba (na dnu menija i u korpi;
// sa `checkoutOnly: true` samo u korpi).
//
// Deo menija može imati i (sve je neobavezno):
//   emoji: '🍕'                      ikonica pored naslova i na traci sa delovima menija
//   note: '32 cm / 48 cm'            sitan tekst ispod naslova (veličine, gramaža, salata po izboru)
//   extras: ['masline', 'jaje']      dodaci po želji; kupac ih upiše u napomenu za lokal
// Stavka može imati weight: '360 g' (prikazuje se pored naziva).
// Lokal sa realMenu: true ima pravi meni (u razvoju se ne prikazuje napomena "meni je primer").
// stripe: ['#178a45', '#fff', '#e3131c'] je traka u bojama lokala na vrhu njegovog menija.
// logo: 'Pastizza' je ime fajla u src/assets/partners; logo stoji na kartici lokala i na vrhu menija.
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
    { key: 'dokumenta', label: 'Dokumenta za pravna lica', emoji: '📄' },
    { key: 'paketi', label: 'Paketi', emoji: '📦' },
  ],
}

export const SHOPS = [
  // ---------------- HRANA ----------------
  {
    // pravi meni sa cenovnika u lokalu (fotografija, oktobar 2026)
    slug: 'pastizza',
    name: 'Pastizza',
    realMenu: true,
    // logo iz src/assets/partners/Pastizza.jpg (isti kao u traci "Naši partneri")
    logo: 'Pastizza',
    // zelena, bela, crvena kao na njihovom cenovniku (traka na vrhu menija kad nema logoa)
    stripe: ['#178a45', '#ffffff', '#e3131c'],
    service: 'food',
    emoji: '🍝',
    about: 'Zapečeni i tost sendviči, pica, paste, pasta salate i palačinke.',
    request: {
      label: 'Dodaci, salata po izboru ili napomena',
      // polje je samo u korpi, na kraju poručivanja (ne na dnu menija)
      checkoutOnly: true,
      placeholder: 'npr. salata uz sendvič: urnebes. Na pici dodatno masline i feferoni. Palačinka sa bananom.',
    },
    menu: [
      {
        title: 'Zapečeni sendviči',
        emoji: '🥪',
        cat: 'sendvic',
        note: 'Salata po izboru: ruska, pileća, goveđa ili urnebes',
        items: [
          { id: 'pz-zap-sunka', name: 'Sendvič šunka', weight: '360 g', price: 260 },
          { id: 'pz-zap-tuna', name: 'Sendvič tuna', weight: '360 g', price: 270 },
          { id: 'pz-zap-pecenica', name: 'Sendvič pečenica', weight: '360 g', price: 300 },
          { id: 'pz-zap-vrat', name: 'Sendvič suvi vrat', weight: '360 g', price: 300 },
          { id: 'pz-zap-prsa', name: 'Sendvič pileća prsa', weight: '360 g', price: 300 },
          { id: 'pz-zap-kulen', name: 'Sendvič kulen', weight: '360 g', price: 310 },
          { id: 'pz-zap-pastizza', name: 'Sendvič Pastizza', weight: '400 g', price: 360 },
          { id: 'pz-zap-dimljeno', name: 'Sendvič dimljeno meso', weight: '360 g', price: 380 },
          { id: 'pz-zap-piletina', name: 'Sendvič sa piletinom', weight: '360 g', price: 360 },
          { id: 'pz-zap-batak', name: 'Sendvič dimljeni batak', weight: '450 g', price: 430 },
        ],
      },
      {
        title: 'Tost sendviči',
        emoji: '🍞',
        cat: 'sendvic',
        note: 'Salata po izboru: ruska, pileća, goveđa ili urnebes',
        items: [
          { id: 'pz-tost-sunka', name: 'Tost šunka', weight: '350 g', price: 250 },
          { id: 'pz-tost-pecenica', name: 'Tost pečenica', weight: '350 g', price: 290 },
          { id: 'pz-tost-vrat', name: 'Tost suvi vrat', weight: '350 g', price: 290 },
          { id: 'pz-tost-prsa', name: 'Tost pileća prsa', weight: '350 g', price: 290 },
          { id: 'pz-tost-kulen', name: 'Tost kulen', weight: '350 g', price: 300 },
          { id: 'pz-tost-dimljeno', name: 'Tost dimljeno meso', weight: '350 g', price: 370 },
        ],
      },
      {
        title: 'Pica',
        emoji: '🍕',
        cat: 'pica',
        note: '32 cm / 48 cm',
        extras: ['pavlaka', 'masline', 'kukuruz', 'feferoni', 'parmezan', 'jaje'],
        items: [
          { id: 'pz-margherita', name: 'Margherita', desc: 'pelat, kačkavalj', price: [['32 cm', 900], ['48 cm', 1400]] },
          { id: 'pz-capricciosa', name: 'Capricciosa', desc: 'pelat, pečurke, kačkavalj, šunka', price: [['32 cm', 1000], ['48 cm', 1550]] },
          { id: 'pz-vegetariana', name: 'Vegetariana', desc: 'pelat, pečurke, kačkavalj, mix povrće, masline', price: [['32 cm', 950], ['48 cm', 1450]] },
          { id: 'pz-prsa', name: 'Prsa', desc: 'pelat, pečurke, kačkavalj, pileća prsa, jaje', price: [['32 cm', 1050], ['48 cm', 1650]] },
          { id: 'pz-roma', name: 'Roma', desc: 'pelat, pečurke, kačkavalj, šunka, suvi vrat, susam', price: [['32 cm', 1100], ['48 cm', 1750]] },
          { id: 'pz-salami', name: 'Salami', desc: 'pelat, kačkavalj, kulen', price: [['32 cm', 1050], ['48 cm', 1750]] },
          { id: 'pz-quattro', name: 'Quattro', desc: 'pelat, pečurke, kačkavalj, suvi vrat, slanina, kulen, jaje', price: [['32 cm', 1150], ['48 cm', 1900]] },
          { id: 'pz-chicken', name: 'Chicken', desc: 'pelat, kačkavalj, dimljena piletina, susam', price: [['32 cm', 1100], ['48 cm', 1800]] },
          { id: 'pz-pica-pastizza', name: 'Pastizza', desc: 'pelat, pečurke, kačkavalj, paprika, domaće dimljeno meso, ivice sa kačkavaljem', price: [['32 cm', 1200], ['48 cm', 2000]] },
          { id: 'pz-parce', name: 'Pizza parče', price: 270 },
          { id: 'pz-parce-salata', name: 'Pizza parče sa salatom', desc: 'salata po izboru: ruska, pileća, goveđa ili urnebes', price: 290 },
        ],
      },
      {
        title: 'Paste',
        emoji: '🍝',
        cat: 'pasta',
        note: '300 g / 450 g',
        extras: ['piletina', 'pančeta', 'parmezan', 'pečurke', 'dimljena piletina'],
        items: [
          { id: 'pz-pesto', name: 'Piletina pesto', desc: 'pileće belo meso, neutralna pavlaka, pesto sos, parmezan', price: [['300 g', 450], ['450 g', 550]] },
          { id: 'pz-bolognese', name: 'Pasta bolognese', desc: 'juneće meso, luk, šargarepa, paradajz sos, parmezan', price: [['300 g', 450], ['450 g', 550]] },
          { id: 'pz-carbonara', name: 'Pasta carbonara', desc: 'pančeta, neutralna pavlaka, jaje, parmezan', price: [['300 g', 450], ['450 g', 550]] },
          { id: 'pz-pasta-sunka', name: 'Pasta šunka', desc: 'šunka, neutralna pavlaka, parmezan', price: [['300 g', 450], ['450 g', 550]] },
          { id: 'pz-funghi', name: 'Piletina funghi', desc: 'pileće belo meso, neutralna pavlaka, pečurke, parmezan', price: [['300 g', 450], ['450 g', 550]] },
          { id: 'pz-pasta-pastizza', name: 'Pasta Pastizza', desc: 'dimljeni batak, neutralna pavlaka, susam, kačkavalj', price: [['300 g', 450], ['450 g', 550]] },
        ],
      },
      {
        title: 'Pasta salate',
        emoji: '🥗',
        cat: 'salata',
        note: '400 g',
        items: [
          { id: 'pz-salata-tuna', name: 'Pasta salata tunjevina', weight: '400 g', desc: 'testenina, tunjevina, kukuruz, ajvar, kiseli krastavci, soja sos', price: 450 },
          { id: 'pz-salata-piletina', name: 'Pasta salata piletina', weight: '400 g', desc: 'testenina, pileće belo meso, pavlaka, susam', price: 450 },
        ],
      },
      {
        title: 'Palačinke slatke',
        emoji: '🥞',
        cat: 'palacinke',
        extras: ['plazma', 'kokos', 'banana', 'krem', 'džem', 'nutela'],
        items: [
          { id: 'pz-pal-krem', name: 'Palačinka sa kremom', price: 240 },
          { id: 'pz-pal-dzem', name: 'Palačinka sa džemom', price: 230 },
          { id: 'pz-pal-nutela', name: 'Palačinka sa nutelom', price: 270 },
          { id: 'pz-pal-krem-plazma', name: 'Palačinka krem-plazma', price: 280 },
          { id: 'pz-pal-nutela-plazma', name: 'Palačinka nutela-plazma', price: 300 },
        ],
      },
      {
        title: 'Palačinke slane',
        emoji: '🫓',
        cat: 'palacinke',
        items: [
          { id: 'pz-pal-sunka', name: 'Palačinka sa šunkom', price: 330 },
          { id: 'pz-pal-pecenica', name: 'Palačinka sa pečenicom', price: 380 },
          { id: 'pz-pal-vrat', name: 'Palačinka sa suvim vratom', price: 380 },
          { id: 'pz-pal-kulen', name: 'Palačinka sa kulenom', price: 380 },
          { id: 'pz-pal-capricciosa', name: 'Palačinka Capricciosa', price: 360 },
          { id: 'pz-pal-pastizza', name: 'Palačinka Pastizza', price: 420 },
          { id: 'pz-pal-piletina', name: 'Palačinka sa piletinom', price: 400 },
        ],
      },
    ],
  },
  {
    slug: 'picerija-castelo',
    name: 'Picerija Castelo',
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
          { id: 'castelo', name: 'Castelo specijal', desc: 'Pelat, sir, kulen, slanina, jaje, ljuta papričica', price: [['32 cm', 890], ['50 cm', 1750]] },
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
    logo: 'Kafanica',
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
    slug: 'la-moara',
    name: 'La Moara',
    logo: 'La Moara',
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
    slug: 'cvecara',
    name: 'Cvećara po izboru',
    service: 'flowers',
    emoji: '💐',
    about: 'Buketi, ruže i saksijsko cveće iz cvećare u Negotinu. Uz buket može i čestitka sa vašom porukom.',
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
    about: 'Preuzmemo bilo šta sa jedne adrese i odnesemo na drugu: dokumenta za pravna lica, ključeve, pakete.',
    request: { label: 'Šta i odakle da preuzmemo?', placeholder: 'npr. ključevi kod komšije, Hajduk Veljkova 12, stan 4. Ili spisak za kupovinu.' },
    menu: [
      { title: 'Usluge', items: [
        { id: 'dokumenta', name: 'Dokumenta za pravna lica', desc: 'Preuzimanje i dostava dokumentacije za firme', price: null, cat: 'dokumenta' },
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
