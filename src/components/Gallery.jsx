import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Slike radova lokala: src/assets/galerija/<slug>/*.jpg (redosled po imenu fajla, npr. 01-..., 02-...).
const ALL = Object.entries(import.meta.glob('../assets/galerija/*/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b))
  .reduce((bySlug, [path, url]) => {
    const slug = path.split('/').at(-2)
    ;(bySlug[slug] ||= []).push(url)
    return bySlug
  }, {})

export const galleryOf = (slug) => ALL[slug] ?? []

/** "Naši radovi": slike u traci koja se prevlači; klik otvara veliku sliku sa listanjem. */
export default function Gallery({ slug, name }) {
  const images = galleryOf(slug)
  const [open, setOpen] = useState(null)
  const show = (i) => setOpen((i + images.length) % images.length)

  // strelice i Escape dok je velika slika otvorena
  useEffect(() => {
    if (open === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') show(open + 1)
      if (e.key === 'ArrowLeft') show(open - 1)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  if (!images.length) return null
  return (
    <section aria-label={`Radovi: ${name}`} className="border-t border-line p-5 sm:p-7">
      <h2 className="text-[22px] font-bold">Naši radovi</h2>
      <p className="mt-0.5 text-sm text-mute">Kliknite na sliku da je vidite u većem formatu.</p>
      <ul className="-mx-5 mt-4 flex snap-x gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:thin] sm:-mx-7 sm:px-7">
        {images.map((src, i) => (
          <li key={src} className="snap-start">
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Otvori sliku ${i + 1} od ${images.length}`}
              className="block h-56 w-[168px] overflow-hidden rounded-xl bg-paper shadow-[0_12px_24px_-16px_rgba(10,38,104,.6)] transition hover:-translate-y-1 sm:h-64 sm:w-[192px]"
            >
              <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Slika ${open + 1} od ${images.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-[#04102c]/90 p-4"
          >
            <motion.img
              key={images[open]}
              src={images[open]}
              alt=""
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[86vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white">
              {open + 1} / {images.length}
            </span>
            <ViewerButton label="Zatvori" className="right-4 top-4" onClick={() => setOpen(null)}>
              <path d="M6 6l12 12M18 6 6 18" />
            </ViewerButton>
            <ViewerButton label="Prethodna slika" className="left-3 top-1/2 -translate-y-1/2" onClick={() => show(open - 1)}>
              <path d="M15 5l-7 7 7 7" />
            </ViewerButton>
            <ViewerButton label="Sledeća slika" className="right-3 top-1/2 -translate-y-1/2" onClick={() => show(open + 1)}>
              <path d="M9 5l7 7-7 7" />
            </ViewerButton>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function ViewerButton({ label, className, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`absolute grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/30 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
