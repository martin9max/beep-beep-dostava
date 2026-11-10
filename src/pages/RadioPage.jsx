import { useEffect, useState } from 'react'
import { hasSongs, onAir, useRadio } from '../lib/radio'
import { Bars } from '../components/Radio'
import { usePageTitle } from './PageShell'
import ptica from '../assets/beep-beep-ptica.webp'

/** /radio: Beep Beep radio, prvi radio u Negotinu. Jedna stanica uživo: pesme i najave po satu. */
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
              Muzika dok čekate dostavu. Pustite radio i nastavite da naručujete, svira na svakoj stranici sajta.
            </p>
          </div>

          <NowPlaying />
        </div>
      </section>

      {radio.error && <p className="mt-4 rounded-xl bg-red/10 px-4 py-3 font-semibold text-red">{radio.error}</p>}

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          ['📻', 'Uživo, za sve isto', 'Kao pravi radio: svi u Negotinu u istom trenutku slušaju istu pesmu.'],
          ['🎶', 'Muzika i najave', 'Pesme se smenjuju sa kratkim najavama Beep Beep dostave i naših partnera.'],
          ['🛵', 'Svira dok naručujete', 'Pustite radio, pa slobodno idite na meni i korpu. Muzika ne staje.'],
        ].map(([emoji, title, text]) => (
          <div key={title} className="rounded-2xl border border-line bg-white p-5">
            <span className="text-3xl" aria-hidden="true">
              {emoji}
            </span>
            <h2 className="mt-2 text-xl font-bold">{title}</h2>
            <p className="mt-1 text-[15px] text-deep/75">{text}</p>
          </div>
        ))}
      </section>

      {!hasSongs && (
        <p className="mt-6 rounded-2xl border border-dashed border-line bg-white p-5 text-center text-deep/80">
          Muzički program stiže uskoro. Do tada slušate najave Beep Beep radija.
        </p>
      )}

      <p className="mt-10 text-center text-[13px] text-mute">Beep Beep radio, Negotin. Muzika se pušta uz dozvolu autora.</p>
    </div>
  )
}

/** Kartica u baneru: šta je u etru, šta sledi i kontrole. */
function NowPlaying() {
  const radio = useRadio()
  const { playing, track, volume } = radio
  // dok radio ne svira, kartica ipak pokazuje šta je trenutno u etru (osvežava se svakih 5 s)
  const [preview, setPreview] = useState(null)
  useEffect(() => {
    const update = () => setPreview(onAir())
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [])
  const item = playing && track ? track : preview?.item
  const next = playing && track ? track.next : preview?.next
  const song = item?.kind === 'song'

  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md sm:p-5" aria-live="polite">
      <div className="flex items-center gap-4">
        <div className="relative grid aspect-square w-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-white sm:w-32">
          <img src={ptica} alt="" className="h-full w-full object-contain p-1.5" />
        </div>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-white/80">
            <span className={`inline-flex items-center gap-1 rounded bg-red px-1.5 py-0.5 text-white ${playing ? '' : 'opacity-80'}`}>
              <span className={`h-1.5 w-1.5 rounded-full bg-white ${playing ? 'animate-pulse' : ''}`} /> Uživo
            </span>
            {playing ? 'Trenutno svira' : 'Sada u etru'}
          </p>
          <p className="mt-1 line-clamp-2 text-[17px] font-bold leading-snug sm:text-xl">{song ? item.title : 'Beep Beep radio'}</p>
          <p className="truncate text-[13px] text-white/75">{song ? item.artist : item ? 'Najava' : 'Prvi radio u Negotinu'}</p>
          {song && item.credit && <p className="mt-0.5 line-clamp-2 text-[11px] text-white/60">{item.credit}</p>}
        </div>
      </div>
      {next && (
        <p className="mt-3 truncate text-[13px] text-white/70">
          Sledeće: {next.kind === 'song' ? `${next.title}${next.artist ? `, ${next.artist}` : ''}` : 'najava Beep Beep radija'}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={radio.toggle}
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
