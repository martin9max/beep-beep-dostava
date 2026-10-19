import { motion } from 'framer-motion'
import { PARTNERS } from '../data'
import { EASE } from '../lib/order'

// Logoi iz src/assets/partners; ime fajla je ime partnera.
const LOGOS = Object.entries(
  import.meta.glob('../assets/partners/*.{svg,png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' }),
).map(([path, src]) => ({ name: path.split('/').pop().replace(/\.[^.]+$/, ''), src }))

const ITEMS = LOGOS.length ? LOGOS : PARTNERS.map((name) => ({ name, src: null }))

/** Traka sa logoima partnera koja se beskonačno pomera. */
export default function Partners({ className = '' }) {
  // dok je partnera malo, ponavljaju se da traka bude puna; pa se sve duplira da pomeranje bude bez prekida
  const half = Array.from({ length: Math.ceil(8 / ITEMS.length) }, () => ITEMS).flat()
  const loop = [...half, ...half]
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
        <ul className="marquee flex w-max gap-3 sm:gap-4">
          {loop.map((partner, i) => (
            <li
              key={i}
              aria-hidden={i >= ITEMS.length || undefined}
              className={`grid shrink-0 place-items-center rounded-lg border border-line bg-white px-3 ${
                partner.src ? 'h-14 w-32 sm:h-[72px] sm:w-48' : 'h-12 w-32 sm:h-14 sm:w-40'
              }`}
            >
              {partner.src ? (
                <img src={partner.src} alt={partner.name} loading="lazy" className="max-h-12 w-auto max-w-full object-contain sm:max-h-16" />
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
