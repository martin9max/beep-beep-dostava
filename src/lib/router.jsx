import { useSyncExternalStore } from 'react'

// Mali ruter bez dodatnih biblioteka: /naruci, /lokal/picerija-kastelo, /prijava...
const listeners = new Set()
const subscribe = (fn) => {
  listeners.add(fn)
  window.addEventListener('popstate', fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('popstate', fn)
  }
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  history[replace ? 'replaceState' : 'pushState'](null, '', to)
  listeners.forEach((fn) => fn())
  if (scroll && !to.includes('#')) {
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }
}

/** Trenutna putanja i parametri (?k=pica). Pri prerenderu je uvek početna. */
export function useRoute() {
  const href = useSyncExternalStore(
    subscribe,
    () => location.pathname + location.search,
    () => '/',
  )
  const url = new URL(href, 'http://x')
  return { path: url.pathname.replace(/\/+$/, '') || '/', query: url.searchParams }
}

/** Stranice za naručivanje imaju ispod zaglavlja traku sa adresom dostave (44px). */
export const isOrderingPath = (path) => /^\/(naruci|lokal|korpa)(\/|$)/.test(path)

/** Link unutar sajta (bez ponovnog učitavanja stranice). */
export function Link({ href, onClick, ...rest }) {
  return (
    <a
      href={href}
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
