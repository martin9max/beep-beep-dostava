import { useSyncExternalStore } from 'react'

// Mali ruter bez dodatnih biblioteka: /naruci, /lokal/picerija-castelo, /prijava...
const listeners = new Set()
const subscribe = (fn) => {
  listeners.add(fn)
  window.addEventListener('popstate', fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('popstate', fn)
  }
}

// Osnovna putanja sajta: '' na pravom domenu, '/beep-beep-dostava' na GitHub Pages
export const BASE = import.meta.env.BASE_URL.replace(/\/$/, '')

/** Putanja sajta -> adresa u pregledaču ("/naruci" -> "/beep-beep-dostava/naruci" na Pages). */
export const withBase = (path) => (path.startsWith('/') ? BASE + path : path)

// Pamćenje skrola po stranici: dugme "nazad" vraća tačno tamo gde je kupac bio
// (npr. iz menija lokala nazad na listu lokala), umesto na vrh stranice.
const positions = new Map()
const newKey = () => Math.random().toString(36).slice(2, 10)
const pageKey = () => history.state?.bbKey

// odmah, bez klizanja (klizanje je samo za linkove ka delovima početne, vidi index.css)
const scrollToY = (y) => window.scrollTo({ top: y, behavior: 'instant' })

if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual'
  if (!pageKey()) history.replaceState({ ...history.state, bbKey: newKey() }, '')
  addEventListener('scroll', () => positions.set(pageKey(), scrollY), { passive: true })
  addEventListener('popstate', () => {
    // klik na link ka delu stranice (#usluge, #kontakt...) takođe pravi "popstate", ali bez našeg
    // ključa: tu pregledač sam skroluje do tog dela i ne sme da ga vraćamo na vrh
    if (!pageKey()) return
    const y = positions.get(pageKey()) ?? 0
    // čeka da React nacrta stranicu, pa tek onda skroluje
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToY(y)))
  })
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  history[replace ? 'replaceState' : 'pushState']({ bbKey: replace ? pageKey() : newKey() }, '', withBase(to))
  listeners.forEach((fn) => fn())
  if (scroll && !to.includes('#')) scrollToY(0)
}

/** Trenutna putanja i parametri (?k=pica). Pri prerenderu je uvek početna. */
export function useRoute() {
  const href = useSyncExternalStore(
    subscribe,
    () => location.pathname + location.search,
    () => '/',
  )
  const url = new URL(href, 'http://x')
  const path = BASE && url.pathname.startsWith(BASE) ? url.pathname.slice(BASE.length) : url.pathname
  return { path: path.replace(/\/+$/, '') || '/', query: url.searchParams }
}

/** Stranice za naručivanje imaju ispod zaglavlja traku sa adresom dostave (44px). */
export const isOrderingPath = (path) => /^\/(naruci|lokal|korpa)(\/|$)/.test(path)

/** Link unutar sajta (bez ponovnog učitavanja stranice). */
export function Link({ href, onClick, ...rest }) {
  return (
    <a
      href={withBase(href)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(href)
      }}
      {...rest}
    />
  )
}
