import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Button from '../components/Button'
import Partners from './Partners'
import { EASE } from '../lib/order'
import { Link } from '../lib/router'

// Fotografija u pozadini: src/assets/photos/hero-bg.jpg. Obrišite fajl i vraća se stara plava pozadina.
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
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const hintOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
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
  const scene = mounted && (
    <Suspense fallback={null}>
      <HeroScene progress={scrollYProgress} active={visible} compact={compact} />
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
              {/* kadar: na računaru nebo gore levo (tekst) i trotoar dole desno (tricikl);
                  na telefonu uži isečak sa crkvom i trotoarom, slika se nikad ne razvlači (object-cover) */}
              <img
                src={HERO_BG}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[64%_60%] lg:object-[50%_48%]"
              />
              {/* zatamnjenje samo tamo gde je tekst (nebo), ostatak slike ostaje svetao */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,36,72,.78)_0%,rgba(8,36,72,.5)_38%,rgba(8,36,72,0)_62%,rgba(8,36,72,.35)_100%)] lg:bg-[radial-gradient(85%_95%_at_0%_0%,rgba(8,36,72,.8)_0%,rgba(8,36,72,.5)_45%,rgba(8,36,72,0)_75%),linear-gradient(0deg,rgba(8,36,72,.35)_0%,rgba(8,36,72,0)_30%)]" />
            </>
          ) : (
            <>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_72%_62%,rgba(255,255,255,.22),transparent_70%)]" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_70%_at_70%_60%,black,transparent)]"
                aria-hidden="true"
              />
            </>
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
              <motion.p className="mt-3 max-w-[46ch] text-[15px] leading-snug text-white/95 sm:mt-4 sm:text-lg sm:leading-relaxed" {...fadeUp(0.5)}>
                Prva i prava dostava u Negotinu i okolini. Hrana, lekovi, cveće i sve ostalo.
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

            <div className="flex items-end justify-end gap-6">
              <motion.div style={{ opacity: hintOpacity }} className={`hidden items-center gap-3 text-sm text-white/85 sm:flex ${HERO_BG ? 'lg:hidden' : ''}`}>
                <span>Skrolujte</span>
                <span className="h-[3px] w-24 overflow-hidden rounded bg-white/30">
                  <motion.span style={{ scaleX: bar }} className="block h-full origin-left bg-red" />
                </span>
              </motion.div>
            </div>
          </div>
        </div>
        <Partners />
      </div>
    </section>
  )
}
