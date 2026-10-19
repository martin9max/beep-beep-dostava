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

const userColumns = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name)
if (!userColumns.includes('place')) {
  db.exec("ALTER TABLE users ADD COLUMN place TEXT NOT NULL DEFAULT ''")
  // stari nalozi: mesto se pogađa iz adrese (npr. "Svetog Save 5 Vidrovac" -> Vidrovac)
  for (const u of db.prepare('SELECT id, address FROM users').all()) {
    db.prepare('UPDATE users SET place = ? WHERE id = ?').run(guessPlace(u.address), u.id)
  }
}
if (!orderColumns.includes('place')) db.exec("ALTER TABLE orders ADD COLUMN place TEXT NOT NULL DEFAULT ''")

// istekle sesije se brišu pri pokretanju
db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
