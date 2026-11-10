# Beep Beep radio

Ovde piše kako radi Beep Beep radio, kako se dodaju pesme i džinglovi, kako se kasnije prelazi na pravi server za radio uživo i šta da pišeš SOKOJ-u i OFPS-u.

## Kako radio radi sada

Radio je deo sajta i ne košta ništa dodatno. Pesme stoje u fascikli `public/radio/pesme`, a džinglovi u `public/radio/dzinglovi`.

Program teče po satu, kao kod pravog radija. Svi slušaoci u istom trenutku čuju istu pesmu, a ko uključi radio, upada usred pesme koja upravo ide. Posle svake dve pesme ide jedan džingl. Redosled pesama se meša u svakom krugu, ali je isti za sve slušaoce.

Dok u fascikli nema pesama, radio pušta samo džinglove, a na stranici piše da muzički program stiže uskoro.

## Odakle sme da se uzme muzika

Pažnja: muzika sa sajtova za „besplatnu muziku“ nije uvek dozvoljena za radio. Pixabay i YouTube Audio Library dozvoljavaju muziku kao podlogu u videu, ali ne i puštanje pesama jedne za drugom, kao na radiju. Zato ih za radio ne koristimo.

Za radio su dobre pesme sa licencom **Creative Commons BY** (CC BY) ili **CC0**:

- **Free Music Archive** (freemusicarchive.org): filtriraj po licenci CC BY. Ima pop, elektronsku, rok i akustičnu muziku.
- **Incompetech** (incompetech.com, Kevin MacLeod): sve pesme su CC BY 4.0.
- **ccMixter** (ccmixter.org): filtriraj po licenci „Attribution“ (CC BY).

Kod CC BY licence mora da se navede autor. Za to već postoji mesto: na stranici radija, ispod naziva pesme, piše ko je autor i koja je licenca. Licence sa oznakom **NC** (NonCommercial) ili **ND** (NoDerivatives) **nisu dozvoljene**, jer je radio deo sajta firme.

### Kako se dodaje pesma

1. Mp3 fajl stavi u `public/radio/pesme`. Najbolje je da se zove `Izvođač - Naslov.mp3`.
2. Ako pesma traži navođenje autora (CC BY), upiši to u `branding/radio/pesme.json`, na primer:
   ```json
   { "Kevin MacLeod - Pesma.mp3": { "credit": "Kevin MacLeod (incompetech.com), licenca CC BY 4.0" } }
   ```
3. Pokreni `npm run radio`. Ova komanda napravi spisak programa sa trajanjem svake pesme.

## Džinglovi

Tekstovi džinglova su u `branding/dzinglovi/tekstovi.json`. Džinglovi se prave komandom `npm run dzinglovi`. Ona svaki tekst spoji sa veselom muzičkom podlogom i sirenom „beep beep“, a zatim osveži spisak programa. I podlogu i sirenu pravi sam program, pa za njih ne treba ničija dozvola.

### Glas kao pravi čovek

Džinglovi sada imaju probni glas iz Mac-a („Lana“). On služi samo da se čuje kako džinglovi zvuče, jer je hrvatski i pomalo robotski. Pravi glas se dobija na jedan od dva načina.

**1. Snimak pravog čoveka (preporuka, besplatno, zvuči najprirodnije)**

1. Neka neko sa prijatnim glasom pročita tekstove iz `tekstovi.json` na telefon (aplikacija Diktafon / Voice Memos).
2. Snima se u tihoj sobi, sa telefonom 20 do 30 cm od usta, a čita se veselo i sa osmehom. Svaki tekst je poseban snimak.
3. Snimci se nazovu kao `id` iz spiska (`01-slusate.m4a`, `02-dok-cekate.m4a`...) i stave u `branding/dzinglovi/snimci`.
4. Pokrene se `npm run dzinglovi`. Program sam očisti šum, odseče tišinu, ujednači jačinu i doda podlogu i sirenu.

**2. Veštački glas koji zvuči kao čovek**

Microsoft Azure ima srpske glasove (`sr-RS-NicholasNeural`, `sr-RS-SophieNeural`) koji zvuče vrlo prirodno. Prvih pola miliona slova mesečno je besplatno. Potreban je Azure nalog sa karticom. Ključ bi išao u `.env.local`, nikako na GitHub. Ako to izabereš, javi mi da dodam taj glas u program za džinglove.

Za reklame partnera samo se dodaju novi tekstovi u `tekstovi.json`, na primer: „Gladni ste? Pica iz Bajke stiže za pola sata. Beep Beep dostava!“

## Kasnije: pravi radio uživo (oko 5 evra mesečno)

Kad radio zaživi, prelazi se na pravi server za emitovanje:

1. Kupi se mali server, na primer Hetzner CX22, za oko 4 do 5 evra mesečno.
2. Na njega se postavi besplatan program **AzuraCast**. On pušta pesme i džinglove po rasporedu, pravi statistiku slušanosti i dozvoljava emisije uživo sa mikrofonom.
3. Sajt umesto fajlova pušta prenos sa tog servera.

To podešavam ja. Ti samo otvoriš nalog na Hetzneru i platiš server, a lozinke i ključevi idu samo kod tebe.

## Mejl za SOKOJ i OFPS (za prave hitove)

Isti mejl ide na obe adrese. Adrese za kontakt nađi na njihovim zvaničnim sajtovima (sokoj.rs i ofps.org.rs), pod licenciranjem ili kontaktom za medije i internet.

> **Naslov:** Licenca za mali internet radio u Negotinu
>
> Poštovani,
>
> Firma [naziv firme], PIB [PIB], iz Negotina, pokreće internet radio „Beep Beep radio“, koji se sluša samo preko našeg sajta [adresa sajta]. Radio nije u etru, nema frekvenciju i za sada nema prihod od reklama. Očekujemo do [broj] slušalaca dnevno, uglavnom iz Negotina i okoline.
>
> Želeli bismo da u program uvrstimo domaću i stranu popularnu muziku. Molimo vas da nam pošaljete uslove i cenu licence za ovakav internet radio, kao i spisak dokumentacije koja vam je potrebna.
>
> Hvala unapred.
>
> Srdačan pozdrav,
> [ime i prezime]
> [telefon]
