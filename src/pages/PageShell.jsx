import { useEffect } from 'react'
import { SITE } from '../data'
import { isOrderingPath, useRoute } from '../lib/router'

/** Naslov taba u browseru za podstranice. */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE.name}` : SITE.title
    // povratak na početnu bez ponovnog učitavanja: vraća se naslov sajta
    return () => {
      document.title = SITE.title
    }
  }, [title])
}

/** Okvir za podstranice: prostor ispod fiksnog zaglavlja. */
export default function PageShell({ children }) {
  const withBar = isOrderingPath(useRoute().path)
  return (
    <main className={`min-h-[70vh] ${withBar ? 'pt-[calc(116px+env(safe-area-inset-top,0px))]' : 'pt-[calc(72px+env(safe-area-inset-top,0px))]'}`}>
      {children}
    </main>
  )
}

/** Kartica na sredini (prijava, registracija). */
export function Card({ title, subtitle, children, wide = false }) {
  return (
    <div className={`mx-auto px-5 pb-24 pt-10 sm:pt-16 ${wide ? 'max-w-[640px]' : 'max-w-[460px]'}`}>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_30px_60px_-40px_rgba(13,47,128,.6)] sm:p-8">
        <h1 className="text-[34px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-deep/75">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
