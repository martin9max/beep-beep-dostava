import { useEffect, useState } from 'react'
import { onAir, songCount, useRadio } from '../lib/radio'
import { RADIO } from '../data'
import { Bars } from '../components/Radio'
import { usePageTitle } from './PageShell'
import ptica from '../assets/beep-beep-ptica.webp'

// boje stanica (roze, narandžasta, plava, ljubičasta)
const COLORS = ['from-[#ff3d8b] to-[#d6246e]', 'from-[#ff9a1f] to-[#f06a00]', 'from-[#22a6f2] to-[#1477d4]', 'from-[#8b5cf6] to-[#6d3fd8]']

/** /radio: Beep Beep radio, prvi radio u Negotinu. Četiri stanice; kupac bira stanicu i vidi šta svira. */
export default function RadioPage() {
  const radio = useRadio()
  usePageTitle('Beep Beep radio')

  // plejer se sprema čim se stranica otvori (i kad neko dođe direktno na /radio)
  useEffect(() => radio.prepare(), [radio.prepare])

  return (
    <div className="mx-auto max-w-[1080px] px-4 pb-24 pt-6 sm:px-6">
      <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0a2668_0%,#1446b8_55%,#5b2bb5_100%)] p-5 text-white shadow-[0_30px_60px_-30px_rgba(10,38,104,.8)] sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-red/30 blur-3xl" aria-hidden="true" />

        <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10">
          <div>
            <span className="inline-block -rotate-3 rounded-md bg-red px-3 py-1 text-[13px] font-extrabold uppercase tracking-wide shadow-lg">
              Prvi radio u Negotinu!
            </span>
            <h1 className="mt-3 font-body text-[clamp(38px,7vw,68px)] font-extrabold uppercase leading-[.95]">
              <span className="hero-title block text-white">Beep Beep</span>
              <span className="hero-title block text-red">Radio</span>
            </h1>
            <p className="mt-3 max-w-[38ch] text-[16px] leading-snug text-white/85 sm:text-lg">
              Muzika dok čekate dostavu. Izaberite stanicu i nastavite da naručujete, svira na svakoj stranici sajta.
            </p>
          </div>

          <NowPlaying />
        </div>
      </section>

      {radio.error && <p className="mt-4 rounded-xl bg-red/10 px-4 py-3 font-semibold text-red">{radio.error}</p>}

      <h2 className="mt-10 text-[28px] font-bold sm:text-[32px]">Stanice</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {RADIO.map((s, i) => {
          const on = radio.station?.key === s.key
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
                  {on && radio.playing ? (
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

      <p className="mt-4 text-[13px] text-mute">
        Moderna i Folk se puštaju preko YouTube-a: video se vidi gore, u kartici radija, i te stanice staju kad odete sa ove
        stranice. Strana i Ambijent sviraju i dok naručujete.
      </p>

      <p className="mt-10 text-center text-[13px] leading-relaxed text-mute">
        Beep Beep radio, Negotin. Muzika na stanicama Strana i Ambijent: Kevin MacLeod (
        <a href="https://incompetech.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          incompetech.com
        </a>
        ), licenca{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/deed.sr" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Creative Commons BY 4.0
        </a>
        . Sva prava na muziku pripadaju autorima.
      </p>
    </div>
  )
}

/** Kartica u baneru: šta je u etru, šta sledi i kontrole. */
function NowPlaying() {
  const radio = useRadio()
  const { station, playing, track, volume } = radio
  const own = station?.type === 'own'
  // naša stanica koja ne svira: kartica ipak pokazuje šta je trenutno u etru (osvežava se svakih 5 s)
  const [preview, setPreview] = useState(null)
  useEffect(() => {
    if (!own) return setPreview(null)
    const update = () => setPreview(onAir(station.key))
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [own, station])
  const item = track ?? preview?.item
  const next = own ? (track ? track.next : preview?.next) : null
  const song = item?.kind === 'song'

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5" aria-live="polite">
      <div className="flex items-center gap-4">
        {/* slika je uvek Beep Beep ptica, za svaku stanicu */}
        <div className="relative grid aspect-square w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-white sm:w-32">
          <img src={ptica} alt="" className="h-full w-full object-contain p-1.5" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-white/80">
            <span className={`inline-flex items-center gap-1 rounded bg-red px-1.5 py-0.5 text-white ${playing ? '' : 'opacity-80'}`}>
              <span className={`h-1.5 w-1.5 rounded-full bg-white ${playing ? 'animate-pulse' : ''}`} /> Uživo
            </span>
            {!station ? 'Izaberite stanicu' : playing ? 'Trenutno svira' : 'Sada u etru'}
          </p>
          <p className="mt-1 line-clamp-2 text-[17px] font-bold leading-snug sm:text-xl">
            {song ? item.title : station ? `Beep Beep ${station.label}` : 'Beep Beep radio'}
          </p>
          <p className="truncate text-[13px] text-white/75">
            {song ? item.artist : item?.kind === 'jingle' ? 'Beep Beep dostava, špica' : station ? station.desc : 'Prvi radio u Negotinu'}
          </p>
          {song && item.credit && <p className="mt-0.5 line-clamp-2 text-[11px] text-white/60">{item.credit}</p>}
        </div>
      </div>
      {next && (
        <p className="mt-3 truncate text-[13px] text-white/70">
          Sledeće: {next.kind === 'song' ? `${next.title}${next.artist ? `, ${next.artist}` : ''}` : 'Beep Beep špica'}
        </p>
      )}
      {own && !songCount(station.key) && <p className="mt-3 text-[13px] text-white/70">Pesme za ovu stanicu stižu uskoro, do tada ide špica.</p>}

      {/* YouTube video (Moderna i Folk): po pravilima YouTube-a mora da se vidi dok svira, najmanje 200 x 200 */}
      <div className={station?.type === 'youtube' ? 'mt-4 flex justify-center sm:justify-start' : 'h-0 overflow-hidden'} aria-hidden={station?.type !== 'youtube'}>
        <div ref={radio.ytSlot} className="h-[200px] w-[200px] overflow-hidden rounded-xl bg-black" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={station ? radio.toggle : () => radio.play(RADIO[0])}
          aria-label={playing ? 'Pauza' : 'Pusti radio'}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-red text-white shadow-[0_12px_24px_-10px_rgba(227,19,28,.9)] transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className={`h-7 w-7 ${playing ? '' : 'translate-x-0.5'}`} fill="currentColor" aria-hidden="true">
            {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
        {playing && <Bars className="h-5 text-white" />}
        <label className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-[200px]">
          <span className="sr-only">Jačina zvuka</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white/80" fill="currentColor" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
          </svg>
          <input type="range" min="0" max="100" value={volume} onChange={(e) => radio.setVolume(Number(e.target.value))} className="w-full accent-[#e3131c]" />
        </label>
      </div>
    </div>
  )
}
