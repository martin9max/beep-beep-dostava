import { motion } from 'framer-motion'
import { PARTNERS } from '../data'
import { EASE } from '../lib/order'

// Logoi iz src/assets/partners; ime fajla je ime partnera. Slike su unapred
// prilagođene obliku polja (288 x 112), originali su u branding/partneri.
const LOGOS = Object.entries(
  import.meta.glob('../assets/partners/*.{svg,png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' }),
).map(([path, src]) => ({ name: path.split('/').pop().replace(/\.[^.]+$/, ''), src }))

const ITEMS = LOGOS.length ? LOGOS : PARTNERS.map((name) => ({ name, src: null }))

// u jednom krugu trake su bar 4 logoa (dok je partnera manje, ponavljaju se)
const PER_SET = 4
const SET = Array.from({ length: Math.ceil(PER_SET / ITEMS.length) }, () => ITEMS).flat()
// isti krug se ponavlja nekoliko puta da traka bude puna i na širokom ekranu
const COPIES = 4

/** Traka sa logoima partnera koja se beskonačno pomera. */
export default function Partners({ className = '' }) {
  const loop = Array.from({ length: COPIES }, () => SET).flat()
  return (
    <motion.section
      aria-labelledby="partneri"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
      className={`flex shrink-0 items-center gap-3 overflow-hidden sm:gap-4 ${className}`}
    >
      <h2 id="partneri" className="w-14 shrink-0 font-body text-[11px] font-semibold leading-tight text-mute sm:w-auto sm:text-sm">
        Naši partneri
      </h2>
      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        {/* razmak je desna margina svakog logoa (ne gap), da jedan krug bude tačno 1/COPIES trake i da nema trzaja */}
        <ul className="marquee flex w-max" style={{ '--copies': COPIES }}>
          {loop.map((partner, i) => (
            <li
              key={i}
              aria-hidden={i >= ITEMS.length || undefined}
              className={`mr-3 grid shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white sm:mr-4 ${
                partner.src ? '' : 'px-3'
              } ${
                partner.src ? 'h-[72px] w-44 sm:h-24 sm:w-64 lg:h-28 lg:w-72' : 'h-12 w-32 sm:h-14 sm:w-40'
              }`}
            >
              {partner.src ? (
                <img src={partner.src} alt={partner.name} loading="lazy" className="h-full w-full object-cover" />
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
