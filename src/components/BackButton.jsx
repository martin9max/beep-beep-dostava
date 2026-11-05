import { Link, canGoBack, navigate } from '../lib/router'

/**
 * Korak nazad, kao dugme za nazad u pregledaču: vraća na prethodnu stranicu sajta (na isto mesto).
 * Ako prethodne nema (kupac je došao direktno ili osvežio), ide na `href`, ali ga ne dodaje u istoriju,
 * pa se posle pregledačevim "nazad" ne vraća opet ovde.
 */
export function goBack(e, href) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  if (canGoBack()) return history.back()
  navigate(href, { replace: true })
  // deo početne (npr. /#usluge): spusti se do tog dela
  const id = href.split('#')[1]
  if (id) requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView()))
}

/** Dugme "nazad" (crveni krug sa strelicom i tekst). */
export default function BackButton({ href, label }) {
  return (
    <Link
      href={href}
      onClick={(e) => goBack(e, href)}
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
