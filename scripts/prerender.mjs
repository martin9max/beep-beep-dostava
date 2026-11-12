// Posle buildа: ubacuje gotov HTML u dist/index.html i pravi robots.txt i sitemap.xml.
import { readFile, readdir, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { loadEnv } from 'vite'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const base = process.env.VITE_BASE || '/'
const siteUrl = loadEnv('production', root).VITE_SITE_URL.replace(/\/$/, '')

const { render, structuredData } = await import(pathToFileURL(path.join(root, 'dist-ssr/entry-server.js')).href)

const json = structuredData(siteUrl)
  .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  .join('\n    ')

// 3D trokolica (three.js) se preuzima odmah, uporedo sa ostatkom strane, a ne tek kad se strana pokrene
const heroScene = (await readdir(path.join(dist, 'assets'))).find((f) => /^HeroScene-.*\.js$/.test(f))
const preload = heroScene ? `<link rel="modulepreload" crossorigin href="${base}assets/${heroScene}">\n    ` : ''

let html = await readFile(path.join(dist, 'index.html'), 'utf8')
html = html
  .replace('<div id="root"></div>', `<div id="root">${render()}</div>`)
  .replace('</head>', `    ${preload}${json}\n  </head>`)
await writeFile(path.join(dist, 'index.html'), html)

const today = new Date().toISOString().slice(0, 10)
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
)
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerender: gotovo (${siteUrl})`)
