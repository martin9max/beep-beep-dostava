import { useEffect, useRef, useState } from 'react'
import { PHONE } from '../data'

// logo u većoj rezoluciji (iz public/), da bude oštar na ekranu telefona
const LOGO = `${import.meta.env.BASE_URL}icon-192.png`

/**
 * 3D telefon (samo CSS) koji zvoni i okreće se: spreda dolazni poziv od Beep Beep dostave,
 * pozadi logo. Animacije su u index.css (.phone-*), klik poziva broj.
 */
export default function Phone({ href }) {
  // animacije se pauziraju dok telefon nije na ekranu
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '100px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <a ref={ref} href={href} aria-label={`Pozovite ${PHONE}`} className={`phone-stage group relative block ${visible ? '' : 'is-paused'}`}>
      {/* "BEEP!" oblačići koji iskaču oko telefona */}
      <span className="phone-bubble left-[-28px] top-[18%] [animation-delay:0s]" aria-hidden="true">
        BEEP!
      </span>
      <span className="phone-bubble right-[-34px] top-[34%] rotate-6 [animation-delay:.35s]" aria-hidden="true">
        BEEP!
      </span>

      <div className="phone-float">
        <div className="phone">
          {/* prednja strana: dolazni poziv */}
          <div className="phone-face phone-front">
            <div className="flex h-full flex-col items-center overflow-hidden rounded-[30px] bg-[linear-gradient(170deg,#2f67d8,#1446b8_50%,#0d2f80)] px-5 pb-7 pt-3 text-white">
              <div className="flex w-full items-center justify-between text-[11px] font-semibold text-white/80">
                <span>12:30</span>
                <span className="h-[22px] w-[74px] rounded-full bg-black" />
                <span className="flex items-center gap-1">
                  <span className="flex items-end gap-[2px]">
                    <i className="block h-1.5 w-[3px] rounded-sm bg-white/80" />
                    <i className="block h-2 w-[3px] rounded-sm bg-white/80" />
                    <i className="block h-2.5 w-[3px] rounded-sm bg-white/80" />
                  </span>
                  <i className="block h-2.5 w-5 rounded-[3px] border border-white/70 p-[1px]">
                    <i className="block h-full w-3/4 rounded-[1px] bg-white/80" />
                  </i>
                </span>
              </div>

              <p className="mt-9 text-xs uppercase tracking-[.25em] text-white/85">dolazni poziv</p>

              <div className="relative mt-6 grid h-[104px] w-[104px] place-items-center">
                <span className="phone-ring" />
                <span className="phone-ring [animation-delay:.6s]" />
                <img src={LOGO} alt="" width="104" height="104" className="relative h-full w-full rounded-full ring-4 ring-white/90" />
              </div>

              <p className="mt-6 text-xl font-bold leading-tight">Beep Beep Dostava</p>
              <p className="mt-1 text-sm text-white/90">{PHONE}</p>
              <p className="mt-1 text-xs text-white/75">Negotin</p>

              <div className="mt-auto flex w-full justify-between px-3">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#e5484d]">
                  <HandsetIcon className="h-6 w-6 rotate-[135deg]" />
                </span>
                <span className="phone-accept grid h-14 w-14 place-items-center rounded-full bg-[#30a46c]">
                  <HandsetIcon className="h-6 w-6" />
                </span>
              </div>
            </div>
          </div>

          {/* zadnja strana: logo */}
          <div className="phone-face phone-back">
            <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[34px] bg-[radial-gradient(120%_80%_at_30%_20%,#ef3a43,#d71e28_45%,#9f1018)]">
              <div className="absolute left-4 top-4 grid h-[84px] w-[84px] grid-cols-2 gap-1.5 rounded-[22px] bg-black/25 p-2.5 shadow-inner">
                <i className="block rounded-full bg-[#0a0f1f] ring-2 ring-white/20" />
                <i className="block rounded-full bg-[#0a0f1f] ring-2 ring-white/20" />
                <i className="block rounded-full bg-[#0a0f1f] ring-2 ring-white/20" />
                <i className="m-auto block h-3 w-3 rounded-full bg-[#fff3c4]" />
              </div>
              <img src={LOGO} alt="" width="120" height="120" className="h-[120px] w-[120px] rounded-full ring-[5px] ring-white shadow-[0_12px_30px_-10px_rgba(0,0,0,.6)]" />
              <p className="mt-5 text-[22px] font-extrabold uppercase leading-none tracking-tight text-white">Beep Beep</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[.3em] text-white/75">dostava</p>
            </div>
          </div>

          {/* bokovi, da telefon ima debljinu kad se okrene */}
          <div className="phone-side phone-left" />
          <div className="phone-side phone-right" />
        </div>
      </div>

      <span className="phone-shadow" aria-hidden="true" />
      <span className="mt-6 block text-center text-sm text-white/85 transition-colors group-hover:text-white">Kliknite telefon i pozovite</span>
    </a>
  )
}

function HandsetIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#fff" aria-hidden="true">
      <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
    </svg>
  )
}
