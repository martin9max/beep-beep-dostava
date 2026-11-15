// Baza podataka: jedan SQLite fajl (data/beepbeep.db). Pravi se sam pri prvom pokretanju.
import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { guessPlace } from '../src/places.js'

const file = process.env.DB_FILE || path.resolve('data/beepbeep.db')
mkdirSync(path.dirname(file), { recursive: true })

export const db = new DatabaseSync(file)
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  -- sajt i panel za lokale mogu da rade kao dva programa nad istom bazom: kratko sačekaju umesto greške
  PRAGMA busy_timeout = 3000;

  -- registrovani korisnici (lozinka se čuva samo kao heš, nikad u čitljivom obliku)
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    surname       TEXT NOT NULL,
    phone         TEXT NOT NULL UNIQUE,
    email         TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    address       TEXT NOT NULL,
    address_note  TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  -- prijavljeni uređaji (kolačić u browseru); čuva se heš tokena
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash  TEXT PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    expires_at  INTEGER NOT NULL
  );

  -- svaki pokušaj prijave, uspešan ili ne
  CREATE TABLE IF NOT EXISTS logins (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    login       TEXT NOT NULL,
    success     INTEGER NOT NULL,
    kind        TEXT NOT NULL DEFAULT 'prijava',
    ip          TEXT,
    user_agent  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS orders (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer    TEXT NOT NULL,
    phone       TEXT NOT NULL,
    address     TEXT NOT NULL,
    note        TEXT NOT NULL DEFAULT '',
    items_json  TEXT NOT NULL,
    shops       INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    status      TEXT NOT NULL DEFAULT 'nova',
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`)

// novije kolone: dodaju se u već postojeću bazu bez brisanja podataka
const orderColumns = db.prepare('PRAGMA table_info(orders)').all().map((c) => c.name)
if (!orderColumns.includes('zone')) db.exec("ALTER TABLE orders ADD COLUMN zone TEXT NOT NULL DEFAULT 'grad'")
if (!orderColumns.includes('delivery')) db.exec('ALTER TABLE orders ADD COLUMN delivery INTEGER')
// tajni kod za stranicu /sms (vlasnik šalje kupcu SMS sa gotovom porukom), da niko ne pogađa brojeve porudžbina
if (!orderColumns.includes('sms_token')) db.exec('ALTER TABLE orders ADD COLUMN sms_token TEXT')

const userColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name)
if (!userColumns.includes('place')) {
  db.exec("ALTER TABLE users ADD COLUMN place TEXT NOT NULL DEFAULT ''")
  // stari nalozi: mesto se pogađa iz adrese (npr. "Svetog Save 5 Vidrovac" -> Vidrovac)
  for (const u of db.prepare('SELECT id, address FROM users').all()) {
    db.prepare('UPDATE users SET place = ? WHERE id = ?').run(guessPlace(u.address), u.id)
  }
}
// nalozi firmi (usluge za firme): vrsta naloga, naziv firme, PIB i matični broj
if (!userColumns.includes('kind')) db.exec("ALTER TABLE users ADD COLUMN kind TEXT NOT NULL DEFAULT 'kupac'")
if (!userColumns.includes('company')) db.exec("ALTER TABLE users ADD COLUMN company TEXT NOT NULL DEFAULT ''")
if (!userColumns.includes('pib')) db.exec("ALTER TABLE users ADD COLUMN pib TEXT NOT NULL DEFAULT ''")
if (!userColumns.includes('mb')) db.exec("ALTER TABLE users ADD COLUMN mb TEXT NOT NULL DEFAULT ''")
// adresa firme (posebno od lične adrese: isti čovek može imati i lični nalog i firmu)
if (!userColumns.includes('company_address')) {
  db.exec("ALTER TABLE users ADD COLUMN company_address TEXT NOT NULL DEFAULT ''")
  db.exec("ALTER TABLE users ADD COLUMN company_place TEXT NOT NULL DEFAULT ''")
  db.exec("ALTER TABLE users ADD COLUMN company_address_note TEXT NOT NULL DEFAULT ''")
  // nalozi registrovani kao firma: adresa firme je adresa iz naloga
  db.exec("UPDATE users SET company_address = address, company_place = place, company_address_note = address_note WHERE kind = 'firma'")
}
if (!orderColumns.includes('place')) db.exec("ALTER TABLE orders ADD COLUMN place TEXT NOT NULL DEFAULT ''")

// zaštita od lažnih porudžbina: oznake rizika (JSON spisak) i da li je porudžbina puštena lokalima
// (sumnjiva porudžbina čeka da je vlasnik odobri u /admin, pa tek onda stiže lokalima)
if (!orderColumns.includes('risk')) db.exec("ALTER TABLE orders ADD COLUMN risk TEXT NOT NULL DEFAULT '[]'")
if (!orderColumns.includes('released')) db.exec('ALTER TABLE orders ADD COLUMN released INTEGER NOT NULL DEFAULT 1')
// owner_sent: duga poruka vlasniku je poslata (čeka se da lokal potvrdi, vidi server/owner.js); map_link: Google mapa adrese
if (!orderColumns.includes('owner_sent')) db.exec('ALTER TABLE orders ADD COLUMN owner_sent INTEGER NOT NULL DEFAULT 1')
if (!orderColumns.includes('map_link')) db.exec("ALTER TABLE orders ADD COLUMN map_link TEXT NOT NULL DEFAULT ''")

// panel za lokale (partneri/): nalozi lokala, njihove prijave i stanje svakog dela porudžbine po lokalu
db.exec(`
  CREATE TABLE IF NOT EXISTS shop_accounts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL UNIQUE,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE TABLE IF NOT EXISTS shop_sessions (
    token_hash  TEXT PRIMARY KEY,
    account_id  INTEGER NOT NULL REFERENCES shop_accounts(id) ON DELETE CASCADE,
    expires_at  INTEGER NOT NULL
  );
  -- status: nova, prihvaćena, spremna, odbijena; minutes: za koliko je spremno (kad lokal prihvati)
  CREATE TABLE IF NOT EXISTS order_shops (
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'nova',
    minutes     INTEGER,
    reason      TEXT NOT NULL DEFAULT '',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    PRIMARY KEY (order_id, slug)
  );
`)

// jednokratne radnje na serveru (Railway), pokreću se promenljivama okruženja, a pamte u bazi da se ne ponove:
db.exec('CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
const meta = (key) => db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key)?.value
const setMeta = (key, value) => db.prepare('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value)

// SHOP_ACCOUNTS: nalozi lokala za panel, {"slug": ["korisničko ime", "heš lozinke"]}. U promenljivoj je samo heš,
// ne lozinka. Dodaju se samo lokali koji još nemaju nalog (izmene iz /admin se ne gaze).
if (process.env.SHOP_ACCOUNTS) {
  try {
    for (const [slug, [username, hash]] of Object.entries(JSON.parse(process.env.SHOP_ACCOUNTS))) {
      db.prepare('INSERT OR IGNORE INTO shop_accounts (slug, username, password_hash) VALUES (?, ?, ?)').run(slug, username, hash)
    }
  } catch (err) {
    console.error('SHOP_ACCOUNTS nije ispravan JSON:', err.message)
  }
}

// RESET_ORDERS_ONCE=<oznaka>: briše sve porudžbine i vraća brojač na početak (sledeća je #1).
// Izvršava se jednom za svaku oznaku; nalozi kupaca i lokala ostaju.
const reset = process.env.RESET_ORDERS_ONCE
if (reset && meta('orders_reset') !== reset) {
  // pre brisanja: kopija cele baze pored nje (npr. /data/beepbeep-pre-reseta-<oznaka>.db), da se stare porudžbine mogu vratiti
  const backup = file.replace(/\.db$/, '') + `-pre-reseta-${reset.replace(/[^\w-]/g, '')}.db`
  db.exec(`VACUUM INTO '${backup.replace(/'/g, "''")}'`)
  console.log(`Kopija baze pre reseta: ${backup}`)
  db.exec('BEGIN')
  db.exec('DELETE FROM order_shops')
  db.exec('DELETE FROM orders')
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'orders'")
  setMeta('orders_reset', reset)
  db.exec('COMMIT')
  console.log(`Porudžbine obrisane, brojač vraćen na početak (${reset}).`)
}

// istekle sesije se brišu pri pokretanju
db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
db.prepare('DELETE FROM shop_sessions WHERE expires_at < ?').run(Date.now())
