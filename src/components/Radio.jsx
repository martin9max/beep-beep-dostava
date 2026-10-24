import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RADIO } from '../data'
import { EASE } from '../lib/order'

// YouTube IFrame API se učitava tek kad kupac prvi put otvori radio (ne usporava sajt).
let apiPromise
function loadYouTube() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  apiPromise ||= new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(s)
  })
  return apiPromise
}

/**
 * Radio u zaglavlju: dugme otvara meni sa žanrovima (moderna, strana, narodna, folk),
 * izbor odmah pušta muziku. Svira i dok se prelazi sa stranice na stranicu.
 * Stanice (YouTube video/plejliste) su u data.js, RADIO.
 */
export default function Radio() {
  const [open, setOpen] = useState(false)
  const [station, setStation] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [error, setError] = useState('')
  const player = useRef(null)
  const ready = useRef(false)
  const pending = useRef(null)
  const host = useRef(null)
  const box = useRef(null)

  // zatvaranje klikom van menija ili tasterom Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // plejer se pravi čim se meni prvi put otvori, da izbor žanra odmah krene (telefoni traže da
  // puštanje počne baš na dodir)
  const ensurePlayer = () => {
    if (player.current) return
    player.current = 'loading'
    loadYouTube().then((YT) => {
      // YouTube zamenjuje element svojim iframe-om, zato se pravi van React-a
      const el = document.createElement('div')
      host.current.appendChild(el)
      player.current = new YT.Player(el, {
        width: 1,
        height: 1,
        host: 'https://www.youtube-nocookie.com',
        playerVars: { autoplay: 0, controls: 0, playsinline: 1 },
        events: {
          onReady: (e) => {
            ready.current = true
            e.target.setVolume(volume)
            if (pending.current) play(pending.current)
          },
          onStateChange: (e) => setPlaying(e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING),
          onError: () => {
            setPlaying(false)
            setError('Ova stanica trenutno ne radi. Izaberite drugu.')
          },
        },
      })
    })
  }

  const play = (s) => {
    setStation(s)
    setError('')
    if (!ready.current) {
      pending.current = s
      return
    }
    pending.current = null
    const p = player.current
    if (s.type === 'playlist') p.loadPlaylist({ list: s.id, listType: 'playlist', index: 0 })
    else p.loadVideoById(s.id)
    p.setLoop?.(true)
    p.playVideo()
  }

  const toggle = () => {
    const p = player.current
    if (!ready.current || !station) return
    if (playing) p.pauseVideo()
    else p.playVideo()
  }

  const changeVolume = (v) => {
    setVolume(v)
    if (ready.current) player.current.setVolume(v)
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => {
          ensurePlayer()
          setOpen(!open)
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={playing ? `Radio: ${station?.label} (svira)` : 'Radio'}
        className={`flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border px-2.5 font-semibold transition sm:h-11 sm:px-3 ${
          playing ? 'border-red bg-red text-white' : 'border-line text-deep hover:border-ink'
        }`}
      >
        {playing ? <Bars /> : <RadioIcon />}
        <span className="hidden sm:inline">{playing ? station.label : 'Radio'}</span>
      </button>

      {/* skriveni YouTube plejer (ne display:none, jer onda ne svira pouzdano) */}
      <div ref={host} className="pointer-events-none fixed -left-[9999px] top-0 h-px w-px overflow-hidden" aria-hidden="true" />

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Beep Beep radio"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-x-3 top-[calc(76px+env(safe-area-inset-top,0px))] z-40 rounded-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-[calc(100%+10px)] sm:w-[300px] border border-line bg-white p-4 text-deep shadow-[0_24px_50px_-20px_rgba(22,115,196,.55)]"
          >
            <p className="font-serif text-xl font-bold">Beep Beep radio</p>
            <p className="text-sm text-mute">Izaberite muziku dok čekate dostavu.</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {RADIO.map((s) => {
                const on = station?.key === s.key
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => play(s)}
                    aria-pressed={on}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      on ? 'border-red bg-red text-white' : 'border-line bg-paper hover:border-ink/50'
                    }`}
                  >
                    <span className="block text-xl leading-none" aria-hidden="true">
                      {s.emoji}
                    </span>
                    <span className="mt-1.5 block font-bold">{s.label}</span>
                  </button>
                )
              })}
            </div>

            {error && <p className="mt-3 text-sm font-semibold text-red">{error}</p>}

            {station && (
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? 'Pauza' : 'Pusti'}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red text-white"
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-px" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <label className="flex flex-1 items-center gap-2 text-sm text-mute">
                  <span className="sr-only">Jačina zvuka</span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
                    <path d="M4 9v6h4l5 4V5L8 9H4z" />
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => changeVolume(Number(e.target.value))}
                    className="w-full accent-[#d71e28]"
                  />
                </label>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function RadioIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M7 8l10-5" />
      <circle cx="15.5" cy="14" r="2.5" />
      <path d="M6.5 12.5h4M6.5 15.5h4" />
    </svg>
  )
}

/** Mali "ekvilajzer" dok radio svira. */
function Bars() {
  return (
    <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className="radio-bar w-[3px] rounded-sm bg-current" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  )
}
