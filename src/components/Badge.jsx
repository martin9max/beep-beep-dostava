import { motion } from 'framer-motion'

/** Okrugli pečat "keš pri isporuci" sa tekstom u krugu; `rotate` je MotionValue. */
export default function Badge({ rotate, className = '' }) {
  return (
    <div className={`grid place-items-center rounded-full bg-paper text-deep shadow-[0_18px_40px_-18px_rgba(0,0,0,.6)] ring-4 ring-ink/90 ${className}`}>
      {/* stalno sporo okretanje ide preko CSS-a (ne opterećuje JavaScript), skrol dodaje svoje */}
      <div className="badge-spin absolute inset-0">
        <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" style={{ rotate }} aria-hidden="true">
          <defs>
            <path id="badge-circle" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
          </defs>
          <text fontSize="18" fontWeight="800" letterSpacing="2" fill="currentColor">
            <textPath href="#badge-circle" textLength="448">
              PLATITE KEŠOM • PRI ISPORUCI •
            </textPath>
          </text>
        </motion.svg>
      </div>
      {/* sredina stoji mirno: novčanica */}
      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-red text-white">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 10v4M18 10v4" />
        </svg>
      </span>
    </div>
  )
}
