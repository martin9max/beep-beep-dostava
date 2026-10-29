// Slike kategorija i lokala: src/assets/photos/kategorije/<key>.jpg i src/assets/photos/lokali/<slug>.jpg
const IMAGES = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/photos/{kategorije,lokali}/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }),
  ).map(([path, url]) => [path.split('/').slice(-2).join('/').replace(/\.[^.]+$/, ''), url]),
)

// Logoi partnera (src/assets/partners/<ime>.jpg, 288 x 112); lokal sa `logo: 'Pastizza'` ga prikazuje na kartici i meniju
const LOGOS = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/partners/*.{svg,png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' })).map(([path, url]) => [
    path.split('/').pop().replace(/\.[^.]+$/, ''),
    url,
  ]),
)
export const logoOf = (shop) => (shop.logo ? LOGOS[shop.logo] : null)

/** Da li postoji fotografija (npr. "lokali/kafanica"). Lokali bez slike se prikazuju bez nje. */
export const hasImage = (src) => Boolean(IMAGES[src])

// tople pozadine za emoji dok nema fotografije
const TINTS = [
  'from-[#ffe1c2] to-[#ffb98a]',
  'from-[#ffd6d8] to-[#f8a3a8]',
  'from-[#d7ebff] to-[#9ccbf5]',
  'from-[#fff1b8] to-[#ffd36b]',
  'from-[#dff5dc] to-[#a9dea2]',
  'from-[#efe0ff] to-[#c9a8f2]',
]
const tint = (key) => TINTS[[...key].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length]

/** Slika (ako postoji) ili emoji na obojenoj pozadini. `src` je npr. "kategorije/pica". */
export default function Thumb({ src, emoji, alt = '', className = '', emojiClass = 'text-5xl' }) {
  const url = IMAGES[src]
  return (
    <div className={`relative overflow-hidden ${url ? 'bg-[#dfe5ef]' : `bg-gradient-to-br ${tint(src)}`} ${className}`}>
      {url ? (
        <img src={url} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span role="img" aria-label={alt} className={`absolute inset-0 grid place-items-center drop-shadow-[0_6px_10px_rgba(0,0,0,.18)] ${emojiClass}`}>
          {emoji}
        </span>
      )}
    </div>
  )
}
