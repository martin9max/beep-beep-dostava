import { useEffect } from 'react'
import Lenis from 'lenis'

export function useSmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || window.self !== window.top) return
    const lenis = new Lenis({ anchors: { offset: -72 } })
    window.lenis = lenis // ruter ga koristi da vrati stranicu na vrh
    let frame
    const loop = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete window.lenis
    }
  }, [])
}
