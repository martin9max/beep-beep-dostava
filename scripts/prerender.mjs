// Posle buildа: pravi gotov HTML za svaku stranu sajta (početna, usluge, meni svakog lokala, radio, uslovi,
// privatnost), svaku sa svojim naslovom, opisom i adresom (canonical), pa robots.txt i sitemap.xml.
// Tako Google vidi svaku stranu posebno, sa sadržajem (npr. ceo meni lokala), a ne samo početnu.
import { mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { loadEnv } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const base = process.env.VITE_BASE || '/'
const siteUrl = loadEnv('production', root).VITE_SITE_URL.replace(/\/$/, '')

const { render, structuredData, indexedPaths, pageMeta } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const json = structuredData(siteUrl)
  .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  .join('\n    ')

// 3D trokolica (three.js) se preuzima odmah, uporedo sa ostatkom strane (samo na početnoj, gde i postoji)
const heroScene = (await readdir(path.join(dist, 'assets'))).find((f) => /^HeroScene-.*\.js$/.test(f))
const preload = heroScene ? `<link rel="modulepreload" crossorigin href="${base}assets/${heroScene}">\n    ` : ''

const template = await readFile(path.join(dist, 'index.html'), 'utf8')

/** HTML jedne strane: šablon iz builda + naslov, opis i adresa te strane + njen sadržaj. */
async function page(url) {
  const meta = pageMeta(url)
  const href = `${siteUrl}${meta.path === '/' ? '/' : meta.path}`
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${attr(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${attr(meta.description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${href}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${href}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${attr(meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${attr(meta.description)}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${attr(meta.title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${attr(meta.description)}`)
    .replace('<div id="root"></div>', `<div id="root">${await render(url)}</div>`)
  // podaci o firmi i česta pitanja (za Google) su na početnoj, kao i preuzimanje 3D trokolice
  return url === '/' ? html.replace('</head>', `    ${preload}${json}\n  </head>`) : html
}

const paths = indexedPaths()
for (const url of paths) {
  const file = url === '/' ? path.join(dist, 'index.html') : path.join(dist, url.slice(1), 'index.html')
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, await page(url))
}

const today = new Date().toISOString().slice(0, 10)
// interni delovi (admin, API, panel za lokale, SMS stranica, nalog i korpa) ne idu u pretragu
await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /partneri\nDisallow: /sms/\nDisallow: /nalog\nDisallow: /korpa\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
)
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (url) => `  <url>
    <loc>${siteUrl}${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${url === '/' ? '1.0' : url.startsWith('/naruci') || url.startsWith('/lokal') ? '0.8' : '0.3'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
)
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerender: gotovo, ${paths.length} strana (${siteUrl})`)
