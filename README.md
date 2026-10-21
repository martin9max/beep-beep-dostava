# Beep Beep Dostava Negotin

Vite + React + Tailwind CSS v4 + Framer Motion (obican skrol pregledaca, bez dodatnog "glatkog" skrola).

```bash
npm install
npm run dev      # razvoj na http://localhost:5173 (sajt + baza + admin panel)
npm run build    # produkcija u dist/ (sa gotovim HTML-om za pretraživače)
npm start        # produkcija: sajt + baza na http://localhost:3000 (posle npm run build)
npm run brand    # ponovo napravi logo, favicon i sliku za deljenje (samo na Mac-u)
```

Potreban je Node.js 22.13 ili noviji (baza koristi ugrađeni `node:sqlite`).

## Nalozi, baza i porudžbine

- **Baza:** jedan fajl, `data/beepbeep.db` (SQLite). Pravi se sam pri prvom pokretanju. Tabele:
  `users` (korisnici), `logins` (svaki pokušaj prijave i registracija), `sessions` (prijavljeni uređaji),
  `orders` (porudžbine). Lozinke se čuvaju samo kao heš (scrypt), ne mogu se pročitati.
- **Admin panel:** `/admin` (npr. http://localhost:5173/admin). Korisničko ime i lozinka su u `.env.local`
  (`ADMIN_USER`, `ADMIN_PASSWORD`). Tu su porudžbine (sa promenom statusa), korisnici i sve prijave.
- **Bazu direktno:** otvorite `data/beepbeep.db` u programu *DB Browser for SQLite* (besplatan).
- **Rezervna kopija:** dovoljno je kopirati `data/beepbeep.db` (dok server ne radi).
- **Telegram obaveštenja** (jedan bot, dva primaoca):
  - `TELEGRAM_ORDERS_CHAT_ID` – **vlasnik**: svaka nova porudžbina.
  - `TELEGRAM_ACCOUNTS_CHAT_ID` – **administrator sajta**: svaki novi korisnik i problem sa prijavom
    (3 pogrešne lozinke za 15 minuta, ili 3 pokušaja sa telefonom/emailom koji nije registrovan).
  Podešavanje:
  1. U Telegramu otvori **@BotFather**, pošalji `/newbot`, daj ime (npr. „Beep Beep“) i kopiraj **token**.
  2. I vlasnik i administrator pošalju botu bilo koju poruku (npr. „zdravo“).
  3. U pregledaču otvori `https://api.telegram.org/bot<TOKEN>/getUpdates`; kod svake poruke piše
     `"chat":{"id":...` i ime pošiljaoca – to su chat id-jevi.
  4. Upiši token i oba chat id-ja u `.env.local` (na hostingu u „Environment variables“) i ponovo pokreni server.
  Više ljudi u istoj ulozi: chat id-jevi odvojeni zarezom.
- `.env.local` i `data/` se NE stavljaju na GitHub (vidi `.gitignore`).

Kod: `server/` (`db.js` tabele, `auth.js` lozinke i kolačići, `api.js` registracija/prijava/porudžbine,
`admin.js` admin panel, `index.js` produkcijski server). Tokom `npm run dev` sve to radi u Vite serveru.

**Objavljivanje:** sajt više nije samo statičan. Treba hosting koji pokreće Node.js (VPS, Render, Railway,
Fly.io...) sa trajnim diskom za `data/`. Komande: `npm install && npm run build`, pa `npm start`.
Sajt mora ići preko **https** (kolačić za prijavu je `Secure`). Iza proksija postavite `TRUST_PROXY=1`.

## Naručivanje

- `/naruci/<usluga>` – pretraga, kategorije sa slikama i lokali (`src/pages/OrderPage.jsx`)
- `/lokal/<ime>` – digitalni meni lokala (`src/pages/ShopPage.jsx`)
- `/korpa` – korpa iz jednog ili više lokala, adresa i slanje (`src/pages/CheckoutPage.jsx`)
- **Adresa i cena dostave:** kupac pri registraciji bira mesto (Negotin ili selo, `src/places.js`).
  Negotin: dostava 400 din se dodaje u ukupno (`DELIVERY` u `src/data.js`). Selo: ukupno je samo cena
  proizvoda, a cenu dostave javlja dostavljač. Na stranicama za naručivanje ispod zaglavlja stalno stoji
  „Dostava na: … · Promeni adresu“ (`src/components/Address.jsx`); privremena adresa važi samo za tu porudžbinu.
  U admin panelu i Telegram poruci uz adresu ide link za Google mape.
- **Promptovi za slike:** `PROMPTOVI-ZA-SLIKE.md`
- `/prijava`, `/registracija`, `/nalog` – nalog kupca i istorija porudžbina
- **Meniji, cene, lokali i kategorije:** `src/catalog.js`. Trenutne cene su PRIMER, zamenite pravim.
  Server računa cenu iz ovog fajla, pa je kupac ne može promeniti.
- **Slike:** `src/assets/photos/kategorije/<key>.jpg` (npr. `pica.jpg`, `dvesprata.jpg`) i
  `src/assets/photos/lokali/<slug>.jpg` (npr. `picerija-kastelo.jpg`). Dok ih nema, prikazuje se emoji.

## Struktura

- `src/data.js` – sav sadržaj: telefon, navigacija, usluge, pitanja
- `src/sections/` – delovi stranice (Header, Hero, O nama, Usluge, Kontakt/porudžbina, FAQ, Footer)
- `src/components/` – zajedničke komponente (dugme, polje forme, slika, animacije)
- `src/lib/order.js` – validacija telefona i tekst porudžbine
- `src/lib/` – i ruter (`router.jsx`), prijava (`auth.jsx`) i korpa (`cart.jsx`)
- `src/pages/` – podstranice (naručivanje, meni lokala, korpa, prijava, nalog)
- `src/assets/photos/` – fotografije (vidi README u tom folderu i `PROMPTOVI-ZA-SLIKE.md`)
- `src/index.css` – Tailwind tema (boje, fontovi) i stilovi dugmadi

## 3D trokolica na početnom ekranu

- `src/sections/Hero.jsx` – tekst, crvena kartica, bedž; skrol pokreće animaciju
- `src/three/HeroScene.jsx` – svetla, kamera i tok animacije (ulazak, okretanje, zadnja vrata kutije, paket)
- `src/three/Trike.jsx` – trokolica napravljena kodom po fotografiji; natpisi na kutiji se crtaju u `textures.js`
- `src/three/Parcel.jsx` – paket sa nalepnicom

Boje sajta (crvena, bela, plava) su u `src/index.css`, u bloku `@theme`.

## SEO i deljenje linka

- **Domen:** upišite pravu adresu sajta u `.env` (`VITE_SITE_URL`). Od nje se prave canonical link,
  `sitemap.xml`, `robots.txt` i adresa slike za deljenje. Posle promene pokrenite `npm run build`.
- **Gotov HTML:** `npm run build` unapred pravi ceo HTML stranice (`scripts/prerender.mjs`), pa Google,
  Facebook i Viber vide tekst odmah, bez čekanja na JavaScript.
- **Structured data:** firma (LocalBusiness) i česta pitanja (FAQPage) se prave iz `src/data.js`
  (`src/entry-server.jsx`).
- **Naslov i opis** za Google su u `index.html` (`<title>` i `meta description`), a podaci o firmi
  u `src/data.js` (`SITE`, `BUSINESS`).
- **Slika za deljenje:** `public/og-image.png`, pravi je `scripts/brand.swift` iz `branding/logo-source.png`.

## Logo i ikonice

`npm run brand` iseca `branding/logo-source.png` u krug i pravi: logo za zaglavlje (`src/assets/logo.png`),
favicon (`public/favicon.ico`, `favicon-*.png`), ikonice za telefon (`apple-touch-icon.png`, `icon-*.png`),
`site.webmanifest` i `og-image.png`.
