import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, useScroll } from 'framer-motion'
import Button from '../components/Button'
import Partners from './Partners'
import HeroStreet from './HeroStreet'
import { EASE } from '../lib/order'
import { Link } from '../lib/router'
import arriveSound from '../assets/sounds/stigao.wav'

// Fotografija u pozadini: src/assets/photos/hero-bg.jpg (ako ima licencu sa potpisom, dodajte i potpis autora).
// Dok je nema, pozadina je nacrtana ulica sa radnjama i putem (HeroStreet).
const HERO_BG = Object.values(import.meta.glob('../assets/photos/hero-bg.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }))[0]

// three.js se učitava odvojeno, tekst se prikazuje odmah
const HeroScene = lazy(() => import('../three/HeroScene'))

const LINES = [
  ['Beep Beep dostava', 'text-white'],
  ['do vaših vrata', 'text-red'],
]

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: EASE },
})

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // 3D scena postoji samo u browseru (ne pri prerenderu za pretraživače)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
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
    <Suspense fallback={null}>
      {/* na fotografiji ulice trokolica je manja i niže, da stoji u traci na putu kao pravo vozilo */}
      <HeroScene progress={scrollYProgress} active={visible} compact={compact} size={HERO_BG ? (compact ? 0.85 : 0.72) : 1} lower={HERO_BG ? 0.04 : 0} onArrive={playArrive} />
    </Suspense>
  )

  return (
    <section ref={ref} id="pocetna" className="relative h-[260vh]">
      {/* visina = ekran + pola trake partnera: pri učitavanju se logoi vide "napola preseceni",
          a početni ekran dobija skoro ceo prostor */}
      <div className="sticky top-0 flex h-[calc(100svh+48px)] flex-col gap-3 px-3 pb-3 pt-[84px] sm:h-[calc(100svh+60px)] sm:px-5 sm:pt-[88px] lg:h-[calc(100svh+68px)]">
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] bg-ink text-white">
          {/* pozadina */}
          {HERO_BG ? (
            <>
              {/* kadar: dole je uvek put (tu vozi trokolica); na računaru se vidi pojas sa radnjama i putem,
                  na telefonu cela visina slike (nebo iza teksta), isečak oko picerije i apoteke */}
              <img
                src={HERO_BG}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[42%_100%] lg:object-[50%_74%]"
              />
              {/* zatamnjenje samo tamo gde je tekst (nebo), ostatak slike ostaje svetao */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,36,72,.78)_0%,rgba(8,36,72,.5)_38%,rgba(8,36,72,0)_62%,rgba(8,36,72,.35)_100%)] lg:bg-[radial-gradient(85%_95%_at_0%_0%,rgba(8,36,72,.8)_0%,rgba(8,36,72,.5)_45%,rgba(8,36,72,0)_75%),linear-gradient(0deg,rgba(8,36,72,.35)_0%,rgba(8,36,72,0)_30%)]" />
            </>
          ) : (
            // bez fotografije: nacrtana ulica sa radnjama, trotoarom i putem po kojem vozi trokolica
            <HeroStreet progress={scrollYProgress} compact={compact} />
          )}


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
                    <motion.span
                      className={`hero-title block ${color}`}
                      initial={{ y: '105%' }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: EASE }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>
              {/* dva reda: prvi krupno i podebljano, drugi običan */}
              <motion.p className="mt-3 leading-tight text-white [text-shadow:0_2px_10px_rgba(4,16,52,.55)] sm:mt-5" {...fadeUp(0.5)}>
                <span className="block text-[clamp(13px,4vw,17px)] font-extrabold sm:text-[22px] lg:text-[26px]">Prva i prava dostava u Negotinu i okolini.</span>
                <span className="mt-1.5 block text-[clamp(13px,3.8vw,15px)] font-semibold text-white/95 sm:mt-2 sm:text-lg lg:text-xl">
                  Dostava hrane, pića, namirnica, lekova, poklona i još mnogo toga.
                </span>
              </motion.p>
              <motion.div className="pointer-events-auto mt-4 flex gap-3 sm:mt-6" {...fadeUp(0.65)}>
                <Button as={Link} href="/registracija" arrow className="flex-1 px-4 py-3 sm:min-w-[150px] sm:flex-none sm:px-6 sm:py-3.5">
                  Registracija
                </Button>
                <Button as="a" href="#usluge" variant="light" className="flex-1 px-4 py-3 sm:min-w-[150px] sm:flex-none sm:px-6 sm:py-3.5">
                  Naše usluge
                </Button>
              </motion.div>
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
