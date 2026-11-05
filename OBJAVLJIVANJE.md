# Kako da objaviš sajt, korak po korak

Ovo je redosled kojim ćeš sutra sve podesiti. Ideš ovim redom: prvo napraviš Telegram bota, onda kupiš domen, pa ga povežeš sa Cloudflare-om, zatim podesiš Railway, probaš da li sve radi na adresi koju ti Railway da, i tek na kraju povežeš pravi domen.

Redosled je bitan zato što se kod domena i Cloudflare-a čeka da promene „prođu“ kroz internet. Zato ih radiš na početku, a dok čekaš, podešavaš Railway.

Sve ukupno će ti trajati dva do tri sata, s tim što dobar deo tog vremena samo čekaš. Kad završiš neki korak, štikliraj kućicu ispred njega, pa idi dalje.

---

## Pre nego što počneš

Pripremi sledeće stvari, da te ništa ne zaustavi na pola posla:

- [ ] Platnu karticu, jer ćeš plaćati domen i Railway.
- [ ] Pristup svom GitHub nalogu `martin9max`, jer se na Railway prijavljuješ preko njega.
- [ ] Telegram na svom telefonu. Vlasnik takođe treba da ima Telegram i da bude dostupan, jer će u jednom trenutku morati da pošalje poruku botu.
- [ ] Ime domena koje želiš, na primer `beepbeepdostava.rs`. Pre kupovine proveri na unlimited.rs da je slobodno.
- [ ] Podatke za vlasnika domena. Za domen koji se završava na .rs traže se ime, adresa i JMBG, ili PIB ako je firma. Najbolje je da domen glasi na firmu vlasnika, a ne na tebe.
- [ ] Lozinku za admin panel. Neka bude dugačka, bar šesnaest znakova, i neka to bude lozinka koju ne koristiš nigde drugde. Sačuvaj je u menadžeru lozinki ili na nekom sigurnom mestu.
- [ ] Jednu praznu belešku na telefonu ili računaru, gde ćeš privremeno lepiti token bota i brojeve koje budeš dobijao usput.

Važno: lozinke i token bota nikada ne upisuj u kod i ne šalji ih na GitHub. Oni idu samo u podešavanja na Railway-u, i nigde više.

---

## Prvi korak: Telegram bot

Ovo traje desetak do petnaest minuta i potpuno je besplatno.

- [ ] Otvori Telegram, u pretrazi nađi **@BotFather** i pošalji mu poruku `/newbot`.
- [ ] Pitaće te kako da se bot zove. Upiši nešto kao `Beep Beep Dostava`.
- [ ] Zatim će tražiti korisničko ime bota. Ono mora da se završava rečima „bot“, na primer `beepbeep_negotin_bot`.
- [ ] BotFather će ti poslati dugačak niz znakova koji izgleda otprilike ovako: `123456789:AAH...`. To je token bota. Kopiraj ga u svoju belešku i ne pokazuj ga nikome, jer ko ima token, može da piše u ime tvog bota.
- [ ] U poruci od BotFather-a je i link do tvog novog bota. Otvori ga i pošalji mu bilo koju poruku, na primer „zdravo“.
- [ ] Zamoli vlasnika da i on otvori tog bota i pošalje mu „zdravo“. Ovo je obavezno, jer bot ne može da piše nekome ko mu se prvi nije javio.
- [ ] Sada u pregledaču otvori ovu adresu, s tim što umesto reči `TOKEN` zalepiš svoj token:
  `https://api.telegram.org/botTOKEN/getUpdates`
- [ ] Na strani koja se otvori videćeš vaše dve poruke. Kod svake piše nešto poput `"chat":{"id":123456789,"first_name":"Martin"`. Taj broj posle reči „id“ je chat broj te osobe. Zapiši oba broja u belešku i zapiši čiji je koji.
  - Tvoj broj služi da tebi stižu obaveštenja o novim korisnicima i problemima sa prijavom.
  - Vlasnikov broj služi da njemu stižu nove porudžbine.

Kako znaš da je ovaj korak gotov: u belešci imaš token i dva broja, i znaš koji je čiji. Ako se na onoj strani vidi samo `"result":[]`, znači da poruke još nisu stigle. Pošaljite botu poruku ponovo i osveži stranu.

Ako hoćeš da i kurir dobija porudžbine, neka i on pošalje poruku botu. Njegov broj posle samo dopišeš uz vlasnikov, odvojen zarezom.

---

## Drugi korak: kupovina domena na unlimited.rs

- [ ] Kupi samo domen. Nemoj da uzimaš hosting ni nikakav „web paket“, jer ti to ne treba, sajt će raditi na Railway-u.
- [ ] Sačekaj mejl da je domen aktivan. Obično stigne za par minuta, ali nekad potraje i par sati.

Kako znaš da je gotovo: domen se u tvom nalogu na unlimited.rs vidi kao aktivan.

Dok čekaš, slobodno pređi na treći ili četvrti korak.

---

## Treći korak: Cloudflare

Cloudflare je besplatan i stoji ispred sajta. On upravlja domenom i štiti sajt od botova.

- [ ] Napravi nalog na cloudflare.com.
- [ ] Klikni na dugme za dodavanje domena („Add a domain“), upiši svoj domen i izaberi besplatni plan („Free“).
- [ ] Cloudflare će ti pokazati dve adrese koje se zovu nameserveri. Izgledaju otprilike kao `ana.ns.cloudflare.com` i `bob.ns.cloudflare.com`. Ostavi tu stranu otvorenu.
- [ ] Idi na unlimited.rs, otvori podešavanja svog domena i nađi deo koji se zove „Nameserveri“ ili „DNS serveri“. Obriši adrese koje su tu i upiši ove dve od Cloudflare-a. Sačuvaj promenu.
- [ ] Vrati se na Cloudflare i klikni da proveri nameservere („Check nameservers“). Neko vreme će pisati da se čeka („Pending“), i to je normalno.

Kako znaš da je gotovo: Cloudflare ti pošalje mejl da je domen aktivan, a pored domena piše „Active“. To obično bude za manje od sat vremena, ali može da potraje i do jednog dana.

Za to vreme radi četvrti korak. Zapise za povezivanje sa Railway-om dodaješ tek kasnije, u šestom koraku.

---

## Četvrti korak: Railway

Ovo traje oko pola sata.

### Nalog i plaćanje

- [ ] Idi na railway.com i prijavi se preko GitHub-a, nalogom `martin9max`.
- [ ] Uključi plan koji se zove „Hobby“. Košta oko pet dolara mesečno. Ubaci karticu.
- [ ] U podešavanjima naloga, u delu za potrošnju („Usage“), postavi gornju granicu, na primer deset dolara. Tako sigurno nećeš dobiti veći račun nego što očekuješ.

### Pravljenje projekta

- [ ] Napravi novi projekat („New Project“) i izaberi da se pravi iz GitHub repozitorijuma („Deploy from GitHub repo“). Izaberi repozitorijum `martin9max/beep-beep-dostava`.
- [ ] Ako Railway traži pristup tvojim repozitorijumima, dozvoli mu pristup samo ovom jednom.
- [ ] Railway će odmah pokušati prvi put da objavi sajt. Pusti ga. Ako ovaj prvi put ne uspe, ne brini, jer još nismo uneli podešavanja. Ponovićemo ga na kraju ovog koraka.

### Komande

U podešavanjima servisa („Settings“) upiši sledeće:

- [ ] Za komandu koja pravi sajt („Build command“) upiši: `npm run build`
- [ ] Za komandu koja pokreće sajt („Start command“) upiši: `npm start`
- [ ] Proveri da je izabrana grana `main`. Tako će se svaki put kad pošalješ izmene na GitHub, sajt na Railway-u sam ažurirati.
- [ ] Verziju Node-a ne diraj, Railway je sam pročita iz projekta.

### Trajni disk za bazu

Ovo je najvažniji deo celog podešavanja. Ako ga preskočiš, svaki put kad se sajt ponovo objavi, obrisaće se svi korisnici i sve porudžbine.

- [ ] U projektu dodaj novi disk („Volume“) i poveži ga sa svojim servisom.
- [ ] Kad te pita gde da se disk „zakači“ („Mount path“), upiši: `/data`
- [ ] U sledećem delu dodaćeš podešavanje koje kaže sajtu da bazu čuva baš na tom disku.

### Podešavanja (Variables)

U servisu otvori deo „Variables“ i dodaj jedno po jedno podešavanje. Nazive prepiši tačno ovako, bez razmaka i bez navodnika:

| Naziv | Šta upisuješ |
|---|---|
| `ADMIN_USER` | Korisničko ime kojim ćeš ulaziti u admin panel, na primer `martin`. |
| `ADMIN_PASSWORD` | Onu dugačku lozinku koju si smislio na početku. |
| `TELEGRAM_BOT_TOKEN` | Token bota iz prvog koraka. |
| `TELEGRAM_ORDERS_CHAT_ID` | Vlasnikov broj iz prvog koraka. |
| `TELEGRAM_ACCOUNTS_CHAT_ID` | Tvoj broj iz prvog koraka. |
| `TRUST_PROXY` | Samo broj `1`. |
| `DB_FILE` | `/data/beepbeep.db` |
| `VITE_SITE_URL` | Adresa tvog domena sa `https://` na početku i bez kose crte na kraju, na primer `https://beepbeepdostava.rs`. |

Nemoj da dodaješ podešavanja `VITE_STATIC_DEMO` i `VITE_BASE`. Ona služe samo za probnu verziju na GitHub-u, i na Railway-u bi pokvarila prijavu i porudžbine.

- [ ] Kad uneseš sve, klikni da se sajt ponovo objavi („Deploy“ ili „Apply changes“).

### Adresa koju daje Railway

- [ ] U podešavanjima servisa, u delu „Networking“, klikni da ti Railway napravi adresu („Generate Domain“). Dobićeš adresu koja izgleda otprilike kao `beep-beep-dostava-production.up.railway.app`.

Kako znaš da je gotovo: u delu „Deployments“ poslednje objavljivanje je zeleno i piše „Success“, a u delu „Logs“ vidiš rečenicu „Beep Beep radi na...“.

---

## Peti korak: proba na adresi koju ti je dao Railway

Ovo radiš pre nego što povežeš pravi domen, da bi znao da sajt radi kako treba. Traje desetak do petnaest minuta.

Otvori adresu koju ti je Railway dao i proveri redom:

- [ ] Da se početna strana otvara, da motor ulazi i da se slike vide.
- [ ] Napravi nov nalog preko registracije, sa svojim podacima i nekom adresom u Negotinu. Na tvoj Telegram bi trebalo da stigne poruka da se pojavio novi korisnik.
- [ ] Idi na dostavu hrane, otvori Pastizzu, dodaj dve stvari u korpu i pošalji porudžbinu. Vlasniku bi na Telegram trebalo da stigne porudžbina, pa ga zamoli da ti javi. Proveri i da dostava za Negotin iznosi petsto dinara.
- [ ] Na kraj adrese dopiši `/admin` i otvori je. Upiši korisničko ime i lozinku za admin. Trebalo bi da vidiš probnu porudžbinu i svoj nalog.
- [ ] U admin panelu promeni status te porudžbine u „otkazana“, jer je bila samo proba.
- [ ] Sada proveri da li baza preživljava novo objavljivanje. U Railway-u klikni da se sajt ponovo objavi („Redeploy“), sačekaj da postane zeleno, pa opet otvori admin panel. Porudžbina i nalog moraju i dalje da budu tu. Ako su nestali, znači da disk iz četvrtog koraka nije dobro povezan, pa se vrati i proveri ga.

Ako si sve ovo prošao bez problema, sajt radi. Ostaje još samo da povežeš domen.

Ako Telegram poruke ne stižu, proveri tri stvari. Prvo, da ste i ti i vlasnik poslali poruku botu. Drugo, da su token i brojevi prekopirani tačno, bez razmaka na početku ili kraju. Treće, pogledaj „Logs“ na Railway-u, tamo piše ako nešto ne valja.

---

## Šesti korak: povezivanje domena sa Railway-om preko Cloudflare-a

Ovaj korak radiš tek kad Cloudflare pokaže da je domen aktivan. Traje oko petnaest minuta, uz par minuta čekanja.

- [ ] Na Railway-u, u podešavanjima servisa, u delu „Networking“, dodaj svoj domen („Custom Domain“) i upiši ga, na primer `beepbeepdostava.rs`.
- [ ] Railway će ti pokazati jedan ili dva zapisa koje treba dodati na Cloudflare. Najčešće je to jedan zapis tipa CNAME, a ponekad i jedan tipa TXT, za potvrdu vlasništva.
- [ ] Idi na Cloudflare, otvori svoj domen, pa deo „DNS“ i „Records“, i dodaj tačno one zapise koje ti je Railway pokazao. Prepiši ih slovo po slovo.
  - Za glavni domen, bez „www“, Cloudflare dozvoljava zapis tipa CNAME i sam ga prilagodi, pa se ne brini zbog toga.
  - Kod svakog zapisa postoji oblačić koji može biti narandžast ili siv. Za sada ga ostavi sivim, što znači „samo DNS“ („DNS only“).
- [ ] Ponovi ista tri koraka i za adresu sa „www“ ispred, na primer `www.beepbeepdostava.rs`.
- [ ] Sačekaj da Railway pored domena pokaže zelenu kvačicu. To znači da je dobio sigurnosni sertifikat za https. Obično traje par minuta.
- [ ] Tek kad vidiš zelenu kvačicu, vrati se na Cloudflare i kod oba zapisa uključi narandžasti oblačić („Proxied“). Tada Cloudflare počinje da štiti sajt.
- [ ] Na Cloudflare-u otvori deo „SSL/TLS“ i izaberi opciju „Full (strict)“.
- [ ] U istom delu, pod „Edge Certificates“, uključi opciju „Always Use HTTPS“, da se sajt uvek otvara preko sigurne veze.

Kako znaš da je gotovo: i adresa bez „www“ i adresa sa „www“ otvaraju sajt, a pored adrese u pregledaču stoji katanac.

Ako pregledač javi grešku „too many redirects“, znači da u Cloudflare-u pod „SSL/TLS“ nije izabrano „Full (strict)“. Ako Railway nikako ne daje zelenu kvačicu, verovatno si prerano uključio narandžasti oblačić. Vrati ga na sivi i sačekaj.

---

## Sedmi korak: završna proba na pravom domenu

Ovo traje desetak minuta.

- [ ] Otvori sajt na pravom domenu, prijavi se nalogom koji si napravio u petom koraku i naruči neku sitnicu. Proveri da je vlasniku stigla poruka na Telegram.
- [ ] Otvori admin panel na pravom domenu, dodavanjem `/admin` na kraj adrese, i proveri da radi sa tvojom lozinkom.
- [ ] Uzmi telefon, isključi Wi-Fi da ideš preko mobilnog interneta, otvori sajt, probaj da naručiš nešto i pusti radio.
- [ ] Na kraju u admin panelu otkaži sve probne porudžbine. Probni nalog obriši ako ti ne treba.

---

## Posle objavljivanja

- [ ] Ako si uzeo domen koji se ne zove `beepbeepdostava.rs`, promeni podešavanje `VITE_SITE_URL` na Railway-u na pravu adresu i ponovo objavi sajt. To je bitno za Google i za sliku koja se pojavi kad neko podeli link. Javi mi i ja ću to ispraviti i u kodu.
- [ ] Prijavi sajt na Google Search Console, da bi se brže pojavio na Google-u. Vlasništvo nad domenom se tamo dokazuje preko Cloudflare-a, praktično jednim klikom.
- [ ] Pogledaj da li Railway na tvom planu nudi rezervne kopije diska („Backups“) i ako nudi, uključi ih. Ako ne nudi, javi mi pa ćemo napraviti da se baza sama kopira.
- [ ] Probna verzija na GitHub-u, na adresi `martin9max.github.io/beep-beep-dostava`, može da ostane. Kad ti više ne bude trebala, možemo je ugasiti.
- [ ] Lozinku za admin panel nemoj da šalješ porukom. Ako vlasniku zatreba, reci mu je uživo.

## Šta nikako ne treba da radiš

- Nemoj da upisuješ lozinke ili token bota u kod ili da ih šalješ na GitHub.
- Nemoj da brišeš disk („Volume“) na Railway-u, jer su na njemu svi korisnici i sve porudžbine.
- Nemoj da uključiš narandžasti oblačić na Cloudflare-u pre nego što Railway pokaže zelenu kvačicu.
- Nemoj da kupuješ hosting na unlimited.rs, treba ti samo domen.
