import { Link, canGoBack, navigate } from '../lib/router'

/**
 * Dugme "nazad" (crveni krug sa strelicom i tekst). Sa `back` vraća na prethodnu stranicu sajta,
 * ako je ima; ako je kupac došao direktno (link, osveženo), ide na `href`.
 */
export default function BackButton({ href, label, back = false }) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (back && canGoBack()) {
          e.preventDefault()
          history.back()
        } else if (href.includes('#')) {
          // deo početne (npr. /#usluge): ode na početnu pa se spusti do tog dela
          e.preventDefault()
          navigate(href)
          const id = href.split('#')[1]
          requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()))
        }
      }}
      className="group inline-flex items-center gap-2 rounded-full border border-line bg-white py-2 pl-2 pr-4 text-[15px] font-semibold text-deep transition hover:border-red hover:text-red"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-red text-white">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      </span>
      {label}
    </Link>
  )
}

export function ArrowLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 8H3M7 4 3 8l4 4" />
    </svg>
  )
}
