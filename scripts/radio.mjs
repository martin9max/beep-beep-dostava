// Spisak programa za Beep Beep radio: pesme (public/radio/pesme) i džinglovi (public/radio/dzinglovi)
// sa trajanjem, naslovom i izvođačem -> src/radio.json. Pokretanje: npm run radio
//
// Naslov i izvođač se čitaju iz same mp3 pesme (oznake). Za pesme sa licencom koja traži navođenje autora
// (npr. CC BY), tekst za navođenje se upisuje u branding/radio/pesme.json: { "ime-fajla.mp3": { "credit": "..." } }
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const extra = existsSync(path.join(root, 'branding/radio/pesme.json')) ? JSON.parse(readFileSync(path.join(root, 'branding/radio/pesme.json'), 'utf8')) : {}
const texts = JSON.parse(readFileSync(path.join(root, 'branding/dzinglovi/tekstovi.json'), 'utf8'))

function probe(file) {
  const out = execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', file], { encoding: 'utf8' })
  const { format } = JSON.parse(out)
  const tags = Object.fromEntries(Object.entries(format.tags ?? {}).map(([k, v]) => [k.toLowerCase(), v]))
  return { duration: Math.round(Number(format.duration) * 100) / 100, title: tags.title, artist: tags.artist }
}

const list = (dir) =>
  existsSync(path.join(root, dir))
    ? readdirSync(path.join(root, dir))
        .filter((f) => /\.(mp3|m4a|ogg)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, 'sr'))
    : []

const songs = list('public/radio/pesme').map((file) => {
  const info = probe(path.join(root, 'public/radio/pesme', file))
  const fallback = file.replace(/\.[^.]+$/, '').split(' - ')
  return {
    file: `radio/pesme/${file}`,
    title: info.title || fallback.at(-1),
    artist: info.artist || (fallback.length > 1 ? fallback[0] : ''),
    credit: extra[file]?.credit ?? '',
    duration: info.duration,
  }
})

const jingles = list('public/radio/dzinglovi').map((file) => ({
  file: `radio/dzinglovi/${file}`,
  text: texts.find((t) => file.startsWith(t.id))?.text ?? '',
  duration: probe(path.join(root, 'public/radio/dzinglovi', file)).duration,
}))

writeFileSync(path.join(root, 'src/radio.json'), JSON.stringify({ songs, jingles }, null, 2) + '\n')
console.log(`Beep Beep radio: ${songs.length} pesama, ${jingles.length} džinglova -> src/radio.json`)
