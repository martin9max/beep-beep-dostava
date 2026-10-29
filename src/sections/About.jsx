import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import ptica from '../assets/beep-beep-ptica.webp'
import { animate, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

const PARAGRAPHS = [
  'Krenuli smo 5. decembra 2020. godine, usred zime i usred pandemije, kada su nam svi govorili da Negotinu dostava ne treba. Danas niko ne pita da li treba. Pitaju samo koliko brzo stižemo.',
  'Naša tajna nije nikakva tajna: termo kutija. Pica stiže topla, sladoled stiže hladan, a torta stiže onakva kakvu ste je naručili. Ako vam je neko doneo mlaku pljeskavicu i rekao da je to normalno, slagao vas je.',
  'Vozimo po Negotinu, po selima i dalje, gde god vas put odvede. Vi samo pozovite. Ostalo je naš posao.',
]

// broj se "odbrojava" od nule kad sekcija uđe u ekran
const FACTS = [
  { value: '05.12.\n2020.', label: 'krenuli smo sa radom' },
  { count: 10000, suffix: '+', label: 'zadovoljnih klijenata' },
  { value: '5,0', label: 'ocena na Google-u' },
]

function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [inView, to])
  return (
    <span ref={ref}>
      {n.toLocaleString('sr-RS')}
      {suffix}
    </span>
  )
}

export default function About() {
  return (
    <section id="o-nama" className="py-[72px] md:py-[110px]">
      <div className="mx-auto max-w-[1120px] px-6">
        <SectionTitle>O nama</SectionTitle>
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div className="space-y-5 text-lg text-deep/80">
            {PARAGRAPHS.map((text, i) => (
              <Reveal key={i} as="p" delay={i * 0.12} className="max-w-[46ch]">
                {text}
              </Reveal>
            ))}
            <Reveal as="dl" delay={0.36} className="grid max-w-[46ch] grid-cols-3 gap-4 border-t border-line pt-6">
              {FACTS.map((fact) => (
                <div key={fact.label} className="flex flex-col-reverse">
                  <dt className="text-sm leading-snug text-mute">{fact.label}</dt>
                  <dd className="whitespace-pre-line font-serif text-[clamp(22px,2.6vw,30px)] font-bold leading-tight tabular-nums text-red">
                    {fact.count ? <CountUp to={fact.count} suffix={fact.suffix} /> : fact.value}
                  </dd>
                </div>
              ))}
            </Reveal>
          </div>
          {/* logo sa pticom "BEEP! BEEP!" (providna pozadina) na mestu fotografije: uskoči kad uđe u ekran, pa blago lebdi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            className="mx-auto w-full max-w-[520px]"
          >
            <div className="hero-float" style={{ animationDuration: '6s' }}>
              <motion.img
                src={ptica}
                alt="Beep Beep: ptica i natpis BEEP! BEEP!"
                width="900"
                height="814"
                loading="lazy"
                decoding="async"
                whileHover={{ rotate: -3, scale: 1.03 }}
                className="h-auto w-full drop-shadow-[0_24px_30px_rgba(10,38,104,.25)]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
