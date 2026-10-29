import { useEffect } from 'react'
import { RADIO } from '../data'
import { useRadio } from '../lib/radio'
import { Bars, RadioIcon } from '../components/Radio'
import { usePageTitle } from './PageShell'

// boje stanica kao na predlogu vlasnika (roze, narandžasta, plava, ljubičasta)
const COLORS = [
  'from-[#ff3d8b] to-[#d6246e]',
  'from-[#ff9a1f] to-[#f06a00]',
  'from-[#22a6f2] to-[#1477d4]',
  'from-[#8b5cf6] to-[#6d3fd8]',
]

/** /radio: Beep Beep radio. Kupac bira samo vrstu muzike (stanicu) i vidi šta trenutno svira. */
export default function RadioPage() {
  const radio = useRadio()
  const { station, playing, track, error } = radio
  usePageTitle('Beep Beep radio')

  // plejer se sprema čim se stranica otvori (i kad neko dođe direktno na /radio)
  useEffect(() => radio.prepare(), [radio.prepare])

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-24 pt-6 sm:px-6">
      {/* baner: naslov, šta svira i kontrole */}
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0a2668_0%,#1446b8_55%,#5b2bb5_100%)] p-5 text-white shadow-[0_30px_60px_-30px_rgba(10,38,104,.8)] sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-red/30 blur-3xl" aria-hidden="true" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <div>
            <span className="inline-block -rotate-3 rounded-md bg-red px-3 py-1 text-[13px] font-extrabold uppercase tracking-wide shadow-lg">
              Besplatno za sve!
            </span>
            <h1 className="mt-3 font-body text-[clamp(38px,7vw,68px)] font-extrabold uppercase leading-[.95]">
              <span className="hero-title block text-white">Beep Beep</span>
              <span className="hero-title block text-red">Radio</span>
            </h1>
            <p className="mt-3 max-w-[38ch] text-[16px] leading-snug text-white/85 sm:text-lg">
              Vaša muzika dok čekate dostavu. Izaberite stanicu, svira i dok naručujete.
            </p>
          </div>

          <NowPlaying />
        </div>
      </section>

      {/* stanice */}
      <h2 className="mt-10 text-[28px] font-bold sm:text-[32px]">Stanice</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {RADIO.map((s, i) => {
          const on = station?.key === s.key
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => radio.play(s)}
                aria-pressed={on}
                className={`group relative flex h-full w-full flex-col items-start overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white transition hover:-translate-y-1 sm:p-5 ${COLORS[i % COLORS.length]} ${
                  on ? 'ring-4 ring-deep ring-offset-2 ring-offset-paper' : 'shadow-[0_16px_30px_-20px_rgba(10,38,104,.7)]'
                }`}
              >
                <span className="text-3xl leading-none drop-shadow" aria-hidden="true">
                  {s.emoji}
                </span>
                <span className="mt-3 block text-[18px] font-extrabold leading-tight sm:text-xl">Beep Beep {s.label}</span>
                <span className="mt-0.5 block text-[13px] font-semibold text-white/85">{s.desc}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-bold">
                  {on && playing ? (
                    <>
                      <Bars className="h-3" /> Svira
                    </>
                  ) : on ? (
                    'Izabrano'
                  ) : (
                    <>▶ Pusti</>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {error && <p className="mt-4 rounded-xl bg-red/10 px-4 py-3 font-semibold text-red">{error}</p>}


      <p className="mt-10 text-center text-[13px] text-mute">Muzika se pušta sa YouTube-a. Sva prava pripadaju autorima.</p>
    </div>
  )
}

/** Kartica u baneru: omot, naziv pesme, izvođač i kontrole. */
function NowPlaying() {
  const radio = useRadio()
  const { station, playing, track, volume } = radio
  const isList = station?.type === 'playlist'

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5" aria-live="polite">
      <div className="flex items-center gap-4">
        <div className="relative grid aspect-video w-28 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10 sm:w-40">
          {track?.id ? (
            <img src={`https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <RadioIcon className="h-9 w-9 text-white/60" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/70">
            {!station ? 'Izaberite stanicu' : track ? 'Trenutno svira' : 'Učitava se…'}
            {track && isList && track.total > 1 && <span> · pesma {track.index} od {track.total}</span>}
            {track && !isList && <span> · uživo 24/7</span>}
          </p>
          <p className="mt-1 line-clamp-2 text-[17px] font-bold leading-snug sm:text-xl">
            {track?.title ?? (station ? `Beep Beep ${station.label}` : 'Beep Beep radio')}
          </p>
          {track?.author && <p className="truncate text-[13px] text-white/70">{track.author}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={station ? radio.toggle : () => radio.play(RADIO[0])}
          aria-label={playing ? 'Pauza' : 'Pusti'}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-red text-white shadow-[0_12px_24px_-10px_rgba(227,19,28,.9)] transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className={`h-7 w-7 ${playing ? '' : 'translate-x-0.5'}`} fill="currentColor" aria-hidden="true">
            {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
        <label className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-[200px]">
          <span className="sr-only">Jačina zvuka</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white/80" fill="currentColor" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => radio.setVolume(Number(e.target.value))}
            className="w-full accent-[#e3131c]"
          />
        </label>
      </div>
    </div>
  )
}

