// Produkcijski server: `npm start` posle `npm run build`.
// Služi gotov sajt iz dist/ i API (/api) i admin panel (/admin) iz iste adrese.
import { createServer } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

for (const file of ['.env', '.env.local']) if (existsSync(file)) process.loadEnvFile(file)
// vreme kao u Negotinu (server na Railway-u radi po UTC-u, sat vremena iza): i u porukama i u bazi
process.env.TZ ||= 'Europe/Belgrade'
process.env.NODE_ENV ||= 'production'

const { api } = await import('./api.js')
const { admin } = await import('./admin.js')
// panel za lokale je poseban sajt (partneri/): isti server ga služi kad zahtev stigne na partneri.<domen>
const { partneri } = await import('../partneri/server.js')
// porudžbine koje su čekale potvrdu lokala dok se server ponovo pokretao dobijaju svoj rok od 5 minuta ponovo
const { resumePending } = await import('./owner.js')
const { recordVisit } = await import('./visits.js')
const { db } = await import('./db.js')
resumePending()

const dist = path.resolve('dist')
const PORT = Number(process.env.PORT) || 3000
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
}

async function staticFiles(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = path.join(dist, path.normalize(pathname))
  if (!file.startsWith(dist)) file = dist
  let info = await stat(file).catch(() => null)
  // strane sa gotovim HTML-om (npr. /lokal/kafanica -> dist/lokal/kafanica/index.html, vidi scripts/prerender.mjs)
  if (info?.isDirectory()) {
    file = path.join(file, 'index.html')
    info = await stat(file).catch(() => null)
  }
  // ostale stranice (npr. /korpa, /prijava) nemaju svoj fajl: dobijaju index.html, a React prikaže pravu stranicu
  if (!info) file = path.join(dist, 'index.html')
  const ext = path.extname(file)
  // poseta strane (za statistiku u adminu): samo kad pregledač otvara stranu, ne za slike, skripte i sl.
  if (ext === '.html' && !path.extname(pathname) && /text\/html/.test(req.headers.accept || '')) recordVisit(req, pathname)
  res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream')
  if (pathname.startsWith('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  // strane (HTML) pregledač uvek proverava, da posle objave odmah dobije novu verziju sajta (Safari je inače držao staru)
  else if (ext === '.html') res.setHeader('Cache-Control', 'no-cache')
  createReadStream(file)
    .on('error', () => {
      // fajl ne može da se pročita: greška umesto pada servera
      if (!res.headersSent) res.statusCode = 404
      res.end()
    })
    .pipe(res)
}

createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  // www.beepbeepdostava.rs -> beepbeepdostava.rs (jedna adresa sajta za Google)
  if ((req.headers.host || '').startsWith('www.')) {
    res.writeHead(301, { Location: `https://${req.headers.host.slice(4)}${req.url}` })
    return res.end()
  }
  if ((req.headers.host || '').startsWith('partneri.') || /^\/partneri(\/|$|\?)/.test(req.url)) return partneri(req, res)
  api(req, res, () => admin(req, res, () => staticFiles(req, res)))
}).listen(PORT, () => {
  console.log(`Beep Beep radi na http://localhost:${PORT}`)
  const { t } = db.prepare("SELECT datetime('now', 'localtime') t").get()
  console.log(`Vreme servera: ${new Date().toLocaleString('sr-RS')} (${process.env.TZ}), u bazi: ${t}`)
})
