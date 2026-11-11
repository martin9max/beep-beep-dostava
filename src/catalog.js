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
// Lokal sa realMenu: true ima pravi meni (sa cenovnika ili sajta lokala).
// stripe: ['#178a45', '#fff', '#e3131c'] je traka u bojama lokala na vrhu njegovog menija.
// logo: 'Pastizza' je ime fajla u src/assets/partners; logo stoji na kartici lokala i na vrhu menija.
// gallery: true prikazuje slike iz src/assets/galerija/<slug> ("Naši radovi") na vrhu menija.
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
    { key: 'namirnice', label: 'Osnovne namirnice', emoji: '🧂' },
    { key: 'kuca', label: 'Kućna hemija i papir', emoji: '🧽' },
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
    { key: 'torte-po-zelji', label: 'Torte po želji', emoji: '🎂' },
    { key: 'cokoladne', label: 'Čokoladne torte', emoji: '🍫' },
    { key: 'dvesprata', label: 'Torte na dva sprata', emoji: '🎂' },
    { key: 'pokloni', label: 'Pokloni', emoji: '🎁' },
  ],
  other: [
    { key: 'pazar', label: 'Uplata pazara', emoji: '💰' },
    { key: 'dokumenta', label: 'Dokumenta', emoji: '📄' },
    { key: 'racuni', label: 'Plaćanje računa', emoji: '🧾' },
    { key: 'paketi', label: 'Paketi i nabavka', emoji: '📦' },
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
    // pravi meni sa pizzeriacastelo.com/meni (novembar 2026)
    slug: 'picerija-castelo',
    name: 'Pizzeria Castelo',
    logo: 'Pizzeria Castelo',
    realMenu: true,
    service: 'food',
    emoji: '🍕',
    about: 'Pice 30 i 48 cm, paste, brunch, dečija karta, palačinke i zdravi obroci.',
    request: {
      label: 'Napomena za Castelo',
      placeholder: 'npr. pica bez luka, dodatni kačkavalj, palačinka sa bananom.',
      checkoutOnly: true,
    },
    menu: [
      {
        title: 'Pice',
        emoji: '🍕',
        cat: 'pica',
        note: '30 cm / 48 cm',
        items: [
          { id: 'cs-bianco', name: 'Bianco', desc: 'pileća prsa, slanina, kačkavalj, kiseli krastavac, paprika, burger sos, pelat, neutralna pavlaka, origano', price: [['30 cm', 1250], ['48 cm', 2000]] },
          { id: 'cs-italiana', name: 'Italiana', desc: 'delikates šunka, kačkavalj, pečurke, crne masline, mocarela, čeri paradajz, bosiljak, paradajz sos, origano', price: [['30 cm', 1250], ['48 cm', 1950]] },
          { id: 'cs-margarita', name: 'Margarita', desc: 'pelat, kačkavalj, origano', price: [['30 cm', 950], ['48 cm', 1350]] },
          { id: 'cs-funghi', name: 'Funghi', desc: 'pelat, kačkavalj, šampinjoni, origano', price: [['30 cm', 1000], ['48 cm', 1400]] },
          { id: 'cs-vegetarian', name: 'Vegetarian', desc: 'pelat, kačkavalj, šampinjoni, paradajz, slatka paprika, kukuruz, tikvice, masline, luk, origano', price: [['30 cm', 1150], ['48 cm', 1800]] },
          { id: 'cs-capricciosa', name: 'Capricciosa', desc: 'pelat, kačkavalj, šunka, šampinjoni, origano', price: [['30 cm', 1100], ['48 cm', 1650]] },
          { id: 'cs-peproni', name: 'Peproni', desc: 'pelat, kačkavalj, kulen, slanina, šampinjoni, feferoni, origano', price: [['30 cm', 1150], ['48 cm', 1850]] },
          { id: 'cs-salami', name: 'Salami special', desc: 'pelat, kačkavalj, kulen, beli luk, origano', price: [['30 cm', 1150], ['48 cm', 1800]] },
          { id: 'cs-roma', name: 'Roma', desc: 'pelat, kačkavalj, šunka, suvi vrat, šampinjoni, susam, origano', price: [['30 cm', 1200], ['48 cm', 1950]] },
          { id: 'cs-gracia', name: 'Gracia', desc: 'pelat, kačkavalj, šunka, suvi vrat, kulen, šampinjoni, origano', price: [['30 cm', 1250], ['48 cm', 1900]] },
          { id: 'cs-quattro', name: 'Quattro stagioni', desc: 'pelat, kačkavalj, šunka, suvi vrat, kulen, slanina, šampinjoni, origano, jaje', price: [['30 cm', 1250], ['48 cm', 2050]] },
          { id: 'cs-avokado', name: 'Avokado', desc: 'pelat, kačkavalj, pečenica, slanina, paprika, avokado, šampinjoni, masline', price: [['30 cm', 1300], ['48 cm', 2050]] },
          { id: 'cs-appena', name: 'Appena', desc: 'pelat, kačkavalj, pečurke, pančeta, rukola, čeri paradajz, parmezan', price: [['30 cm', 1250], ['48 cm', 1950]] },
          { id: 'cs-mexicana', name: 'Mexicana', desc: 'pelat, kačkavalj, šunka, slanina, paprika, kukuruz, pasulj, masline, ljuti sos', price: [['30 cm', 1250], ['48 cm', 2000]] },
          { id: 'cs-adriana', name: 'Adriana', desc: 'pelat, kačkavalj, tunjevina, crni luk, masline, origano', price: [['30 cm', 1250], ['48 cm', 1900]] },
          { id: 'cs-chicken', name: 'Chicken', desc: 'pelat, kačkavalj, slanina, pileća prsa, šampinjoni, origano, susam', price: [['30 cm', 1300], ['48 cm', 2050]] },
          { id: 'cs-castelo', name: 'Castelo', desc: 'pelat, kačkavalj, kajmak, pršuta, crne masline, origano', price: [['30 cm', 1250], ['48 cm', 2000]] },
          { id: 'cs-4-sira', name: '4 vrste sira', desc: 'mlečni kačkavalj, gorgonzola, čedar, topljeni sir, pesto sos, origano', price: [['30 cm', 1250], ['48 cm', 2000]] },
        ],
      },
      {
        title: 'Paste',
        emoji: '🍝',
        cat: 'pasta',
        note: '300 g',
        items: [
          { id: 'cs-chicken-pasta', name: 'Chicken pasta', desc: 'piletina, pečurke, testenina, parmezan', price: 1200 },
          { id: 'cs-spanac-pasta', name: 'Spanać pasta', desc: 'spanać, pršut, testenina', price: 1200 },
          { id: 'cs-chorizo-pasta', name: 'Chorizo pasta', desc: 'čili, fruštuk, testenina, pelat', price: 1200 },
          { id: 'cs-4-sira-pasta', name: '4 vrste sira pasta', desc: 'testenina, mlečni kačkavalj, gorgonzola, topljeni sir, pesto', price: 1200 },
          { id: 'cs-bolonjeze', name: 'Bolonjeze pasta', desc: 'junetina, špageti, paradajz sos', price: 1200 },
        ],
      },
      {
        title: 'Brunch',
        emoji: '🍳',
        cat: 'kuvano',
        items: [
          { id: 'cs-tokosi', name: 'Tokosi', weight: '400 g', desc: 'tortilja, piletina, kačkavalj, jaje, slatko-ljuti sos', price: 900, cat: 'giros' },
          { id: 'cs-piletina-povrce', name: 'Piletina sa grilovanim povrćem', weight: '500 g', desc: 'pileća prsa, grilovano povrće, pekarski krompir, kikiriki puter, avokado', price: 1200 },
          { id: 'cs-grilovano-povrce', name: 'Grilovano povrće', weight: '500 g', desc: 'paprika, crveni luk, tikvice, plavi patlidžan, čeri paradajz, pekarski krompir, pečurke', price: 1000 },
          { id: 'cs-burger', name: 'Castelo burger', weight: '300 g', desc: 'juneće meso, topljeni sir, zelena salata, paradajz, crveni luk, pomfrit', price: 800, cat: 'burger' },
          { id: 'cs-lazanje', name: 'Lazanje', weight: '450 g', price: 1000, cat: 'pasta' },
          { id: 'cs-pohovana-piletina', name: 'Pohovana piletina', weight: '600 g', price: 1000 },
          { id: 'cs-pomfrit', name: 'Pomfrit', weight: '350 g', price: 500 },
          { id: 'cs-pivska-daska', name: 'Pivska daska za 4 osobe', weight: '1 kg', desc: 'kobasica sa sirom, pekarski krompir, senf, kečap', price: 2000 },
          { id: 'cs-riblji-stapici', name: 'Riblji štapići', weight: '400 g', desc: 'uz pekarski krompir', price: 800 },
          { id: 'cs-slana-palacinka', name: 'Castelo slana palačinka', desc: 'suvi vrat, šunka, kačkavalj, paradajz sos, pavlaka, origano', price: 600, cat: 'palacinke' },
        ],
      },
      {
        title: 'Dečija karta',
        emoji: '🧒',
        items: [
          { id: 'cs-deca-margarita', name: 'Margarita 20 cm', desc: 'pelat, kačkavalj, origano', price: 500, cat: 'pica' },
          { id: 'cs-deca-capricciosa', name: 'Capricciosa 20 cm', desc: 'pelat, kačkavalj, šunka, šampinjoni, origano', price: 550, cat: 'pica' },
          { id: 'cs-burger-kids', name: 'Burger kids', weight: '200 g', desc: 'juneće meso, topljeni sir, zelena salata, paradajz, pomfrit', price: 600, cat: 'burger' },
        ],
      },
      {
        title: 'Palačinke',
        emoji: '🥞',
        cat: 'palacinke',
        note: 'Voćno punjenje i orasi se dodaju na palačinku',
        items: [
          { id: 'cs-prazna', name: 'Prazna palačinka', price: 120 },
          { id: 'cs-med', name: 'Sa medom', price: 300 },
          { id: 'cs-nutela', name: 'Sa nutelom', price: 310 },
          { id: 'cs-nutela-plazma', name: 'Sa nutelom i plazmom', price: 350 },
          { id: 'cs-dzem', name: 'Sa džemom od kajsije', price: 270 },
          { id: 'cs-banana', name: 'Banana (dodatak)', price: 130 },
          { id: 'cs-malina', name: 'Malina (dodatak)', price: 150 },
          { id: 'cs-jagoda', name: 'Jagoda (dodatak)', price: 150 },
          { id: 'cs-visnja', name: 'Višnja (dodatak)', price: 150 },
          { id: 'cs-orasi', name: 'Orasi (dodatak)', price: 150 },
        ],
      },
      {
        title: 'Healthy meal',
        emoji: '🥑',
        cat: 'dorucak',
        items: [
          { id: 'cs-fit-start', name: 'Fit start', desc: 'ovsene pahulje, agava sirup, cimet, kakao, šumsko voće, tamna čokolada, kikiriki puter', price: 610 },
          { id: 'cs-morning-start', name: 'Morning start', desc: 'banana, grčki jogurt, ovsene pahulje, čia seme, agava sirup, voće, tamna čokolada', price: 610 },
          { id: 'cs-chicken-wrap', name: 'Chicken wrap', desc: 'brokoli, piletina, zelena salata, kukuruz, jabuka, limun', price: 650, cat: 'giros' },
          { id: 'cs-proteinska', name: 'Proteinska salata', desc: 'tunjevina, kukuruz, pasulj, grašak, čeri paradajz', price: 870, cat: 'salata' },
        ],
      },
      {
        title: 'Dodaci',
        emoji: '🧂',
        items: [
          { id: 'cs-majonez', name: 'Majonez', price: 160 },
          { id: 'cs-pavlaka', name: 'Pavlaka', price: 160 },
          { id: 'cs-parmezan', name: 'Parmezan', price: 260 },
          { id: 'cs-masline', name: 'Masline', price: 160 },
          { id: 'cs-ananas', name: 'Ananas', price: 200 },
          { id: 'cs-kukuruz', name: 'Kukuruz', price: 160 },
          { id: 'cs-tzatziki', name: 'Tzatziki', price: 200 },
          { id: 'cs-jaje', name: 'Jaje', price: 60 },
          { id: 'cs-lepinja', name: 'Lepinja', price: 150 },
          { id: 'cs-cili', name: 'Čili sos', price: 160 },
          { id: 'cs-kajmak', name: 'Kajmak', price: 250 },
          { id: 'cs-komplet', name: 'Komplet dozer', price: 360 },
        ],
      },
    ],
  },
  {
    // pravi meni sa sajta picerijabajkanegotin.com (novembar 2026); kafa i alkohol se ne dostavljaju
    slug: 'bajka',
    name: 'Caffe Pizzeria Bajka',
    logo: 'Bajka',
    realMenu: true,
    service: 'food',
    emoji: '🍕',
    about: 'Pice iz peći sa ručno rađenim testom, doručak do 12 časova, sendviči u domaćoj lepinji, obrok salate, piletina, palačinke i slatki rolovi.',
    request: {
      label: 'Napomena za Bajku',
      placeholder: 'npr. pica bez maslina, palačinka sa džemom od šljive, malina uz lava kolač.',
      checkoutOnly: true,
    },
    menu: [
      {
        title: 'Doručak',
        emoji: '🍳',
        cat: 'dorucak',
        note: 'do 12 časova',
        items: [
          { id: 'bj-bajka-dorucak', name: 'Bajka doručak', desc: '3 jaja na oko, suvi vrat, slanina, sir, zelena salata, krastavac, paradajz, masline, lepinja', price: 450 },
          { id: 'bj-kajgana-slanina', name: 'Kajgana sa slaninom', desc: '3 jaja, slanina, sir, zelena salata, krastavac, paradajz, masline, lepinja', price: 400 },
          { id: 'bj-kajgana-sunka', name: 'Kajgana sa šunkom', desc: '3 jaja, šunka, sir, zelena salata, krastavac, paradajz, masline, lepinja', price: 360 },
          { id: 'bj-timocki', name: 'Timočki doručak', desc: 'kačkavalj, pavlaka, šunka, suvi vrat, prženice, masline, ajvar, krastavčići', price: 400 },
          { id: 'bj-kajgana-vrat', name: 'Kajgana sa suvim vratom', desc: '3 jaja, suvi vrat, sir, zelena salata, krastavac, paradajz, masline, lepinja', price: 380 },
          { id: 'bj-omlet-prsuta', name: 'Omlet sa pršutom', desc: '3 jaja, pršuta, kačkavalj, pavlaka, krastavac, paradajz, zelena salata, masline, feferoni, lepinja', price: 400 },
          { id: 'bj-club', name: 'Club sendvič', desc: '1 jaje, šunka, kačkavalj, kiseli krastavčići, majonez, pavlaka, masline, tost hleb', cat: 'sendvic', price: 420 },
        ],
      },
      {
        title: 'Sendviči',
        emoji: '🥪',
        cat: 'sendvic',
        items: [
          { id: 'bj-s-sunka', name: 'Sendvič sa šunkom', desc: 'domaća lepinja, pavlaka, kačkavalj, šunka, krastavac, paradajz', price: 290 },
          { id: 'bj-s-vrat', name: 'Sendvič sa suvim vratom', desc: 'domaća lepinja, pavlaka, kačkavalj, suvi vrat, krastavac, paradajz', price: 310 },
          { id: 'bj-s-kulen', name: 'Sendvič sa kulenom', desc: 'domaća lepinja, pavlaka, kačkavalj, kulen, krastavac, paradajz', price: 320 },
          { id: 'bj-s-piletina', name: 'Sendvič sa pilećim prsima', desc: 'domaća lepinja, pavlaka, kačkavalj, pileća prsa, krastavac, paradajz', price: 350 },
          { id: 'bj-s-mix', name: 'Mix sendvič', desc: 'domaća lepinja, šunka, pileća prsa, kulen, suvi vrat, kačkavalj, paradajz, krastavac, pavlaka', price: 400 },
          { id: 'bj-s-vege', name: 'Vege sendvič', desc: 'zelena salata, pesto sos, marinirane pečurke, paprika, paradajz, kukuruz šećerac', price: 450 },
          { id: 'bj-s-tuna', name: 'Tuna sendvič', desc: 'paradajz sos, posni kačkavalj, tunjevina, crni luk, masline', price: 450 },
        ],
      },
      {
        title: 'Obrok salate',
        emoji: '🥗',
        cat: 'salata',
        items: [
          { id: 'bj-grcka', name: 'Grčka salata', desc: 'paprika, paradajz, krastavac, crni luk, sir, maslinovo ulje, origano', price: 450 },
          { id: 'bj-cezar', name: 'Cezar salata', desc: 'ajzberg, čeri paradajz, piletina, slanina, cezar sos, maslinovo ulje, parmezan', price: 600 },
          { id: 'bj-vege-salata', name: 'Vege salata', desc: 'zelena salata, paprika, paradajz, crni luk, kukuruz šećerac, maslinovo ulje, masline, origano', price: 500 },
          { id: 'bj-tuna-salata', name: 'Tuna salata', desc: 'paprika, paradajz, crni luk, tunjevina, maslinovo ulje, masline, bosiljak', price: 680 },
        ],
      },
      {
        title: 'Specijalni meni',
        emoji: '🍗',
        cat: 'kuvano',
        items: [
          { id: 'bj-cezar-tortilje', name: 'Cezar tortilje', desc: 'tortilja, piletina, cezar sos, kačkavalj, paradajz, slanina, masline, pomfrit, ajzberg salata', cat: 'giros', price: 650 },
          { id: 'bj-pivska-daska', name: 'Pivska daska', desc: 'prepečeni štapići, kobasice, pomfrit, kačkavalj, pohovana piletina, tortilja čips, kiseli krastavčići, čeri paradajz, pikantni sosevi', price: 1350 },
          { id: 'bj-placinte', name: 'Plačinte', desc: 'testo, sir, jaja, pavlaka', price: 350 },
          { id: 'bj-slatko-ljuta', name: 'Piletina u slatko-ljutom sosu', desc: 'slatko-ljuti sos, piletina, pekarski krompir', price: 750 },
          { id: 'bj-slana-palacinka', name: 'Slana palačinka', desc: 'pavlaka, mortadela, kulen, marinirane pečurke', cat: 'palacinke', price: 550 },
          { id: 'bj-pohovana', name: 'Pohovana piletina', desc: 'piletina, pomfrit, tzatziki sos', price: 700 },
          { id: 'bj-pomfrit', name: 'Pomfrit', price: 400 },
        ],
      },
      {
        title: 'Pice',
        emoji: '🍕',
        cat: 'pica',
        note: 'mala / velika',
        items: [
          { id: 'bj-p-bajka', name: 'Bajka', desc: 'pelat, mozzarella, budimska kobasica, kulen, pečenica, pavlaka, parmezan, susam, masline, origano, beli luk', price: [['mala', 1200], ['velika', 1950]] },
          { id: 'bj-p-margherita', name: 'Margherita', desc: 'pelat, kačkavalj, origano, masline', price: [['mala', 800], ['velika', 1250]] },
          { id: 'bj-p-fungi', name: 'Fungi', desc: 'pelat, kačkavalj, šampinjoni, masline, origano', price: [['mala', 850], ['velika', 1300]] },
          { id: 'bj-p-capricciosa', name: 'Capricciosa', desc: 'pelat, kačkavalj, šunka, šampinjoni, masline, origano', price: [['mala', 950], ['velika', 1550]] },
          { id: 'bj-p-quattro', name: 'Quattro stagioni', desc: 'pelat, šunka, kačkavalj, pečurke, suvi vrat, slanina, jaje, masline, origano', price: [['mala', 1100], ['velika', 1850]] },
          { id: 'bj-p-peperoni', name: 'Special peperoni', desc: 'pelat, kačkavalj, kulen, feferoni, masline, origano, beli luk', price: [['mala', 1000], ['velika', 1800]] },
          { id: 'bj-p-vege', name: 'Vege pizza', desc: 'pelat, posni kačkavalj, pečurke, paprika, paradajz, kukuruz šećerac, masline, origano', price: [['mala', 900], ['velika', 1500]] },
          { id: 'bj-p-tuna', name: 'Tuna pizza', desc: 'pelat, posni kačkavalj, tunjevina, crni luk, masline, origano', price: [['mala', 950], ['velika', 1550]] },
          { id: 'bj-p-calzone', name: 'Calzone', desc: 'pelat, kačkavalj, šunka, marinirane pečurke, pavlaka, premaz', price: 750 },
        ],
      },
      {
        title: 'Slatki završetak',
        emoji: '🍫',
        cat: 'desert',
        items: [
          { id: 'bj-lava', name: 'Lava kolač', price: 300 },
          { id: 'bj-lava-dodatak', name: 'Dodatak uz lava kolač', desc: 'malina, kokos, jagoda, banana ili višnja (upišite u napomenu)', price: 150 },
          { id: 'bj-sneaker', name: 'Sneaker roll', price: 500 },
          { id: 'bj-jaffa', name: 'Jaffa roll', price: 500 },
          { id: 'bj-oreo', name: 'Oreo roll', price: 500 },
          { id: 'bj-bounty', name: 'Bounty roll', price: 550 },
        ],
      },
      {
        title: 'Palačinke',
        emoji: '🥞',
        cat: 'palacinke',
        items: [
          { id: 'bj-pal-krem', name: 'Palačinka sa kremom', price: 250 },
          { id: 'bj-pal-krem-plazma', name: 'Krem i plazma', price: 300 },
          { id: 'bj-pal-nutela', name: 'Nutela', price: 300 },
          { id: 'bj-pal-nutela-plazma', name: 'Nutela i plazma', price: 350 },
          { id: 'bj-pal-med', name: 'Med i orasi', price: 350 },
          { id: 'bj-pal-dzem', name: 'Džem', desc: 'kajsija, šipak ili šljiva (upišite u napomenu)', price: 250 },
        ],
      },
      {
        title: 'Bezalkoholna pića',
        emoji: '🥤',
        items: [
          { id: 'bj-pepsi', name: 'Pepsi 0,25', price: 240 },
          { id: 'bj-pepsi-max', name: 'Pepsi Max 0,25', price: 240 },
          { id: 'bj-mirinda', name: 'Mirinda 0,25', price: 240 },
          { id: 'bj-7up', name: '7up 0,25', price: 240 },
          { id: 'bj-bitter', name: 'Evervess Bitter Lemon 0,25', price: 240 },
          { id: 'bj-tonic', name: 'Evervess Tonic 0,25', price: 240 },
          { id: 'bj-gusto', name: 'Gusto sok 0,2', price: 250 },
          { id: 'bj-cockta', name: 'Cockta 0,275', price: 260 },
          { id: 'bj-limunada-3', name: 'Limunada 0,3', price: 210 },
          { id: 'bj-limunada-5', name: 'Limunada 0,5', price: 240 },
          { id: 'bj-cedjeni-limun', name: 'Ceđeni sok od limuna', price: 220 },
          { id: 'bj-cedjeni-narandza', name: 'Ceđeni sok od narandže', price: 340 },
          { id: 'bj-cedjeni-mix', name: 'Ceđeni mix sok', price: 390 },
          { id: 'bj-aqua-33', name: 'Aqua Viva 0,33', price: 150 },
          { id: 'bj-aqua-75', name: 'Aqua Viva 0,75', price: 200 },
          { id: 'bj-knjaz-25', name: 'Knjaz Miloš 0,25', price: 150 },
          { id: 'bj-knjaz-75', name: 'Knjaz Miloš 0,75', price: 200 },
          { id: 'bj-knjaz-limun', name: 'Knjaz Miloš limun 0,33', price: 210 },
          { id: 'bj-knjaz-narandza', name: 'Knjaz Miloš narandža 0,33', price: 210 },
          { id: 'bj-guarana', name: 'Guarana 0,25', price: 240 },
          { id: 'bj-redbull', name: 'Red Bull 0,25', price: 380 },
        ],
      },
    ],
  },
  {
    // pravi meni sa kafanica.com (slike menija, oktobar 2026), bez karte pića
    slug: 'kafanica',
    name: 'Kafanica',
    logo: 'Kafanica',
    realMenu: true,
    service: 'food',
    emoji: '🍖',
    about: 'Roštilj, pohovana jela, burgeri, paste i doručak. Meso od domaćina iz okolnih sela.',
    request: {
      label: 'Napomena za Kafanicu',
      placeholder: 'npr. ćevapi bez luka, pljeskavica dobro pečena, umesto pomfrita pekarski krompir.',
      checkoutOnly: true,
    },
    menu: [
      {
        title: 'Doručak',
        emoji: '🍳',
        cat: 'dorucak',
        note: 'Služi se do 12h',
        items: [
          { id: 'kf-omlet-sampinjoni', name: 'Omlet sa šampinjonima i šunkom', price: 540 },
          { id: 'kf-omlet-sir', name: 'Omlet sa sirom i slaninom', price: 540 },
          { id: 'kf-strammer', name: 'Strammer max', desc: 'jaja sa slaninom i kačkavaljem na puter tostu, uz salatu', price: 540 },
          { id: 'kf-jaja-slanina', name: 'Jaja na oko sa slaninom', price: 540 },
          { id: 'kf-domacinski', name: 'Domaćinski doručak', desc: 'jaja na oko sa krajinskom kobasicom punjenom sirom, pomfrit, senf, kajmak i ajvar', price: 690 },
        ],
      },
      {
        title: 'Topla predjela',
        emoji: '🧀',
        items: [
          { id: 'kf-pohovani-kackavalj', name: 'Pohovani kačkavalj', price: 660 },
          { id: 'kf-grilovano-povrce', name: 'Grilovano povrće', desc: 'crvena paprika, tikvica, plavi patlidžan i pečurke na žaru', price: 650 },
          { id: 'kf-grilovani-sir', name: 'Grilovani sir', price: 700 },
          { id: 'kf-pecurke', name: 'Pečurke u začinima', price: 550 },
          { id: 'kf-sampinjoni-kajmak', name: 'Pohovani šampinjoni punjeni kajmakom', price: 700 },
        ],
      },
      {
        title: 'Roštilj',
        emoji: '🔥',
        cat: 'rostilj',
        note: 'Služi se uz pomfrit',
        items: [
          { id: 'kf-kafanska', name: 'Kafanska pljeskavica', weight: '300 g', price: 990 },
          { id: 'kf-sarajevski', name: 'Sarajevski ćevapi u lepinji', price: [['5 kom', 900], ['10 kom', 1300]] },
          { id: 'kf-kraljevska', name: 'Kraljevska pljeskavica', weight: '500 g', desc: 'pikantna pljeskavica punjena dimljenom slaninom i kačkavaljem, prelivena kraljevačkim kajmakom', price: 1290 },
          { id: 'kf-ustipci', name: 'Leskovački uštipci', weight: '350 g', price: 1090 },
          { id: 'kf-cevapi-kajmak', name: 'Pikantni ćevapi u kajmaku', weight: '450 g', desc: '12 mini ćevapa sa ćumura, pomešani sa pečenom ljutom i kajmakom', price: 1290 },
          { id: 'kf-kobasica', name: 'Dimljena kobasica', weight: '300 g', price: 890 },
          { id: 'kf-vesalica', name: 'Bela vešalica', weight: '400 g', price: 1200 },
          { id: 'kf-punjena-vesalica', name: 'Punjena bela vešalica', weight: '600 g', price: 1900 },
        ],
      },
      {
        title: 'Sa roštilja uz pekarski krompir',
        emoji: '🥩',
        cat: 'rostilj',
        note: 'Služi se uz pekarski krompir',
        items: [
          { id: 'kf-vrat', name: 'Marinirani svinjski vrat', weight: '400 g', price: 1100 },
          { id: 'kf-medaljoni', name: 'Svinjski medaljoni', weight: '400 g', desc: 'od filea, u sosu od pečuraka', price: 1300 },
          { id: 'kf-file-kajmak', name: 'Svinjski file na kajmaku', weight: '450 g', price: 1400 },
          { id: 'kf-dimljeni-vrat', name: 'Dimljeni vrat na kajmaku', weight: '400 g', price: 1300 },
        ],
      },
      {
        title: 'Pohovana jela i biftek',
        emoji: '🍽️',
        cat: 'kuvano',
        items: [
          { id: 'kf-karadjordjeva', name: 'Karađorđeva šnicla', weight: '400 g', desc: 'uz pekarski krompir', price: 1600 },
          { id: 'kf-becka', name: 'Bečka šnicla', weight: '500 g', desc: 'uz pekarski krompir', price: 1100 },
          { id: 'kf-biftek', name: 'Biftek na žaru', weight: '300 g', desc: 'odležana junetina, marinirana najmanje 15 dana, uz krompir i grilovano povrće; biber sos ili sos od pečuraka (napišite u napomeni)', price: 3800 },
        ],
      },
      {
        title: 'Piletina',
        emoji: '🍗',
        note: 'Služi se uz pomfrit',
        items: [
          { id: 'kf-crispy', name: 'Crispy piletina', desc: 'pohovani štapići piletine sa caciki sosom', price: 890 },
          { id: 'kf-meksicka', name: 'Piletina u pikantnom meksičkom sosu', price: 990 },
          { id: 'kf-cetiri-sira', name: 'Piletina u sosu od četiri vrste sira', price: 990 },
          { id: 'kf-vok', name: 'Vok piletina', price: 950 },
        ],
      },
      {
        title: 'Burgeri i wrap',
        emoji: '🍔',
        cat: 'burger',
        note: 'Služi se uz pomfrit',
        items: [
          { id: 'kf-classic', name: 'Classic burger', desc: 'duplo juneće meso, čedar, kečap, crveni luk, kiseli krastavac', price: 900 },
          { id: 'kf-original', name: 'Original burger', desc: 'duplo juneće meso, čedar, burger sos, ajsberg salata, crveni luk, kiseli krastavac', price: 990 },
          { id: 'kf-bbq', name: 'BBQ jalapeno burger', desc: 'duplo juneće meso, čedar, BBQ sos, hrskavi luk, jalapeno paprika', price: 950 },
          { id: 'kf-cheese-bacon', name: 'Cheese bacon burger', desc: 'duplo juneće meso, čedar, džem od luka, ajsberg, hrskava slanina, majonez sa tartufom', price: 1190 },
          { id: 'kf-wrap', name: 'Pileći wrap 2 kom', desc: 'piletina i sveže povrće u kari sosu, zapečeno u tortilji', price: 1080, cat: 'giros' },
        ],
      },
      {
        title: 'Paste',
        emoji: '🍝',
        cat: 'pasta',
        items: [
          { id: 'kf-karbonara', name: 'Karbonara', desc: 'Barilla testenina u kremastom sosu sa slaninom i parmezanom', price: 990 },
          { id: 'kf-bolonjeze', name: 'Bolonjeze', desc: 'dinstana junetina u paradajz sosu sa Barilla testeninom', price: 990 },
          { id: 'kf-piletina-pecurke', name: 'Piletina pečurke', desc: 'piletina i šampinjoni u sosu sa Barilla testeninom', price: 990 },
        ],
      },
      {
        title: 'Obrok salate i čorba',
        emoji: '🥗',
        cat: 'salata',
        items: [
          { id: 'kf-cezar', name: 'Cezar salata', price: 900 },
          { id: 'kf-tuna', name: 'Tuna salata', price: 800 },
          { id: 'kf-pileca', name: 'Pileća salata', price: 900 },
          { id: 'kf-corba', name: 'Teleća čorba', price: 430, cat: 'kuvano' },
        ],
      },
      {
        title: 'Salate',
        emoji: '🥬',
        cat: 'salata',
        items: [
          { id: 'kf-moravska', name: 'Moravska salata', desc: 'pečena paprika, paradajz, praziluk, luk', price: 440 },
          { id: 'kf-srpska', name: 'Srpska salata', desc: 'paradajz, krastavac, luk, pečena ljuta papričica', price: 440 },
          { id: 'kf-sopska', name: 'Šopska salata', price: 440 },
          { id: 'kf-grcka', name: 'Grčka salata', desc: 'paradajz, krastavac, luk, masline, origano, feta', price: 440 },
          { id: 'kf-urnebes', name: 'Urnebes', desc: 'domaći sir sa pikantnom paprikom', price: 400 },
          { id: 'kf-vitaminska', name: 'Vitaminska salata', desc: 'šargarepa, ljubičasti kupus, paprika, zelena salata, paradajz', price: 440 },
          { id: 'kf-paradajz', name: 'Paradajz salata', price: 390 },
          { id: 'kf-krastavac', name: 'Krastavac salata', price: 390 },
          { id: 'kf-kupus', name: 'Kupus salata', price: 340 },
          { id: 'kf-belolucana', name: 'Belolučana paprika 2 kom', price: 440 },
          { id: 'kf-ljuta', name: 'Ljuta papričica 2 kom', price: 220 },
        ],
      },
      {
        title: 'Dodaci',
        emoji: '🍟',
        items: [
          { id: 'kf-kajmak', name: 'Kajmak', weight: '200 g', price: 600 },
          { id: 'kf-domaci-sir', name: 'Domaći sir', price: 400 },
          { id: 'kf-pekarski', name: 'Pekarski krompir', weight: '200 g', price: 350 },
          { id: 'kf-pomfrit', name: 'Pomfrit', weight: '200 g', price: 300 },
          { id: 'kf-lepinja', name: 'Domaća lepinja', price: 80 },
          { id: 'kf-sos', name: 'Parmezan ili sos po želji', price: 200 },
        ],
      },
      {
        title: 'Nešto slatko',
        emoji: '🍰',
        cat: 'desert',
        items: [
          { id: 'kf-sufle', name: 'Sufle', desc: 'vrući čokoladni kolač sa kuglom vanile', price: 520 },
          { id: 'kf-americka-pita', name: 'Američka pita', desc: 'vrući kolač od jabuke sa kuglom vanile, posut cimetom', price: 520 },
        ],
      },
    ],
  },
  {
    // pravi meni sa slika jelovnika Life caffe pizzeria (novembar 2026)
    slug: 'life-picerija',
    name: 'Life caffe pizzeria',
    logo: 'Life caffe pizzeria',
    realMenu: true,
    service: 'food',
    emoji: '🍕',
    about: 'Pica u tri veličine, sendviči, doručak, piletina, paste, salate, palačinke i vafli.',
    request: {
      label: 'Napomena za Life',
      placeholder: 'npr. pica bez maslina, sendvič bez luka, palačinka sa bananom.',
      checkoutOnly: true,
    },
    menu: [
      {
        title: 'Pica',
        emoji: '🍕',
        cat: 'pica',
        note: 'Mala 25 cm / srednja 32 cm / velika 50 cm',
        items: [
          { id: 'lf-margarita', name: 'Margarita', desc: 'pelat, kačkavalj, masline', price: [['25 cm', 450], ['32 cm', 850], ['50 cm', 1300]] },
          { id: 'lf-capricciosa', name: 'Capricciosa', desc: 'pelat, kačkavalj, šampinjoni, masline, šunka', price: [['25 cm', 550], ['32 cm', 1000], ['50 cm', 1550]] },
          { id: 'lf-funghi', name: 'Funghi', desc: 'pelat, kačkavalj, šampinjoni, masline, origano', price: [['25 cm', 500], ['32 cm', 900], ['50 cm', 1350]] },
          { id: 'lf-quattro', name: 'Quattro', desc: 'pelat, kačkavalj, feferoni, šampinjoni, šunka, pečenica, kulen, jaje, masline', price: [['25 cm', 600], ['32 cm', 1150], ['50 cm', 1950]] },
          { id: 'lf-life', name: 'Life', desc: 'pelat, kačkavalj, šampinjoni, šunka, pečenica, slanina, jaja, paprika, masline, beli luk', price: [['25 cm', 650], ['32 cm', 1200], ['50 cm', 2000]] },
          { id: 'lf-krajinska', name: 'Krajinska', desc: 'pelat, kačkavalj, šampinjoni, suvi vrat, jaja, susam, kajmak, masline', price: [['25 cm', 600], ['32 cm', 1150], ['50 cm', 1950]] },
          { id: 'lf-piletina', name: 'Piletina', desc: 'pelat, kačkavalj, šampinjoni, piletina, paprika, feta sir, susam, masline', price: [['25 cm', 600], ['32 cm', 1150], ['50 cm', 1950]] },
          { id: 'lf-diablo', name: 'Diablo', desc: 'pelat, čili, kačkavalj, kulen, šampinjoni, masline, feferoni', price: [['25 cm', 550], ['32 cm', 1000], ['50 cm', 1550]] },
          { id: 'lf-madjarica', name: 'Mađarica', desc: 'pelat, kačkavalj, šunka, kulen, šampinjoni, feta sir, masline, feferoni', price: [['25 cm', 600], ['32 cm', 1150], ['50 cm', 1950]] },
          { id: 'lf-tuna', name: 'Tuna', desc: 'pelat, šampinjoni, kačkavalj (mlečni ili biljni), tunjevina, crveni luk, crvena paprika, kukuruz, masline', price: [['25 cm', 550], ['32 cm', 1000], ['50 cm', 1850]] },
          { id: 'lf-vegetarijana', name: 'Vegetarijana', desc: 'pelat, biljni kačkavalj, šampinjoni, crvena paprika, luk, kukuruz, paradajz, beli luk, masline', price: [['25 cm', 550], ['32 cm', 1000], ['50 cm', 1850]] },
          { id: 'lf-calzone', name: 'Calzone', desc: 'pelat, kačkavalj, šunka, šampinjoni, pavlaka, masline, origano', weight: '32 cm', price: 950 },
          { id: 'lf-rubovi', name: 'Punjeni rubovi (dodatak za picu)', price: [['32 cm', 200], ['50 cm', 250]] },
        ],
      },
      {
        title: 'Doručak',
        emoji: '🍳',
        cat: 'dorucak',
        note: 'Od 08h do 13h',
        items: [
          { id: 'lf-life-dorucak', name: 'Life doručak', desc: 'pečenica, 3 jaja (na oko ili omlet), pavlaka, kačkavalj, paradajz, feferoni, masline, lepinja', price: 550 },
          { id: 'lf-domaci-dorucak', name: 'Domaći doručak', desc: 'kobasice, pomfrit, 3 jaja (na oko ili omlet), feta, ajvar, feferoni, masline, lepinja', price: 550 },
          { id: 'lf-omlet-tortilja', name: 'Omlet u tortilji', desc: 'tortilja, jaje, pavlaka, kačkavalj, pečenica, ajvar; uz pomfrit, tzatziki i kečap', price: 550 },
          { id: 'lf-srpski-dorucak', name: 'Srpski doručak', desc: 'dimljeni vrat, 3 jaja (na oko ili omlet), kajmak, prženice, paradajz, pomfrit, masline, feferoni', price: 600 },
        ],
      },
      {
        title: 'Sendviči',
        emoji: '🥪',
        cat: 'sendvic',
        note: 'Od 08h do 13h',
        items: [
          { id: 'lf-sendvic-sunka', name: 'Sendvič sa šunkom', desc: 'kečap, pavlaka, sendvič sos, kačkavalj, salata, šunka, susam', price: 320 },
          { id: 'lf-sendvic-pecenica', name: 'Sendvič sa pečenicom', desc: 'kečap, pavlaka, sendvič sos, kačkavalj, salata, pečenica, susam', price: 350 },
          { id: 'lf-sendvic-kulen', name: 'Sendvič sa kulenom', desc: 'kečap, pavlaka, sendvič sos, kačkavalj, salata, kulen, susam', price: 350 },
          { id: 'lf-sendvic-vrat', name: 'Sendvič sa dimljenim vratom', desc: 'kečap, pavlaka, sendvič sos, kačkavalj, salata, dimljeni vrat, susam', price: 380 },
          { id: 'lf-tuna-sendvic', name: 'Tuna sendvič', desc: 'kečap, tuna, kačkavalj (mlečni ili biljni), salata, susam', price: 350 },
          { id: 'lf-preklopljeni', name: 'Preklopljeni sendvič', desc: 'pelat, kačkavalj, šunka, šampinjoni, tzatziki sos, origano', price: 420 },
          { id: 'lf-sendvic-life', name: 'Sendvič Life', desc: 'kečap, pavlaka, sendvič sos, kačkavalj, salata, šunka, pečenica, kulen, susam', price: 450 },
          { id: 'lf-klub', name: 'Klub sendvič', desc: 'tost hleb, namaz, šunka, pečenica, jaje, salata, pomfrit, kečap', price: 600 },
        ],
      },
      {
        title: 'Piletina i kačkavalj',
        emoji: '🍗',
        items: [
          { id: 'lf-pilece-belo', name: 'Pileće belo', desc: 'piletina, paradajz, tzatziki sos, hleb, masline', price: 750 },
          { id: 'lf-pohovana-piletina', name: 'Pohovana piletina', desc: 'piletina, pomfrit, kečap, tzatziki sos, susam', price: 900 },
          { id: 'lf-pohovani-kackavalj', name: 'Pohovani kačkavalj', desc: 'kačkavalj, pomfrit, kečap, tzatziki sos, susam', price: 650 },
          { id: 'lf-crispy-mix', name: 'Crispy mix', desc: 'pohovani kačkavalj, pohovana piletina, pohovane pečurke, pomfrit, kečap, tzatziki sos', price: 1000 },
        ],
      },
      {
        title: 'Pasta',
        emoji: '🍝',
        cat: 'pasta',
        items: [
          { id: 'lf-bolonjeze', name: 'Bolonjeze', desc: 'mleveno meso u sosu od paradajza, Barilla testenina, parmezan', price: 850 },
          { id: 'lf-pollo-funghi', name: 'Pollo funghi', desc: 'pileći file i šampinjoni u krem sosu, začini, Barilla testenina, parmezan', price: 900 },
        ],
      },
      {
        title: 'Salate',
        emoji: '🥗',
        cat: 'salata',
        items: [
          { id: 'lf-pileca-salata', name: 'Pileća salata', desc: 'majonez, pavlaka, ajsberg, kukuruz, paradajz, piletina, masline, origano', price: 650 },
          { id: 'lf-fitnes', name: 'Fitnes pileća salata', desc: 'piletina, paradajz, ajsberg, feta sir, masline, origano', price: 650 },
          { id: 'lf-tuna-salata', name: 'Tuna salata', desc: 'tunjevina, ajsberg, paradajz, crni luk, masline', price: 650 },
        ],
      },
      {
        title: 'Rol slane palačinke',
        emoji: '🫓',
        cat: 'palacinke',
        items: [
          { id: 'lf-pal-sunka', name: 'Šunka', desc: 'šunka, kačkavalj, kečap, pavlaka, pečurke, susam, origano', price: 500 },
          { id: 'lf-pal-pecenica', name: 'Pečenica', desc: 'pečenica, kačkavalj, kečap, pavlaka, pečurke, susam, origano', price: 550 },
          { id: 'lf-pal-cili', name: 'Čili', desc: 'čili sos, kečap, pavlaka, kulen, kačkavalj, pečurke, susam, origano', price: 550 },
          { id: 'lf-pal-vrat', name: 'Dimljeni vrat', desc: 'dimljeni vrat, kačkavalj, kečap, pavlaka, pečurke, susam, origano', price: 550 },
          { id: 'lf-pal-life', name: 'Life', desc: 'kačkavalj, kečap, pavlaka, šunka, pečenica, kulen, pečurke, susam, origano', price: 650 },
          { id: 'lf-pal-pohovana', name: 'Pohovana palačinka po izboru', desc: 'dodatak na slanu palačinku', price: 100 },
        ],
      },
      {
        title: 'Slatke palačinke',
        emoji: '🥞',
        cat: 'palacinke',
        items: [
          { id: 'lf-med-orasi', name: 'Med i orasi', price: 350 },
          { id: 'lf-krem', name: 'Krem', price: 270 },
          { id: 'lf-krem-vanila', name: 'Krem od vanile', price: 270 },
          { id: 'lf-krem-plazma', name: 'Krem, plazma', price: 300 },
          { id: 'lf-vanila-plazma', name: 'Krem od vanile, plazma', price: 300 },
          { id: 'lf-vocno', name: 'Voćno punjenje', desc: 'višnja, narandža ili jagoda', price: 300 },
          { id: 'lf-nutela', name: 'Nutela', price: 320 },
          { id: 'lf-nutela-plazma', name: 'Nutela, plazma', price: 350 },
          { id: 'lf-nutela-plazma-mleko', name: 'Nutela, plazma, mleko', price: 400 },
          { id: 'lf-nutela-split', name: 'Nutela split', desc: 'nutela, banana, plazma, čoko preliv', price: 400 },
          { id: 'lf-snikers', name: 'Snikers', desc: 'nutela, plazma, kikiriki, čoko preliv, karamel preliv', price: 450 },
          { id: 'lf-rafaelo', name: 'Rafaelo', desc: 'beli krem, kokos, šlag', price: 400 },
          { id: 'lf-jafa', name: 'Jafa', desc: 'narandža punjenje, nutela, plazma, čoko preliv', price: 450 },
          { id: 'lf-coko-visnja', name: 'Čoko višnja', desc: 'višnja, nutela, plazma, čoko preliv', price: 450 },
          { id: 'lf-kapri', name: 'Kapri', desc: 'beli krem, jagoda, plazma, voćni preliv', price: 400 },
          { id: 'lf-vanila-visnja', name: 'Vanila višnja', desc: 'vanila, višnja, plazma, voćni preliv', price: 400 },
          { id: 'lf-dubai', name: 'Dubai', desc: 'pistać krem, kadaif, nutela, preliv', price: 650 },
          { id: 'lf-biscoff', name: 'Biscoff', desc: 'biscoff krem, banane, šlag', price: 550 },
        ],
      },
      {
        title: 'Belgijski vafli',
        emoji: '🧇',
        cat: 'desert',
        items: [
          { id: 'lf-coko-vafl', name: 'Čoko vafl', desc: 'nutela, plazma, čoko preliv, šlag', price: 400 },
          { id: 'lf-vocni-vafl', name: 'Voćni vafl', desc: 'višnja, banana, preliv od jagode, preliv od šumskog voća, šlag', price: 400 },
          { id: 'lf-mix-vafl', name: 'Mix vafl', desc: 'nutela, višnja, banana, plazma, čoko i voćni preliv, šlag', price: 450 },
        ],
      },
      {
        title: 'Dodaci',
        emoji: '🍟',
        items: [
          { id: 'lf-pavlaka', name: 'Pavlaka', price: 150 },
          { id: 'lf-majonez', name: 'Majonez', price: 150 },
          { id: 'lf-jaje', name: 'Jaje', price: 100 },
          { id: 'lf-feferoni', name: 'Feferoni', price: 150 },
          { id: 'lf-masline', name: 'Masline', price: 150 },
          { id: 'lf-pomfrit', name: 'Pomfrit', weight: '300 g', price: 400 },
          { id: 'lf-tzatziki', name: 'Tzatziki sos', price: 150 },
          { id: 'lf-hleb', name: 'Hleb', price: 100 },
          { id: 'lf-slag', name: 'Šlag', price: 100 },
          { id: 'lf-kukuruz', name: 'Kukuruz', price: 150 },
        ],
      },
    ],
  },
  {
    // pravi meni sa lamoara.rs (jelovnik, novembar 2026), bez karte pića
    slug: 'la-moara',
    name: 'La Moara',
    logo: 'La Moara',
    realMenu: true,
    service: 'food',
    emoji: '🍷',
    about: 'Internacionalna i domaća kuhinja: roštilj, stekovi, riba, pica, pasta, rižoto i poslastice.',
    request: {
      label: 'Napomena za La Moaru',
      placeholder: 'npr. pljeskavica bez luka, biftek medium, dodatni kajmak.',
      checkoutOnly: true,
    },
    menu: [
      {
        title: 'Doručak',
        emoji: '🍳',
        cat: 'dorucak',
        note: 'Služi se do 12h',
        items: [
          { id: 'lm-kobasica-lepinja', name: 'Domaća kobasica u lepinji', desc: 'domaća lepinja, domaća kobasica, zelena salata; kečap ili senf', price: 370 },
          { id: 'lm-jaja-slanina', name: 'Jaja na oko sa slaninom', desc: 'tri jaja, slanina, pavlaka, paradajz, hleb', price: 600 },
          { id: 'lm-jaja-sunka', name: 'Jaja na oko sa šunkom', desc: 'tri jaja, šunka, pavlaka, paradajz, hleb', price: 600 },
          { id: 'lm-omlet-pecurke', name: 'Omlet sa pečurkama', price: 450 },
          { id: 'lm-omlet-sir', name: 'Omlet sa sirom', price: 450 },
          { id: 'lm-omlet-sunka', name: 'Omlet sa šunkom', price: 530 },
          { id: 'lm-placinte', name: 'Plaćinte', desc: 'uz pavlaku i ajvar', price: 500 },
          { id: 'lm-waffle-slani', name: 'Slani waffle', desc: 'aladona sos, jaja, pančeta, pica sir', price: 600 },
        ],
      },
      {
        title: 'Sendviči i starteri',
        emoji: '🥪',
        cat: 'sendvic',
        items: [
          { id: 'lm-mlinarski', name: 'Mlinarski sendvič', weight: '500 g', desc: 'masline, paprika, rukola, pršuta, kajmak', price: 900 },
          { id: 'lm-pohovana-palacinka', name: 'Pohovana slana palačinka', desc: 'gauda, šunka, pečurke, pavlaka', price: 770, cat: 'palacinke' },
          { id: 'lm-wrap', name: 'Wrap sa pilećim fileom', weight: '300 g', desc: 'uz pomfrit', price: 900, cat: 'giros' },
          { id: 'lm-mirocki', name: 'Grilovani miročki sir', weight: '150 g', price: 460 },
          { id: 'lm-karpaco', name: 'Karpačo od bifteka', weight: '120 g', desc: 'kriške hleba, rukola, parmezan', price: 2000 },
          { id: 'lm-pohovani-kackavalj', name: 'Pohovani kačkavalj', weight: '150 g', desc: 'uz aladona sos', price: 710 },
          { id: 'lm-punjena-paprika', name: 'Punjena pohovana paprika', price: 600 },
        ],
      },
      {
        title: 'Sirevi i suhomesnato',
        emoji: '🧀',
        note: 'Cene za 50 g',
        items: [
          { id: 'lm-brie', name: 'Brie sir', weight: '50 g', price: 330 },
          { id: 'lm-dimljeni-sir', name: 'Dimljeni sir', weight: '50 g', price: 230 },
          { id: 'lm-gorgonzola', name: 'Gorgonzola', weight: '50 g', price: 330 },
          { id: 'lm-govedja-prsuta', name: 'Goveđa pršuta', weight: '50 g', price: 580 },
          { id: 'lm-kozji', name: 'Kozji sir', weight: '50 g', price: 250 },
          { id: 'lm-kravlji', name: 'Kravlji sir', weight: '50 g', price: 200 },
          { id: 'lm-kulen', name: 'Kulen', weight: '50 g', price: 310 },
          { id: 'lm-ovciji', name: 'Ovčiji sir', weight: '50 g', price: 230 },
          { id: 'lm-parmezan', name: 'Parmezan', weight: '50 g', price: 450 },
          { id: 'lm-pecenica', name: 'Pečenica', weight: '50 g', price: 380 },
          { id: 'lm-suvi-vrat', name: 'Suvi vrat', weight: '50 g', price: 390 },
          { id: 'lm-svinjska-prsuta', name: 'Svinjska pršuta', weight: '50 g', price: 450 },
        ],
      },
      {
        title: 'Obrok salate, supe i čorbe',
        emoji: '🥗',
        cat: 'salata',
        items: [
          { id: 'lm-cezar-gambori', name: 'Cezar salata sa gamborima', weight: '300 g', desc: 'zelena salata, cezar dresing, gambori, pančeta, čeri paradajz, parmezan, krutoni', price: 1500 },
          { id: 'lm-cezar-piletina', name: 'Cezar salata sa piletinom', weight: '300 g', desc: 'zelena salata, cezar dresing, pileći file, pančeta, čeri paradajz, parmezan, krutoni', price: 1120 },
          { id: 'lm-negotinska', name: 'Negotinska salata', desc: 'krastavac, feta sir, pečena slatka paprika, paradajz, susam, hleb sa semenkama', price: 810 },
          { id: 'lm-corba', name: 'Čorba dana', weight: '300 ml', price: 470, cat: 'kuvano' },
          { id: 'lm-potaz', name: 'Potaž dana', price: 470, cat: 'kuvano' },
        ],
      },
      {
        title: 'Pica',
        emoji: '🍕',
        cat: 'pica',
        items: [
          { id: 'lm-capricciosa', name: 'Capricciosa', desc: 'pica sir, šunka, šampinjoni, masline, pelat', price: 1100 },
          { id: 'lm-margarita', name: 'Margarita', desc: 'pica sir i pelat', price: 980 },
          { id: 'lm-paesano', name: 'Paesano', desc: 'šunka, pančeta, šampinjoni, feta sir, pica sir', price: 1700 },
          { id: 'lm-peperoni', name: 'Peperoni', desc: 'pelat, pica sir, peperoni', price: 1260 },
          { id: 'lm-prosciutto', name: 'Prosciutto', desc: 'pršuta, pica sir, rukola, pelat', price: 1500 },
          { id: 'lm-quattro-formaggi-pica', name: 'Quattro formaggi', desc: 'kačkavalj, gorgonzola, parmezan i dimljeni sir', price: 1300 },
          { id: 'lm-vegetariana', name: 'Vegetariana', desc: 'pelat, paprika, pečurke, tikvice, patlidžan', price: 960 },
        ],
      },
      {
        title: 'Pasta i rižoto',
        emoji: '🍝',
        cat: 'pasta',
        items: [
          { id: 'lm-bolonjeze', name: 'Bolonjeze', weight: '320 g', desc: 'parmezan, mleveno meso, pelat', price: 1400 },
          { id: 'lm-karbonara', name: 'Karbonara', weight: '320 g', desc: 'pančeta, parmezan, jaje, neutralna pavlaka, beli luk', price: 1300 },
          { id: 'lm-pollo-penne', name: 'Pollo penne', desc: 'piletina i pečurke', price: 1100 },
          { id: 'lm-quattro-formaggi-pasta', name: 'Pasta quattro formaggi', weight: '320 g', desc: 'kačkavalj, gorgonzola, parmezan i dimljeni sir', price: 1200 },
          { id: 'lm-rizoto-gambori', name: 'Kremasti rižoto sa gamborima', price: 1650 },
          { id: 'lm-rizoto-pecurke', name: 'Rižoto sa pečurkama', price: 750 },
          { id: 'lm-rizoto-piletina', name: 'Rižoto sa piletinom i karijem', price: 850 },
        ],
      },
      {
        title: 'Riba',
        emoji: '🐟',
        cat: 'kuvano',
        items: [
          { id: 'lm-brancin', name: 'Brancin', weight: '400 g', desc: 'uz dalmatinsku garnituru', price: 3000 },
          { id: 'lm-losos', name: 'File svežeg lososa', weight: '200 g', desc: 'uz grilovano povrće', price: 2780 },
          { id: 'lm-smudj', name: 'Filet smuđa', weight: '400 g', desc: 'uz dalmatinsku garnituru', price: 3030 },
          { id: 'lm-pastrmka', name: 'Pastrmka', weight: '350 g', desc: 'uz grilovano povrće', price: 1430 },
        ],
      },
      {
        title: 'Glavna jela',
        emoji: '🍽️',
        cat: 'kuvano',
        items: [
          { id: 'lm-burger', name: 'Burger', weight: '250 g', desc: 'juneće meso, kiseli krastavčići, crni luk, zelena salata, čedar, burger sos, pančeta, pomfrit', price: 1600, cat: 'burger' },
          { id: 'lm-crispy', name: 'Crispy piletina', weight: '250 g', desc: 'uz aladona sos, pomfrit i kečap', price: 1250 },
          { id: 'lm-jagnjetina', name: 'Jagnjetina ispod sača', weight: '330 g', desc: 'uz krompir', price: 2500 },
          { id: 'lm-karadjordjeva', name: 'Karađorđeva šnicla', weight: '300 g', desc: 'uz pomfrit', price: 1700 },
          { id: 'lm-pikantni-file', name: 'Pikantni svinjski file', desc: 'medaljoni od svinjskog filea, pikantni sos, grilovano povrće', price: 1650 },
          { id: 'lm-piletina-sirevi', name: 'Piletina četiri vrste sira', weight: '300 g', desc: 'parmezan, dimljeni sir, gorgonzola, kačkavalj', price: 1530 },
          { id: 'lm-rebarca', name: 'Svinjska rebarca na žaru', weight: '300 g', desc: 'uz wedges krompir, kajmak i BBQ sos', price: 1900 },
          { id: 'lm-vrat-sef', name: 'Svinjski vrat na način šefa kuhinje', weight: '300 g', desc: 'uz pekarski krompir na seljački način', price: 1600 },
          { id: 'lm-teletina', name: 'Teletina ispod sača', desc: 'uz krompir', price: 3000 },
        ],
      },
      {
        title: 'Jela sa roštilja',
        emoji: '🔥',
        cat: 'rostilj',
        items: [
          { id: 'lm-vesalica', name: 'Bela vešalica', weight: '400 g', desc: 'uz pomfrit', price: 1480 },
          { id: 'lm-cevapi', name: 'Ćevapi u balon lepinji', desc: 'uz kajmak i crni luk', price: [['250 g', 1400], ['500 g', 1750]] },
          { id: 'lm-dimljeni-vrat', name: 'Dimljeni vrat', weight: '400 g', desc: 'uz pomfrit', price: 1750 },
          { id: 'lm-pljeskavica', name: 'Domaća pljeskavica', desc: 'uz pomfrit, crni luk i čeri paradajz', price: [['250 g', 1400], ['500 g', 1750]] },
          { id: 'lm-hajduk-veljkova', name: 'Hajduk Veljkova sablja', weight: '300 g', desc: 'svinjski file, slanina, pirinač, paprika, paradajz', price: 1790 },
          { id: 'lm-biftek', name: 'Juneći biftek na žaru', weight: '250 g', desc: 'uz wedges krompir', price: 3700 },
          { id: 'lm-kobasice', name: 'Kobasice', weight: '350 g', desc: 'uz senf, ljuti sos i pomfrit', price: 1350 },
          { id: 'lm-la-moara-pljeskavica', name: 'La Moara pljeskavica', weight: '400 g', desc: 'punjena suvim mesom i gaudom', price: 1950 },
          { id: 'lm-negotinski-cevapi', name: 'Negotinski ćevapi', weight: '250 g', desc: 'roštilj meso, paprika, kajmak', price: 1450 },
          { id: 'lm-ovcetina', name: 'Ovčetina na žaru', weight: '1 kg', price: 3400 },
          { id: 'lm-ovcija-kobasica', name: 'Ovčija kobasica', weight: '350 g', desc: 'uz pomfrit', price: [['klasik', 1200], ['pikant', 1200]] },
          { id: 'lm-ovcija-pljeskavica', name: 'Ovčija pljeskavica', desc: 'uz pomfrit, crni luk i čeri paradajz', price: [['250 g', 1400], ['500 g', 1800]] },
          { id: 'lm-dzigerica', name: 'Pileća džigerica', desc: 'uz restovan krompir sa lukom', price: 1130 },
          { id: 'lm-pletenica', name: 'Pletenica', weight: '400 g', desc: 'uz pomfrit', price: 1480 },
        ],
      },
      {
        title: 'Stekovi',
        emoji: '🥩',
        cat: 'rostilj',
        note: 'Dry aged, 50 dana odležano · cena za 100 g, količina je broj po 100 g',
        items: [
          { id: 'lm-rib-eye', name: 'Rib-eye steak', weight: '100 g', desc: 'odrezak oko rebara, jedan od najcenjenijih', price: 1300 },
          { id: 'lm-striploin', name: 'Striploin steak', weight: '100 g', desc: 'bez kostiju, odličan balans ukusa i nežnosti', price: 1300 },
          { id: 'lm-t-bone', name: 'T-bone steak', weight: '100 g', desc: 'odrezak sa kosti u obliku slova T', price: 990 },
          { id: 'lm-tomahawk', name: 'Tomahawk steak', weight: '100 g', desc: 'odrezak od rebara sa kosti, kralj stekova', price: 1350 },
        ],
      },
      {
        title: 'Prilozi i pecivo',
        emoji: '🍟',
        items: [
          { id: 'lm-dodatak', name: 'Dodatak uz jelo', desc: 'pečurke, šunka, feferoni… (napišite u napomeni)', price: 120 },
          { id: 'lm-gorgonzola-sos', name: 'Gorgonzola sos', weight: '100 g', price: 450 },
          { id: 'lm-grilovano-povrce', name: 'Grilovano povrće', weight: '300 g', price: 520 },
          { id: 'lm-kecap-majonez', name: 'Kečap, majonez, pavlaka ili kajmak', weight: '50 g', price: 150 },
          { id: 'lm-seljacki', name: 'Krompir na seljački način', weight: '300 g', price: 420 },
          { id: 'lm-pomfrit', name: 'Pomfrit', weight: '250 g', price: 350 },
          { id: 'lm-wedges', name: 'Wedges krompir', weight: '300 g', price: 380 },
          { id: 'lm-fokaca', name: 'Fokača (bela pica)', price: 270 },
          { id: 'lm-lepinja', name: 'Lepinja od pica testa', price: 270 },
        ],
      },
      {
        title: 'Salate',
        emoji: '🥬',
        cat: 'salata',
        items: [
          { id: 'lm-basta', name: 'Bašta salata', weight: '600 g', desc: 'paradajz, krastavac, paprika, luk, ljuta papričica', price: 880 },
          { id: 'lm-belolucana', name: 'Belolučana paprika 1 kom', price: 250 },
          { id: 'lm-grcka', name: 'Grčka salata', weight: '300 g', price: 700 },
          { id: 'lm-krastavac', name: 'Krastavac salata', weight: '200 g', price: 390 },
          { id: 'lm-kupus', name: 'Kupus salata', weight: '150 g', price: 280 },
          { id: 'lm-ljute', name: 'Pečena ljuta papričica 1 kom', price: 120 },
          { id: 'lm-mix-zelenih', name: 'Mix zelenih salata', weight: '120 g', price: 350 },
          { id: 'lm-moravska', name: 'Moravska salata', weight: '300 g', price: 500 },
          { id: 'lm-paradajz', name: 'Paradajz salata', weight: '200 g', price: 450 },
          { id: 'lm-sopska', name: 'Šopska salata', weight: '300 g', price: 600 },
          { id: 'lm-urnebes', name: 'Urnebes', weight: '200 g', price: 500 },
          { id: 'lm-vitaminska', name: 'Vitaminska salata', weight: '200 g', price: 420 },
        ],
      },
      {
        title: 'Poslastice',
        emoji: '🍰',
        cat: 'desert',
        items: [
          { id: 'lm-1000-listica', name: '1000 listića', desc: 'krem od vanile, listići slatke kore, bobičasto voće', price: 500 },
          { id: 'lm-baklava', name: 'Baklava', desc: 'posna, sa posnom čokoladom, orasima i suvim grožđem', price: 480 },
          { id: 'lm-sufle', name: 'Čokoladni sufle', price: 500 },
          { id: 'lm-dubai', name: 'Dubai palačinke sa crvenim voćem', price: 900, cat: 'palacinke' },
          { id: 'lm-ferrero', name: 'Ferrero palačinke', price: 800, cat: 'palacinke' },
          { id: 'lm-kinder', name: 'Kinder Bueno palačinke', price: 800, cat: 'palacinke' },
          { id: 'lm-raffaello', name: 'Raffaello palačinke', price: 800, cat: 'palacinke' },
          { id: 'lm-palacinke', name: 'Palačinke', desc: 'med, orasi, krem, Nutella ili plazma (napišite u napomeni)', price: 460, cat: 'palacinke' },
          { id: 'lm-mak', name: 'Kolač od maka', price: 600 },
          { id: 'lm-orasnice', name: 'Orasnice', price: 450 },
          { id: 'lm-slatka-pica', name: 'Slatka pica', desc: 'Nutella, bela i crna čokolada, narandža, jabuka, bobičasto voće', price: 1500 },
          { id: 'lm-tiramisu', name: 'Tiramisu', price: 550 },
          { id: 'lm-trilece', name: 'Trileće', price: 450 },
          { id: 'lm-waffle-berry', name: 'Waffle chocko & berry', desc: 'bela i crna čokolada, šumsko voće', price: 500 },
          { id: 'lm-waffle-honey', name: 'Waffle honey', desc: 'med i orasi', price: 480 },
        ],
      },
    ],
  },

  // ---------------- PIĆE I NAMIRNICE ----------------
  {
    // pravi cenovnik marketa Aleksandrović (11.11.2026), samo osnovni artikli; cene se menjaju, pa ih povremeno osvežiti
    slug: 'aleksandrovic',
    name: 'Super Market Aleksandrović',
    logo: 'Aleksandrović',
    realMenu: true,
    service: 'market',
    emoji: '🛒',
    about: 'Super Market Aleksandrović, Trg Đorđa Stanojevića 68, Negotin. Hleb, mleko, voće i povrće, namirnice, piće i sve za kuću. Voće i povrće se plaća po izmerenoj težini.',
    request: { label: 'Nešto što nije na spisku?', placeholder: 'npr. pavlaka 700 g Imlek, 2 kg brašna T-500, deterdžent za veš Persil' },
    menu: [
      { title: 'Hleb i peciva', cat: 'pekara', emoji: '🥖', items: [
        { id: 'al-hleb-domaci-zajecarski-500-g', name: 'Hleb domaći, Zaječarski', weight: '500 g', price: 65 },
        { id: 'al-hleb-srpski-beli-rezani-500-g', name: 'Hleb srpski beli, rezani', weight: '500 g', price: 95 },
        { id: 'al-hleb-crni-rezani-500-g', name: 'Hleb crni, rezani', weight: '500 g', price: 110 },
        { id: 'al-hleb-7-zrna-rezani-450-g', name: 'Hleb 7 zrna, rezani', weight: '450 g', price: 115 },
        { id: 'al-tost-hleb-classic-500-g', name: 'Tost hleb Classic', weight: '500 g', price: 160 },
        { id: 'al-kore-za-pitu-iva-500-g', name: 'Kore za pitu Iva', weight: '500 g', price: 179.99 },
      ] },
      { title: 'Mleko, jaja i sir', cat: 'mlecno', emoji: '🥛', items: [
        { id: 'al-mleko-2-8-imlek-1-l', name: 'Mleko 2,8% Imlek', weight: '1 l', price: 104.99 },
        { id: 'al-mleko-1-5-imlek-1-l', name: 'Mleko 1,5% Imlek', weight: '1 l', price: 129.99 },
        { id: 'al-jogurt-gusti-2-8-imlek-1-75-kg', name: 'Jogurt Gusti 2,8% Imlek', weight: '1,75 kg', price: 184.99 },
        { id: 'al-jogurt-2-8-imlek-casa', name: 'Jogurt 2,8% Imlek, čaša', price: 39.99 },
        { id: 'al-kiselo-mleko-imlek-700-g', name: 'Kiselo mleko Imlek', weight: '700 g', price: 149.99 },
        { id: 'al-kisela-pavlaka-imlek-400-g', name: 'Kisela pavlaka Imlek', weight: '400 g', price: 149.99 },
        { id: 'al-jaja-l-klasa-10-komada', name: 'Jaja L klasa, 10 komada', price: 174.99 },
        { id: 'al-sir-kravlji-stara-planina-400-g', name: 'Sir kravlji Stara planina', weight: '400 g', price: 449.99 },
        { id: 'al-gauda-paladin-kackavalj-250-g', name: 'Gauda Paladin, kačkavalj', weight: '250 g', price: 349.99 },
        { id: 'al-trapist-paladin-kackavalj-250-g', name: 'Trapist Paladin, kačkavalj', weight: '250 g', price: 349.99 },
        { id: 'al-maslac-imlek-125-g', name: 'Maslac Imlek', weight: '125 g', price: 249.99 },
      ] },
      { title: 'Voće i povrće', cat: 'voce', emoji: '🍎', items: [
        { id: 'al-banane-1-kg', name: 'Banane', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 219.99 },
        { id: 'al-jabuke-ajdared-1-kg', name: 'Jabuke Ajdared', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 89.99 },
        { id: 'al-narandze-1-kg', name: 'Narandže', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 179.99 },
        { id: 'al-mandarine-1-kg', name: 'Mandarine', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 119.99 },
        { id: 'al-limun-1-kg', name: 'Limun', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 159.99 },
        { id: 'al-krompir-1-kg', name: 'Krompir', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 99.99 },
        { id: 'al-crni-luk-1-kg', name: 'Crni luk', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 64.99 },
        { id: 'al-beli-luk-1-kg', name: 'Beli luk', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 349.99 },
        { id: 'al-paradajz-1-kg', name: 'Paradajz', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 199.99 },
        { id: 'al-krastavac-1-kg', name: 'Krastavac', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 159.99 },
        { id: 'al-sargarepa-1-kg', name: 'Šargarepa', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 79.99 },
        { id: 'al-paprika-babura-crvena-1-kg', name: 'Paprika babura crvena', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 259.99 },
        { id: 'al-kupus-1-kg', name: 'Kupus', desc: 'cena za 1 kg, plaća se po izmerenoj težini', weight: '1 kg', price: 69.99 },
        { id: 'al-zelena-salata-komad', name: 'Zelena salata', weight: 'komad', price: 59.99 },
        { id: 'al-persun-veza', name: 'Peršun', weight: 'veza', price: 49.99 },
      ] },
      { title: 'Osnovne namirnice', cat: 'namirnice', emoji: '🧂', items: [
        { id: 'al-brasno-t-400-danubius-1-kg', name: 'Brašno T-400 Danubius', weight: '1 kg', price: 89.99 },
        { id: 'al-secer-crvenka-1-kg', name: 'Šećer Crvenka', weight: '1 kg', price: 109.99 },
        { id: 'al-so-kuhinjska-1-kg', name: 'So kuhinjska', weight: '1 kg', price: 54.99 },
        { id: 'al-ulje-dijamant-1-l', name: 'Ulje Dijamant', weight: '1 l', price: 199.99 },
        { id: 'al-pirinac-biser-900-g', name: 'Pirinač Biser', weight: '900 g', price: 149.99 },
        { id: 'al-spagete-danubius-400-g', name: 'Špagete Danubius', weight: '400 g', price: 69.99 },
        { id: 'al-makarone-danubius-400-g', name: 'Makarone Danubius', weight: '400 g', price: 64.99 },
        { id: 'al-pasulj-tetovac-k-plus-400-g', name: 'Pasulj tetovac K plus', weight: '400 g', price: 169.99 },
        { id: 'al-paradajz-pire-gurman-370-g', name: 'Paradajz pire Gurman', weight: '370 g', price: 199.99 },
        { id: 'al-sok-od-paradajza-gurman-500-ml', name: 'Sok od paradajza Gurman', weight: '500 ml', price: 69.99 },
        { id: 'al-ajvar-podravka-blagi-350-g', name: 'Ajvar Podravka, blagi', weight: '350 g', price: 179.99 },
        { id: 'al-vegeta-200-g', name: 'Vegeta', weight: '200 g', price: 169.99 },
        { id: 'al-biber-mleveni-moravka-50-g', name: 'Biber mleveni Moravka', weight: '50 g', price: 84.99 },
        { id: 'al-aleva-paprika-gold-100-g', name: 'Aleva paprika Gold', weight: '100 g', price: 119.99 },
        { id: 'al-sirce-alkoholno-dijamant-1-l', name: 'Sirće alkoholno Dijamant', weight: '1 l', price: 99.99 },
      ] },
      { title: 'Voda i sokovi', cat: 'pice', emoji: '🧃', items: [
        { id: 'al-rosa-negazirana-1-5-l', name: 'Rosa negazirana', weight: '1,5 l', price: 74.99 },
        { id: 'al-rosa-negazirana-balon-6-l', name: 'Rosa negazirana, balon', weight: '6 l', price: 249.99 },
        { id: 'al-knjaz-milos-0-5-l', name: 'Knjaz Miloš', weight: '0,5 l', price: 54.99 },
        { id: 'al-koka-kola-2-l', name: 'Koka-Kola', weight: '2 l', price: 189.99 },
        { id: 'al-koka-kola-1-5-l', name: 'Koka-Kola', weight: '1,5 l', price: 159.99 },
        { id: 'al-koka-kola-zero-1-5-l', name: 'Koka-Kola Zero', weight: '1,5 l', price: 159.99 },
        { id: 'al-fanta-narandza-1-5-l', name: 'Fanta narandža', weight: '1,5 l', price: 159.99 },
        { id: 'al-next-breskva-1-l', name: 'Next breskva', weight: '1 l', price: 169.99 },
      ] },
      { title: 'Kafa i čaj', cat: 'kafa', emoji: '☕', items: [
        { id: 'al-doncafe-moment-200-g', name: 'Doncafe Moment', weight: '200 g', price: 469.99 },
        { id: 'al-doncafe-moment-500-g', name: 'Doncafe Moment', weight: '500 g', price: 949.99 },
        { id: 'al-c-kafa-200-g', name: 'C kafa', weight: '200 g', price: 429.99 },
        { id: 'al-grand-3u1-classic-kesica', name: 'Grand 3u1 Classic, kesica', price: 24.99 },
        { id: 'al-nescafe-classic-crema-95-g', name: 'Nescafe Classic Crema', weight: '95 g', price: 539.99 },
      ] },
      { title: 'Slatkiši i grickalice', cat: 'slatkisi', emoji: '🍫', items: [
        { id: 'al-plazma-300-g', name: 'Plazma', weight: '300 g', price: 329.99 },
        { id: 'al-milka-jagoda-100-g', name: 'Milka jagoda', weight: '100 g', price: 159.99 },
        { id: 'al-smoki-150-g', name: 'Smoki', weight: '150 g', price: 124.99 },
        { id: 'al-chio-cips-slani-80-g', name: 'Chio čips, slani', weight: '80 g', price: 119.99 },
      ] },
      { title: 'Kućna hemija i papir', cat: 'kuca', emoji: '🧽', items: [
        { id: 'al-toalet-papir-perfex-10-rolni', name: 'Toalet papir Perfex, 10 rolni', price: 269.99 },
        { id: 'al-ubrus-perfetto-1-rolna', name: 'Ubrus Perfetto', weight: '1 rolna', price: 109.99 },
        { id: 'al-salvete-fresh-100-komada', name: 'Salvete Fresh, 100 komada', price: 79.99 },
        { id: 'al-papirne-maramice-perfex-100-komada', name: 'Papirne maramice Perfex, 100 komada', price: 109.99 },
        { id: 'al-fairy-limun-za-sudove-450-ml', name: 'Fairy limun, za sudove', weight: '450 ml', price: 179.99 },
        { id: 'al-domestos-750-ml', name: 'Domestos', weight: '750 ml', price: 239.99 },
        { id: 'al-merix-prasak-za-ves-2-25-kg', name: 'Merix prašak za veš', weight: '2,25 kg', price: 479.99 },
        { id: 'al-ariel-prasak-za-ves-1-95-kg', name: 'Ariel prašak za veš', weight: '1,95 kg', price: 799.99 },
      ] },
      { title: 'Lična higijena', cat: 'higijena', emoji: '🧴', items: [
        { id: 'al-sapun-dove-original-90-g', name: 'Sapun Dove Original', weight: '90 g', price: 109.99 },
        { id: 'al-sampon-head-shoulders-classic-330-ml', name: 'Šampon Head & Shoulders Classic', weight: '330 ml', price: 359.99 },
        { id: 'al-pampers-4-62-komada', name: 'Pampers 4, 62 komada', price: 1999.99 },
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
    // torte po narudžbini; cena po parčetu (cenovnik od vlasnice, novembar 2026)
    slug: 'tortica-989',
    name: 'Tortica 989',
    logo: 'Tortica 989',
    realMenu: true,
    // slike radova: src/assets/galerija/tortica-989
    gallery: true,
    service: 'gifts',
    emoji: '🎂',
    about: 'Torte po narudžbini za rođendane, krštenja i venčanja, sa fondanom ili šlagom, po vašoj želji.',
    request: {
      label: 'Kakvu tortu želite?',
      placeholder: 'npr. torta za 20 osoba, tema balerina, natpis „Stana 5“, roze i bela boja, za subotu u 12h. Možete napisati i koja vam se torta sa slika dopala.',
    },
    menu: [
      {
        title: 'Torte po želji',
        emoji: '🎂',
        cat: 'torte-po-zelji',
        note: 'Cena je po parčetu · količina je broj parčadi (osoba)',
        extras: ['slike', 'toperi', 'figure', 'ukrasno cveće (dodatno se naplaćuju, cenu javlja poslastičarnica)'],
        items: [
          { id: 'tc-fondan', name: 'Torta sa fondanom', weight: '1 parče', desc: 'dekoracija od fondana, kao na slikama iznad', price: 240 },
          { id: 'tc-slag', name: 'Torta sa šlagom', weight: '1 parče', desc: 'klasična torta sa šlagom', price: 200 },
        ],
      },
    ],
  },
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

  // ---------------- USLUGE ZA FIRME ----------------
  {
    slug: 'kurir',
    name: 'Beep Beep za firme',
    service: 'other',
    emoji: '💼',
    about: 'Za radnje, lokale i kancelarije: odnesemo pazar u banku, dokumenta u knjigovodstvo ili kod klijenta, platimo račune i preuzmemo pakete, dok vi radite svoj posao.',
    request: { label: 'Šta, odakle i do kada?', placeholder: 'npr. pazar iz radnje na Trgu odneti u banku do 14h. Ili: fakture odneti knjigovođi, Hajduk Veljkova 12.' },
    menu: [
      { title: 'Usluge za firme', items: [
        { id: 'pazar', name: 'Uplata pazara u banku', desc: 'Preuzimamo pazar u radnji i uplaćujemo ga na vaš račun, a potvrdu vraćamo vama', price: null, cat: 'pazar' },
        { id: 'dokumenta', name: 'Dokumenta i pošta', desc: 'Fakture, ugovori i dokumentacija do knjigovođe, banke, opštine ili klijenta', price: null, cat: 'dokumenta' },
        { id: 'racuni', name: 'Plaćanje računa', desc: 'Platimo račune firme u banci ili pošti i donesemo potvrde', price: null, cat: 'racuni' },
        { id: 'paket', name: 'Preuzimanje i slanje paketa', desc: 'Sa pošte, iz kurirske službe ili od dobavljača, do 10 kg', price: null, cat: 'paketi' },
        { id: 'nabavka', name: 'Nabavka za firmu', desc: 'Kancelarijski materijal, potrošni materijal i sitnice koje vam fale. Spisak napišite u polju ispod', price: null, cat: 'paketi' },
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
