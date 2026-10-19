# Promptovi za slike (Leonardo AI)

Generišite slike, sačuvajte ih **pod tačno ovim imenom fajla** i pošaljite mi ih. Ja ih ubacujem na sajt.

- Promptove kopirajte **na engleskom**; Leonardo daje bolje rezultate.
- U polje **Negative prompt** uvek stavite tekst ispod.
- Nemojte tražiti logo „Beep Beep“ ni bilo kakav natpis. AI pravi pogrešna slova. Logo već postoji na sajtu.
- Ako slika nije dobra, generišite 4 varijante i izaberite najbolju.

**Negative prompt (za sve):**
```
text, letters, words, logo, watermark, signature, brand names, blurry, low quality, distorted hands, extra fingers, deformed face, cropped object, dark, gloomy
```

---

## 1. Usluge na početnoj strani (6 slika)

Kartice „Dostava hrane“, „Piće i namirnice“... Sada umesto njih stoji siv logo.

- **Stil:** fotorealistično, **samo proizvodi izbliza, bez ljudi** (npr. model *Phoenix* ili *Lucid Realism*, stil *Photography*)
- **Format:** **4:3** (npr. 1472 × 1104)
- **Folder:** `src/assets/photos/`

Na kraj svakog prompta dodajte:
```
, professional food and product photography, close-up, no people, no hands, shallow depth of field, vibrant natural colors, red and blue color accents, clean composition, 4k
```

| Fajl | Kartica | Prompt |
|---|---|---|
| `food.jpg` | Dostava hrane | Close-up of a freshly opened takeaway pizza box with a hot pepperoni pizza, next to a paper food bag, a burger and french fries on a wooden table, steam rising |
| `market.jpg` | Piće i namirnice | Close-up of a paper grocery bag full of fresh bread, milk, fruit and bottled water on a kitchen table, bright natural daylight |
| `meds.jpg` | Dostava lekova | Close-up of a white pharmacy paper bag with a green cross, blister packs of pills, a bottle of syrup and a thermometer on a clean white table, soft daylight |
| `flowers.jpg` | Cveće | Close-up of a beautiful colorful flower bouquet of roses, gerberas and tulips wrapped in kraft paper with a ribbon, lying on a light wooden table, soft natural light |
| `gifts.jpg` | Torte i pokloni | Close-up of a chocolate birthday cake with lit candles next to a wrapped gift box with a red ribbon bow, festive mood, soft warm light |
| `other.jpg` | Ostale dostave | Close-up of a set of house keys on a ring, a brown paper envelope with documents and a small taped cardboard parcel on a wooden table, daylight |
---

## 2. Kategorije za brzi izbor (kao na Woltu)

Kvadratne sličice u jednom redu na stranici „Naruči“.

- **Stil:** 3D ikonica, isti za sve, da red izgleda ujednačeno (npr. model *Phoenix*, stil *3D Render*)
- **Format:** **1:1** (npr. 1024 × 1024)
- **Folder:** `src/assets/photos/kategorije/`

Na kraj svakog prompta dodajte (isti završetak za sve):
```
, single object centered, cute glossy 3D render, soft clay style, isometric slight angle, studio lighting, soft shadow, solid pastel background, no text, high detail
```

Savet: pozadinu birajte uvek iste nijanse (npr. svetlo žuta za hranu, svetlo zelena za namirnice, svetlo plava za lekove, svetlo roze za cveće i torte, svetlo ljubičasta za ostalo). Možete dodati npr. `light yellow background` umesto `solid pastel background`.

### Hrana

| Fajl | Prompt |
|---|---|
| `kategorije/burger.png` | a juicy double cheeseburger with melted cheddar, lettuce, tomato and a sesame bun |
| `kategorije/pica.png` | a slice of pepperoni pizza being pulled from a whole pizza with stretchy melted mozzarella |
| `kategorije/palacinke.png` | a stack of thin rolled crepes drizzled with chocolate hazelnut spread and powdered sugar |
| `kategorije/rostilj.png` | Balkan grill platter: cevapi, pljeskavica patty and grilled sausage with chopped onion on a plate |
| `kategorije/giros.png` | a gyros pita wrap with chicken, french fries and tzatziki, wrapped in paper |
| `kategorije/pasta.png` | a bowl of spaghetti carbonara with parmesan shavings and a fork twirling pasta |
| `kategorije/sendvic.png` | a toasted club sandwich cut diagonally showing ham, cheese, lettuce and tomato layers |
| `kategorije/salata.png` | a fresh shopska salad bowl with tomato, cucumber, peppers and grated white cheese |
| `kategorije/dorucak.png` | breakfast plate with sunny side up eggs, crispy bacon and toast |
| `kategorije/kuvano.png` | a deep clay bowl of hearty Balkan stew (goulash) with a slice of bread |
| `kategorije/desert.png` | a glass cup of ice cream scoops with whipped cream and a wafer |

### Namirnice

| Fajl | Prompt |
|---|---|
| `kategorije/pekara.png` | a fresh loaf of bread and a few croissants and rolls in a small basket |
| `kategorije/mlecno.png` | a milk carton, a glass bottle of yogurt and a carton of eggs grouped together |
| `kategorije/pice.png` | a water bottle and two juice bottles grouped together with condensation drops |
| `kategorije/voce.png` | a small crate with apples, bananas, tomatoes and green peppers |
| `kategorije/slatkisi.png` | a chocolate bar with a broken piece, a bag of chips and colorful candies |
| `kategorije/kafa.png` | a coffee cup with a saucer next to a bag of ground coffee and a tea cup |
| `kategorije/higijena.png` | a toilet paper roll, a bottle of dish soap and a bar of soap grouped together |

### Lekovi

| Fajl | Prompt |
|---|---|
| `kategorije/recept.png` | a white pharmacy bag with a green cross and a pill bottle with a prescription paper |
| `kategorije/bezrecepta.png` | a blister pack of pills, a box of bandages and a thermometer |
| `kategorije/vitamini.png` | an orange vitamin jar with orange slices and effervescent tablets |
| `kategorije/bebe.png` | a baby bottle, a pack of diapers and a pacifier |

### Cveće

| Fajl | Prompt |
|---|---|
| `kategorije/buketi.png` | a colorful mixed flower bouquet wrapped in kraft paper with a ribbon |
| `kategorije/ruze.png` | a bouquet of eleven red roses tied with a red ribbon |
| `kategorije/saksije.png` | a potted green houseplant (monstera) in a ceramic pot |
| `kategorije/aranzmani.png` | a flower arrangement in a wicker basket with a small bow |

### Torte i pokloni

| Fajl | Prompt |
|---|---|
| `kategorije/cokoladne.png` | a chocolate layer cake with glossy ganache and chocolate shavings, one slice cut out |
| `kategorije/dvesprata.png` | an elegant two-tier white celebration cake decorated with flowers and pearls |
| `kategorije/vocne.png` | a cake topped with fresh strawberries, raspberries and blueberries |
| `kategorije/decje.png` | a colorful kids birthday cake with sprinkles, a candle and a cute teddy bear figure on top |
| `kategorije/kolaci.png` | an assortment of small pastries: cream slice (krempita), baklava and a cupcake |
| `kategorije/pokloni.png` | a wrapped gift box with a big red ribbon bow and a couple of balloons |

### Ostalo

| Fajl | Prompt |
|---|---|
| `kategorije/dokumenta.png` | a brown paper envelope with documents sticking out and a pen |
| `kategorije/kljucevi.png` | a bunch of house keys on a ring with a small red tag |
| `kategorije/paketi.png` | a cardboard parcel box taped and tied with string |
| `kategorije/spisak.png` | a paper shopping bag full of groceries next to a handwritten shopping list |

---

## 3. Lokali (naslovne slike na karticama lokala)

Za lokale **nemojte koristiti AI**: kupac treba da prepozna pravi lokal. Najbolje je:
- prava fotografija lokala ili njihove hrane (zamolite lokal, ili sa njihovog Instagrama/Facebooka uz njihovu dozvolu), ili
- njihov logo na čistoj pozadini.

- **Format:** široko, **16:9**
- **Folder:** `src/assets/photos/lokali/`

| Fajl | Lokal |
|---|---|
| `lokali/picerija-kastelo.jpg` | Picerija Kastelo |
| `lokali/kafanica.jpg` | Kafanica |
| `lokali/life-picerija.jpg` | Life picerija |
| `lokali/pastizza.jpg` | Pastizza |
| `lokali/la-moara.jpg` | La Moara |
| `lokali/cvecara-cuca.jpg` | Cvećara Cuca |

Za opšte „lokale“ (market, apoteka, poslastičarnica, pokloni, kurir) može AI, istim stilom kao usluge (fotorealistično, 16:9):

| Fajl | Prompt |
|---|---|
| `lokali/market.jpg` | Bright small neighborhood grocery store shelves with fresh bread, fruit and drinks, inviting atmosphere |
| `lokali/apoteka.jpg` | Clean modern pharmacy counter with neatly arranged shelves, soft white and green tones |
| `lokali/poslasticarnica.jpg` | Pastry shop display case with chocolate cakes, fruit cakes and small pastries, warm light |
| `lokali/pokloni.jpg` | Wrapped gift boxes with ribbons and balloons on a table, festive mood |
| `lokali/kurir.jpg` | Red delivery motor tricycle with a thermal delivery box parked on a sunny small town street |

---

## 4. Slika „O nama“ (nije obavezno)

`about.jpg` (format **4:5**) – najbolje **prava fotografija vašeg dostavljača** sa trokolicom. Ljudi više veruju pravoj slici nego AI-ju.
