// Produkcijski server: `npm start` posle `npm run build`.
// Služi gotov sajt iz dist/ i API (/api) i admin panel (/admin) iz iste adrese.
import { createServer } from 'node:http'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

for (const file of ['.env', '.env.local']) if (existsSync(file)) process.loadEnvFile(file)
process.env.NODE_ENV ||= 'production'

const { api } = await import('./api.js')
const { admin } = await import('./admin.js')

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
  const info = await stat(file).catch(() => null)
  // stranice kao /naruci nemaju svoj fajl: dobijaju index.html, a React prikaže pravu stranicu
  if (!info || info.isDirectory()) file = path.join(dist, 'index.html')
  const ext = path.extname(file)
  res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream')
  if (pathname.startsWith('/assets/')) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  api(req, res, () => admin(req, res, () => staticFiles(req, res)))
}).listen(PORT, () => console.log(`Beep Beep radi na http://localhost:${PORT}`))
