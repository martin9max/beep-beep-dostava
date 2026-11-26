import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useScroll } from 'framer-motion'
import Button from '../components/Button'
import Partners from './Partners'
import { Link } from '../lib/router'
import arriveSound from '../assets/sounds/stigao.mp3'

// Fotografija ulice u pozadini (trokolica vozi po putu sa slike)
import HERO_BG from '../assets/photos/hero-bg.webp'

// three.js se učitava odvojeno, tekst se prikazuje odmah
const HeroScene = lazy(() => import('../three/HeroScene'))

/**
 * Ako 3D scena pukne (npr. telefon nema WebGL ili ga je ugasio), pukne samo ona, a ne ceo sajt.
 * Posle greške pokušava još jednom (posle 1,5 s), jer je greška često prolazna (grafika zauzeta pri učitavanju).
 */
class SceneGuard extends Component {
  state = { failed: false, tries: 0 }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    console.warn('3D trokolica nije pokrenuta:', err?.message)
    if (this.state.tries < 1) this.timer = setTimeout(() => this.setState((s) => ({ failed: false, tries: s.tries + 1 })), 1500)
  }
  componentWillUnmount() {
    clearTimeout(this.timer)
  }
  render() {
    return this.state.failed ? null : (
      <div key={this.state.tries} className="h-full w-full">
        {this.props.children}
      </div>
    )
  }
}

/** Da li pregledač može da crta 3D (WebGL). Bez toga se scena ni ne preuzima. */
const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

const LINES = [
  ['Beep Beep dostava', 'text-white'],
  ['do vaših vrata', 'text-red'],
]

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // 3D scena postoji samo u browseru (ne pri prerenderu za pretraživače)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(hasWebGL()), [])
  // kad se odskroluje ispod početnog ekrana, 3D scena se pauzira (inače koči ostale sekcije)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  // telefon i tablet: trokolica dobija svoj prostor između teksta i kartice, da ne ide iza teksta
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(max-width: 1023px)')
    const update = () => setCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  // zvuk kad trokolica stigne. Pregledači ne puštaju zvuk dok posetilac ne klikne, dodirne ili pritisne
  // taster; ako je zvuk tada blokiran, pušta se na prvi potez koji ga dozvoli, dok je početni ekran na ekranu.
  const arriveAudio = useRef(null)
  const visibleRef = useRef(true)
  visibleRef.current = visible
  useEffect(() => {
    arriveAudio.current = new Audio(arriveSound)
    arriveAudio.current.preload = 'auto'
    arriveAudio.current.volume = 0.6
  }, [])
  const playArrive = () => {
    const audio = arriveAudio.current
    if (!audio) return
    audio.play().catch(() => {
      // na telefonu dozvolu za zvuk daje tek kraj dodira (kucnuće), ne početak ni prevlačenje prstom,
      // pa se pokušava na svaki takav potez dok ne uspe (ili dok se ne odskroluje sa početnog ekrana)
      const events = ['pointerup', 'touchend', 'click', 'keydown']
      const stop = () => events.forEach((e) => removeEventListener(e, retry, true))
      const retry = () => {
        if (!visibleRef.current) return stop()
        audio.play().then(stop, () => {})
      }
      events.forEach((e) => addEventListener(e, retry, true))
    })
  }
  const scene = mounted && (
    <SceneGuard>
      <Suspense fallback={null}>
        {/* na fotografiji ulice trokolica je manja i niže, da stoji u traci na putu kao pravo vozilo */}
        <HeroScene progress={scrollYProgress} active={visible} compact={compact} size={compact ? 0.85 : 0.72} lower={0.04} onArrive={playArrive} />
      </Suspense>
    </SceneGuard>
  )

  return (
    <section ref={ref} id="pocetna" className="relative h-[260vh]">
      {/* visina = ekran + pola trake partnera: pri učitavanju se logoi vide "napola preseceni",
          a početni ekran dobija skoro ceo prostor */}
      <div className="hero-pin sticky top-0 flex flex-col gap-3 px-3 pb-3 pt-[84px] sm:px-5 sm:pt-[88px]">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] bg-ink text-white">
          {/* pozadina */}
          <>
              {/* kadar: dole je uvek put (tu vozi trokolica); na računaru se vidi pojas sa radnjama i putem,
                  na telefonu cela visina slike (nebo iza teksta), isečak oko picerije i apoteke */}
              <img
                src={HERO_BG}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[42%_100%] brightness-[1.12] saturate-[1.08] lg:object-[50%_74%]"
              />
              {/* blago zatamnjenje samo iza teksta (gore levo), ostatak slike ostaje svetao */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,36,72,.62)_0%,rgba(8,36,72,.3)_30%,rgba(8,36,72,0)_52%)] lg:bg-[radial-gradient(70%_80%_at_0%_0%,rgba(8,36,72,.72)_0%,rgba(8,36,72,.4)_40%,rgba(8,36,72,0)_68%)]" />
          </>


          {/* 3D trokolica preko celog kadra (računar) */}
          {!compact && (
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {scene}
            </div>
          )}

          {/* tekst */}
          <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between gap-3 p-5 sm:gap-6 sm:p-10 lg:px-12 lg:pb-12 lg:pt-9">
            <div>
              <h1 className="font-body text-[clamp(30px,min(4.6vw,8.2vh),72px)] font-extrabold uppercase leading-[.98] tracking-tight">
                {LINES.map(([line, color], i) => (
                  // dodatni prostor oko reda da obrub, nagnuta slova i senka ne budu odsečeni
                  <span key={line} className="-mx-[.12em] -mb-[.2em] block overflow-hidden px-[.12em] pb-[.2em] pt-[.04em]">
                    {/* CSS animacija (index.css): tekst je u HTML-u vidljiv i bez JavaScripta, za Google i brži prikaz */}
                    <span className={`hero-title hero-line-in block ${color}`} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                      {line}
                    </span>
                  </span>
                ))}
                <span className="sr-only"> u Negotinu i okolini</span>
              </h1>
              {/* dva reda: prvi krupno i podebljano, drugi običan; oba sa crnom ivicom i senkom (hero-sub u index.css) */}
              <p className="hero-sub hero-fade-in mt-3 leading-tight text-white sm:mt-5" style={{ animationDelay: '0.5s' }}>
                <span className="block text-[clamp(13px,4vw,17px)] font-extrabold sm:text-[22px] lg:text-[26px]">Prva i prava dostava u Negotinu i okolini.</span>
                <span className="mt-1.5 block text-[clamp(13px,3.8vw,15px)] font-semibold text-white/95 sm:mt-2 sm:text-lg lg:text-xl">
                  Dostava hrane, pića, namirnica, lekova, poklona i još mnogo toga.
                </span>
              </p>
              <div className="hero-fade-in pointer-events-auto mt-4 flex gap-3 sm:mt-6" style={{ animationDelay: '0.65s' }}>
                <Button as={Link} href="/registracija" arrow className="flex-1 px-4 py-3 sm:min-w-[150px] sm:flex-none sm:px-6 sm:py-3.5">
                  Registracija
                </Button>
                <Button as="a" href="#usluge" variant="light" className="flex-1 px-4 py-3 sm:min-w-[150px] sm:flex-none sm:px-6 sm:py-3.5">
                  Naše usluge
                </Button>
              </div>
            </div>

            {/* telefon i tablet: prostor za trokolicu */}
            {compact && (
              <div className="relative -mx-5 min-h-0 flex-1 sm:-mx-10" aria-hidden="true">
                {scene}
              </div>
            )}
          </div>
        </div>
        <Partners />
      </div>
    </section>
  )
}
