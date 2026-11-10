import { motion } from 'framer-motion'
import { PARTNERS } from '../data'
import { EASE } from '../lib/order'

// Logoi iz src/assets/partners; ime fajla je ime partnera. Originali su u branding/partneri.
// Široki logoi (576 x 224) su u partners/, a okrugli, kvadratni i uži (520 x 400) u partners/uski/:
// oni dobijaju uži okvir iste visine, pa im je logo jednako krupan kao kod širokih.
const toLogo = (narrow) => ([path, src]) => ({ name: path.split('/').pop().replace(/\.[^.]+$/, ''), src, narrow })
// izmešan, ali uvek isti redosled (isti na serveru i u pregledaču): "slučajan" broj iz imena partnera
const mixKey = (name) => [...name].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 1000003, 7)
const mixed = (logos) => logos.sort((a, b) => mixKey(a.name) - mixKey(b.name))
const WIDE = mixed(
  Object.entries(import.meta.glob('../assets/partners/*.{svg,png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' })).map(toLogo(false)),
)
const NARROW = mixed(
  Object.entries(import.meta.glob('../assets/partners/uski/*.{svg,png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' })).map(toLogo(true)),
)
// široki i uži naizmenično, ravnomerno raspoređeni (npr. 3 široka i 5 užih: Š U U Š U Š U U)
const MIXED = [...WIDE.map((logo, i) => [(i + 0.5) / WIDE.length, logo]), ...NARROW.map((logo, i) => [(i + 0.5) / NARROW.length, logo])]
  .sort((a, b) => a[0] - b[0])
  .map(([, logo]) => logo)
// redosled koji je izabrao vlasnik; novi partneri (kojih nema na ovom spisku) idu na kraj, izmešani kao gore
const ORDER = ['Marina i Batica', 'Pastizza', 'Bajka', 'Tortica 989', 'Jovanović Auto Centar Negotin', 'Druga priča', 'Bucino dućanče', 'La Moara', 'Aleksandrović', 'Kafanica']
const place = (logo) => (ORDER.includes(logo.name) ? ORDER.indexOf(logo.name) : ORDER.length + MIXED.indexOf(logo))
const LOGOS = [...MIXED].sort((a, b) => place(a) - place(b))

const ITEMS = LOGOS.length ? LOGOS : PARTNERS.map((name) => ({ name, src: null }))

// jedan krug trake ima bar 8 logoa (dok je partnera manje, ponavljaju se), da bude širi od ekrana
const PER_SET = 8
const SET = Array.from({ length: Math.ceil(PER_SET / ITEMS.length) }, () => ITEMS).flat()
// dva ista kruga jedan za drugim: kad prvi izađe levo, drugi je tačno na njegovom mestu (bez trzaja)
const COPIES = 2
// širina kruga u "širokim poljima" (uže polje je pola širokog), za stalnu brzinu (vidi .marquee u index.css)
const UNITS = SET.reduce((n, logo) => n + (logo.narrow ? 0.5 : 1), 0)

/** Traka sa logoima partnera koja se beskonačno pomera. */
export default function Partners({ className = '' }) {
  const loop = Array.from({ length: COPIES }, () => SET).flat()
  return (
    <motion.section
      aria-labelledby="partneri"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
      className={`flex shrink-0 flex-col gap-2 overflow-hidden ${className}`}
    >
      <h2 id="partneri" className="px-1 text-center font-body text-xs font-bold uppercase tracking-[.2em] text-red sm:text-sm">
        Naši partneri
      </h2>
      <div className="relative min-w-0 overflow-hidden">
        {/* blagi prelaz na krajevima (obični slojevi, ne maska: maska tera telefon da prekrtava traku u svakom kadru) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-paper to-transparent sm:w-12" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-paper to-transparent sm:w-12" aria-hidden="true" />
        {/* razmak je desna margina svakog logoa (ne gap), da jedan krug bude tačno 1/COPIES trake i da nema trzaja */}
        {/* brzina ne zavisi od broja partnera ni od ekrana (vidi .marquee u index.css); staje dok je miš preko trake */}
        <ul className="marquee flex w-max hover:[animation-play-state:paused]" style={{ '--copies': COPIES, '--units': UNITS }}>
          {loop.map((partner, i) => (
            <li
              key={i}
              aria-hidden={i >= ITEMS.length || undefined}
              className={`mr-3 grid shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white sm:mr-4 ${
                partner.src ? '' : 'px-3'
              } ${
                !partner.src
                  ? 'h-12 w-32 sm:h-14 sm:w-40'
                  : partner.narrow
                    ? 'h-[100px] w-[130px] sm:h-[136px] sm:w-[177px] lg:h-[156px] lg:w-[203px]'
                    : 'h-[100px] w-[257px] sm:h-[136px] sm:w-[350px] lg:h-[156px] lg:w-[401px]'
              }`}
            >
              {partner.src ? (
                <img src={partner.src} alt={partner.name} decoding="sync" draggable="false" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-mute">{partner.name}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
