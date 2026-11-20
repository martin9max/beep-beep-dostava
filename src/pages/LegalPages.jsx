import { BUSINESS, DELIVERY, PHONE, SITE } from '../data'
import { formatDin } from '../lib/order'
import { Link } from '../lib/router'
import { usePageTitle } from './PageShell'

// Uslovi korišćenja (/uslovi) i Politika privatnosti (/privatnost).
// Tekst opisuje kako sajt zaista radi (šta se čuva, gde, kome ide). Kad se nešto u radu promeni
// (npr. nova usluga, plaćanje karticom, drugi hosting), treba promeniti i ovaj tekst i datum ispod.
// Pre objave je dobro da ga pogleda pravnik; podaci o firmi se upisuju u BUSINESS.legal (src/data.js).

const UPDATED = '20. novembar 2026.'
const tel = PHONE.replace(/\s/g, '')
const operator = BUSINESS.legal || `${SITE.name}, ${BUSINESS.address}`

function LegalPage({ title, intro, sections }) {
  usePageTitle(title)
  return (
    <article className="mx-auto max-w-[760px] px-5 pb-24 pt-10 sm:pt-14">
      <h1 className="text-[34px] font-bold leading-tight tracking-tight sm:text-[42px]">{title}</h1>
      <p className="mt-2 text-sm text-deep/60">Poslednja izmena: {UPDATED}</p>
      <p className="mt-6 text-lg leading-relaxed text-deep/85">{intro}</p>
      <nav aria-label="Sadržaj" className="mt-8 rounded-2xl border border-line bg-white p-5">
        <p className="font-bold">Sadržaj</p>
        <ol className="mt-2 grid list-decimal gap-1 pl-5 text-deep/85">
          {sections.map(([heading], i) => (
            <li key={heading}>
              <a href={`#deo-${i + 1}`} className="underline-offset-2 hover:underline">
                {heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      {sections.map(([heading, body], i) => (
        <section key={heading} id={`deo-${i + 1}`} className="mt-10 scroll-mt-28">
          <h2 className="text-2xl font-bold">
            {i + 1}. {heading}
          </h2>
          <div className="legal mt-3 grid gap-3 leading-relaxed text-deep/85">{body}</div>
        </section>
      ))}
    </article>
  )
}

const Contact = () => (
  <>
    telefonom na <a href={`tel:${tel}`}>{PHONE}</a> ili porukom na WhatsApp na isti broj
  </>
)

export function TermsPage() {
  return (
    <LegalPage
      title="Uslovi korišćenja"
      intro={`Ovi uslovi važe za korišćenje sajta ${SITE.name} i za porudžbine poslate preko sajta. Korišćenjem sajta, otvaranjem naloga ili slanjem porudžbine prihvatate ove uslove.`}
      sections={[
        [
          'Ko smo',
          <>
            <p>
              Sajt i uslugu dostave pruža: <b>{operator}</b>.
            </p>
            <p>
              Kontakt: <Contact />.
            </p>
          </>,
        ],
        [
          'Šta radimo',
          <>
            <p>
              Beep Beep je usluga dostave. Preuzimamo i donosimo na vašu adresu hranu i piće iz lokala, namirnice, lekove, cveće, torte, poklone i
              druge stvari, u Negotinu, okolnim selima i šire. Za firme obavljamo i uplatu pazara, dostavu dokumenata i paketa i plaćanje računa.
            </p>
            <p>
              Hranu i robu pripremaju i prodaju lokali i prodavnice. Za sastav, kvalitet i ispravnost hrane i robe odgovara lokal ili prodavnica koja ih
              je pripremila ili prodala. Mi odgovaramo za preuzimanje i dostavu.
            </p>
            <p>Ne dostavljamo alkohol i cigarete.</p>
          </>,
        ],
        [
          'Nalog',
          <>
            <p>
              Za poručivanje preko sajta potreban je nalog. Pri registraciji upisujete tačne podatke: ime i prezime, broj telefona, email i adresu za
              dostavu. Za usluge za firme upisuju se i naziv firme, PIB i matični broj.
            </p>
            <p>
              Odgovorni ste za tačnost podataka i za čuvanje lozinke. Ako mislite da je neko drugi saznao vašu lozinku, javite nam se. Nalog možete u
              svakom trenutku obrisati tako što nam se javite.
            </p>
          </>,
        ],
        [
          'Porudžbina',
          <>
            <p>
              Porudžbina je poslata kada je potvrdite u korpi. Nakon toga vas kontaktiramo i javljamo za koliko minuta stiže, telefonom, porukom
              na WhatsApp ili SMS-om.
            </p>
            <p>
              Porudžbinu možemo da odbijemo ili otkažemo: ako lokal ne radi ili nema artikal, ako adresa ili podaci nisu ispravni, ako ne možemo da
              vas dobijemo na telefon ili ako postoji osnovana sumnja da porudžbina nije ozbiljna. O tome vas obaveštavamo što pre.
            </p>
            <p>
              Za velike porudžbine, torte, poklone i porudžbine po posebnom zahtevu možemo pre pripreme tražiti potvrdu telefonom ili avans, o čemu
              se dogovaramo sa vama.
            </p>
          </>,
        ],
        [
          'Cene i plaćanje',
          <>
            <p>
              Cene artikala na sajtu su cene lokala i prodavnica i iskazane su u dinarima. Kod nekih artikala (npr. iz prodavnice po vašem spisku)
              cena se zna tek po računu, i to piše uz artikal.
            </p>
            <p>
              Dostava u Negotinu košta {formatDin(DELIVERY.city)} dinara. Za sela se plaća {formatDin(DELIVERY.perKm)} dinara po kilometru od
              Negotina, a cenu vidite pri poručivanju čim izaberete mesto. Za mesta koja nisu na spisku cenu dostave javlja dostavljač pre polaska.
              Svako dodatno zaustavljanje (npr. porudžbina iz više lokala) naplaćuje se 100 dinara.
            </p>
            <p>
              Plaćanje je gotovinom dostavljaču prilikom preuzimanja, osim ako se drugačije ne dogovorimo (npr. avans ili premium dostava iz
              inostranstva). Podatke o platnim karticama ne prikupljamo i ne čuvamo.
            </p>
          </>,
        ],
        [
          'Dostava i preuzimanje',
          <>
            <p>
              Vreme dostave koje vam javimo je procena: zavisi od lokala, gužve, vremena i puta. Trudimo se da ga ispoštujemo, a ako kasnimo,
              javljamo vam.
            </p>
            <p>
              Molimo vas da budete dostupni na telefonu i na adresi. Ako dostavljač ne može da vas dobije ni da preda porudžbinu, prvo vas zovemo.
              Ako porudžbina ne bude preuzeta, a pripremljena je, možemo tražiti naknadu troškova pripreme i dostave.
            </p>
          </>,
        ],
        [
          'Otkazivanje i odustanak',
          <>
            <p>
              Porudžbinu možete otkazati <Contact />, i to bez troškova dok lokal ne počne pripremu. Kada je priprema počela ili je hrana
              spremna, otkazivanje je moguće samo uz plaćanje onoga što je pripremljeno i dostave, ako je dostava krenula.
            </p>
            <p>
              Po Zakonu o zaštiti potrošača, pravo na odustanak od ugovora ne važi za robu koja brzo propada (hrana, cveće), za robu napravljenu
              po vašem posebnom zahtevu (npr. torte) i za usluge koje su u potpunosti izvršene.
            </p>
          </>,
        ],
        [
          'Reklamacije',
          <>
            <p>
              Ako nešto nije u redu sa porudžbinom (pogrešan ili oštećen artikal, nešto nedostaje), javite nam se odmah pri preuzimanju ili što
              pre posle toga, <Contact />. Ako možete, pošaljite i fotografiju.
            </p>
            <p>
              Reklamaciju na hranu i robu rešavamo zajedno sa lokalom ili prodavnicom. Na reklamaciju odgovaramo bez odlaganja, a najkasnije u roku
              koji propisuje zakon.
            </p>
          </>,
        ],
        [
          'Zloupotreba',
          <>
            <p>
              Zabranjeno je slanje lažnih porudžbina, porudžbina na tuđe ime bez dozvole, upisivanje tuđih podataka i svaki pokušaj ometanja rada
              sajta.
            </p>
            <p>
              Kupcu koji više puta ne preuzme porudžbinu ili zloupotrebljava sajt možemo ograničiti poručivanje preko sajta ili ugasiti nalog. Pre
              toga vas kontaktiramo i saslušamo, jer za nepreuzetu porudžbinu može postojati opravdan razlog.
            </p>
          </>,
        ],
        [
          'Sadržaj sajta i Beep Beep radio',
          <>
            <p>
              Tekstovi, fotografije, logo i izgled sajta pripadaju nama ili su korišćeni uz dozvolu. Logoi partnera pripadaju partnerima.
            </p>
            <p>
              Beep Beep radio pušta muziku sa zvaničnih YouTube kanala izvođača. Prava na muziku pripadaju autorima.
            </p>
          </>,
        ],
        [
          'Odgovornost',
          <>
            <p>
              Trudimo se da podaci na sajtu (meniji, cene, radno vreme) budu tačni, ali ih menjaju lokali i moguće je da neki nisu ažurni. U tom
              slučaju vas obaveštavamo pre dostave.
            </p>
            <p>Ne odgovaramo za kratke prekide u radu sajta, ali se trudimo da ih otklonimo što pre.</p>
          </>,
        ],
        [
          'Izmene uslova i pravo',
          <>
            <p>
              Ove uslove možemo menjati. Izmenjeni uslovi važe od objave na ovoj stranici i ne odnose se na porudžbine poslate pre izmene.
            </p>
            <p>
              Na ove uslove primenjuje se pravo Republike Srbije. Nesporazume rešavamo dogovorom, a ako to ne uspe, nadležan je sud u Negotinu,
              odnosno sud određen zakonom kada je kupac potrošač.
            </p>
            <p>
              O ličnim podacima piše u <Link href="/privatnost">Politici privatnosti</Link>.
            </p>
          </>,
        ],
      ]}
    />
  )
}

export function PrivacyPage() {
  return (
    <LegalPage
      title="Politika privatnosti"
      intro="Ovde piše koje vaše podatke prikupljamo, zašto, koliko ih čuvamo, kome ih dajemo i koja prava imate. Prikupljamo samo ono što je potrebno da bismo vam dostavili porudžbinu."
      sections={[
        [
          'Ko obrađuje podatke',
          <>
            <p>
              Rukovalac podacima je <b>{operator}</b>.
            </p>
            <p>
              Za sva pitanja o podacima javite nam se <Contact />.
            </p>
          </>,
        ],
        [
          'Koje podatke prikupljamo',
          <>
            <ul className="list-disc pl-5">
              <li>
                <b>Podaci naloga:</b> ime i prezime, broj telefona, email, adresa i mesto za dostavu, dodatno uputstvo za adresu (sprat, interfon) i
                lozinka. Lozinku čuvamo samo u šifrovanom obliku iz kog se ne može pročitati.
              </li>
              <li>
                <b>Podaci firme</b> (samo za usluge za firme): naziv firme, PIB, matični broj i adresa firme.
              </li>
              <li>
                <b>Porudžbine:</b> šta ste poručili i iz kog lokala, iznos, adresa dostave, napomene i stanje porudžbine.
              </li>
              <li>
                <b>Podaci o prijavama:</b> vreme prijave, registracije i odjave, IP adresa i vrsta uređaja i pregledača. Ovo služi za zaštitu
                naloga od neovlašćenog pristupa.
              </li>
              <li>
                <b>Statistika poseta:</b> koliko ljudi je dnevno otvorilo sajt i koje strane. Bez kolačića: posetilac se
                prepoznaje samo u okviru jednog dana, po šifri koja se svaki dan menja, a IP adresa se ne čuva, pa se iz
                statistike ne može saznati ko je posetio sajt.
              </li>
            </ul>
            <p>Ne prikupljamo podatke o platnim karticama i ne koristimo kolačiće za oglase ni za praćenje posetilaca.</p>
          </>,
        ],
        [
          'Zašto ih koristimo',
          <>
            <ul className="list-disc pl-5">
              <li>da primimo, pripremimo i dostavimo porudžbinu i da vas kontaktiramo u vezi sa njom (izvršenje ugovora);</li>
              <li>da vam omogućimo nalog, kako adresu ne biste upisivali svaki put;</li>
              <li>za zaštitu naloga, sprečavanje lažnih porudžbina i zloupotreba (legitimni interes);</li>
              <li>za evidenciju koju propisuje zakon, npr. za knjigovodstvo (zakonska obaveza).</li>
            </ul>
            <p>Vaše podatke ne prodajemo i ne koristimo ih za reklamne poruke bez vašeg pristanka.</p>
          </>,
        ],
        [
          'Kome dajemo podatke',
          <>
            <ul className="list-disc pl-5">
              <li>
                <b>Dostavljačima Beep Beep-a</b>, koji dobijaju ime, adresu, telefon i porudžbinu, da bi je doneli.
              </li>
              <li>
                <b>Lokalu ili prodavnici</b> iz koje poručujete: samo ono što im treba za pripremu (stavke, napomena za lokal i vaše ime).
              </li>
              <li>
                <b>Tehničkim pružaocima usluga</b> koji podatke obrađuju po našem nalogu:
                <ul className="mt-1 list-[circle] pl-5">
                  <li>Railway (server i baza podataka sajta),</li>
                  <li>Cloudflare (bezbedna i brza veza sa sajtom),</li>
                  <li>Telegram (obaveštenja o novim porudžbinama stižu nama preko Telegram-a).</li>
                </ul>
                Ovi pružaoci usluga imaju servere i van Srbije, uključujući Sjedinjene Američke Države i Evropsku uniju. Prenos se vrši uz
                zaštitne mere koje propisuje zakon.
              </li>
              <li>
                <b>Državnim organima</b>, samo kada to zakon nalaže.
              </li>
            </ul>
            <p>
              Kada vam javimo za koliko minuta stiže porudžbina, poruku šaljemo preko WhatsApp-a ili SMS-om na broj koji ste upisali. Za te poruke
              važe i pravila WhatsApp-a, odnosno vašeg mobilnog operatera.
            </p>
          </>,
        ],
        [
          'Kolačići i podaci u pregledaču',
          <>
            <p>
              Koristimo samo jedan neophodan kolačić: onaj koji pamti da ste prijavljeni (važi 60 dana ili do odjave). Bez njega prijava ne bi
              radila, pa za njega nije potreban pristanak.
            </p>
            <p>
              U vašem pregledaču (ne kod nas) čuvaju se sadržaj korpe i privremena adresa za dostavu, da ne nestanu ako zatvorite stranicu.
            </p>
            <p>
              Beep Beep radio za YouTube stanice učitava YouTube plejer (u režimu bez kolačića za praćenje) tek kada pustite takvu stanicu. Tada za
              taj deo važe pravila privatnosti kompanije Google.
            </p>
          </>,
        ],
        [
          'Koliko čuvamo podatke',
          <>
            <ul className="list-disc pl-5">
              <li>Podatke naloga: dok nalog postoji. Kada zatražite brisanje, nalog brišemo bez odlaganja.</li>
              <li>
                Porudžbine: onoliko koliko je potrebno za evidenciju i rešavanje reklamacija, odnosno koliko propisuje zakon. Posle brisanja naloga
                porudžbine ostaju samo sa imenom, bez naloga.
              </li>
              <li>Podatke o prijavama: dok su potrebni za bezbednost naloga.</li>
            </ul>
          </>,
        ],
        [
          'Vaša prava',
          <>
            <p>Po Zakonu o zaštiti podataka o ličnosti imate pravo da:</p>
            <ul className="list-disc pl-5">
              <li>saznate koje vaše podatke imamo i dobijete njihovu kopiju;</li>
              <li>
                ispravite netačne podatke (većinu možete sami da promenite u delu <Link href="/nalog">Moj nalog</Link>);
              </li>
              <li>tražite brisanje podataka i naloga;</li>
              <li>tražite ograničenje obrade i podnesete prigovor na obradu;</li>
              <li>dobijete svoje podatke u obliku koji može da se prenese drugome.</li>
            </ul>
            <p>
              Zahtev nam pošaljite <Contact />. Odgovaramo bez odlaganja, a najkasnije u roku od 30 dana.
            </p>
            <p>
              Ako mislite da vaše podatke obrađujemo suprotno zakonu, možete podneti pritužbu Povereniku za informacije od javnog značaja i zaštitu
              podataka o ličnosti (
              <a href="https://www.poverenik.rs" target="_blank" rel="noopener noreferrer">
                www.poverenik.rs
              </a>
              ).
            </p>
          </>,
        ],
        [
          'Zaštita podataka',
          <>
            <p>
              Sajt radi isključivo preko šifrovane veze (https). Lozinke čuvamo u šifrovanom obliku, pristup podacima imaju samo ovlašćena lica, a
              broj pokušaja prijave je ograničen radi zaštite od pogađanja lozinke.
            </p>
          </>,
        ],
        [
          'Izmene',
          <>
            <p>
              Ovu politiku menjamo kada se promeni način na koji radimo sa podacima. Datum poslednje izmene piše na vrhu stranice. Uslovi korišćenja
              sajta su na stranici <Link href="/uslovi">Uslovi korišćenja</Link>.
            </p>
          </>,
        ],
      ]}
    />
  )
}
