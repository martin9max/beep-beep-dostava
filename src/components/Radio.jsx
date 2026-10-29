import { Link, useRoute } from '../lib/router'
import { useRadio } from '../lib/radio'

/**
 * Dugme "Radio" u zaglavlju: vodi na stranicu /radio (izbor stanice, šta svira, spisak pesama).
 * Dok muzika svira, pokazuje ime stanice i mali ekvilajzer.
 */
export default function Radio() {
  const radio = useRadio()
  const here = useRoute().path === '/radio'
  const { playing, station } = radio

  return (
    <Link
      href="/radio"
      // YouTube plejer se sprema već na klik, da izbor stanice odmah krene
      onPointerDown={radio.prepare}
      onClick={radio.prepare}
      aria-label={playing ? `Radio: ${station?.label} (svira)` : 'Radio'}
      aria-current={here ? 'page' : undefined}
      className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border px-2.5 font-semibold transition sm:h-11 sm:px-3 ${
        playing ? 'border-red bg-red text-white' : here ? 'border-white bg-white text-ink' : 'border-white/35 text-white hover:bg-white/10'
      }`}
    >
      {/* dok ne svira, ikonica treperi crveno da privuče pažnju */}
      {playing ? <Bars /> : <RadioIcon className="radio-blink h-5 w-5" />}
      <span className="hidden sm:inline">{playing ? station.label : 'Radio'}</span>
    </Link>
  )
}

export function RadioIcon({ className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M7 8l10-5" />
      <circle cx="15.5" cy="14" r="2.5" />
      <path d="M6.5 12.5h4M6.5 15.5h4" />
    </svg>
  )
}

/** Mali "ekvilajzer" dok radio svira. */
export function Bars({ className = 'h-4' }) {
  return (
    <span className={`flex items-end gap-[3px] ${className}`} aria-hidden="true">
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className="radio-bar w-[3px] rounded-sm bg-current" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  )
}
