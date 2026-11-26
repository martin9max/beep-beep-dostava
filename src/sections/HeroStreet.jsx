import { motion, useTransform } from 'framer-motion'
import shops from '../assets/scene/shops.svg'
import city from '../assets/scene/city.svg'

// Pozadina početnog ekrana: ulica po kojoj vozi trokolica. Odozgo nadole: nebo sa oblacima, grad u
// daljini, niz radnji (picerija, apoteka, cvećara, torte, market, Beep Beep dostava), trotoar i put.
// Radnje i grad su nacrtani u src/assets/scene (prave ih scripts/hero-ulica.py) i ponavljaju se vodoravno.
// Na skrol se slojevi pomeraju različitom brzinom (bliže brže), pa ulica dobija dubinu.

const CLOUDS = [
  // [gore % (računar), gore % (telefon, ispod dugmadi), širina px, trajanje prelaska s, kašnjenje s, providnost]
  [8, 38, 220, 95, -20, 0.9],
  [16, 46, 150, 70, -55, 0.7],
  [4, 34, 120, 120, -80, 0.6],
]

export default function HeroStreet({ progress, compact }) {
  // koliko piksela se slojevi pomere ulevo dok se skroluje kroz početni ekran
  const cityX = useTransform(progress, (v) => `${-v * 90}px`)
  const shopsX = useTransform(progress, (v) => `${-v * 320}px`)
  const roadX = useTransform(progress, (v) => `${-v * 700}px`)

  // visine traka (od dna kadra): put, trotoar, radnje
  const road = compact ? 11 : 13
  const walk = compact ? 5 : 6
  const shopsH = compact ? 34 : 37

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* nebo */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0d2f80_0%,#1446b8_38%,#3f7be6_70%,#8fb6f5_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(60%_80%_at_70%_100%,rgba(255,236,190,.35),transparent_70%)]" />

      {/* oblaci polako plove s desna na levo (na telefonu ispod teksta, da ga ne prekrivaju) */}
      {CLOUDS.map(([top, topCompact, width, duration, delay, opacity]) => (
        <Cloud
          key={top}
          style={{ top: `${compact ? topCompact : top}%`, width: compact ? width * 0.6 : width, opacity, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        />
      ))}

      {/* grad u daljini */}
      <motion.div
        className="absolute inset-x-0 opacity-[.16]"
        style={{
          bottom: `${road + walk + shopsH * 0.55}%`,
          height: `${shopsH * 0.55}%`,
          backgroundImage: `url(${city})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPositionX: cityX,
        }}
      />

      {/* radnje */}
      <motion.div
        className="absolute inset-x-0 drop-shadow-[0_-6px_18px_rgba(4,16,52,.25)]"
        style={{
          bottom: `${road + walk}%`,
          height: `${shopsH}%`,
          backgroundImage: `url(${shops})`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPositionX: shopsX,
        }}
      />

      {/* trotoar sa pločama i ivičnjakom */}
      <motion.div
        className="absolute inset-x-0 bg-[#c9d4ea] [background-image:linear-gradient(90deg,rgba(10,38,104,.12)_2px,transparent_2px)] [background-size:90px_100%]"
        style={{ bottom: `${road}%`, height: `${walk}%`, backgroundPositionX: shopsX }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#e9eef8]" />
        <div className="absolute inset-x-0 bottom-0 h-[6%] bg-[#0a2668]/30" />
      </motion.div>

      {/* put sa isprekidanom linijom */}
      <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,#2c3758_0%,#232d4a_100%)]" style={{ height: `${road}%` }}>
        <motion.div
          className="absolute inset-x-0 top-[48%] h-[7px] [background-image:linear-gradient(90deg,#fff_0_60%,transparent_60%_100%)] [background-size:120px_100%] opacity-90"
          style={{ backgroundPositionX: roadX }}
        />
        <div className="absolute inset-x-0 top-0 h-[10%] bg-black/25" />
      </div>

      {/* tamnije gore levo, da beli naslov ostane čitljiv preko zgrada */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,38,104,.55)_0%,rgba(10,38,104,0)_45%)] lg:bg-[radial-gradient(75%_90%_at_0%_0%,rgba(10,38,104,.85)_0%,rgba(10,38,104,.55)_40%,rgba(10,38,104,0)_70%)]" />
    </div>
  )
}

function Cloud({ style }) {
  return (
    <svg viewBox="0 0 220 90" className="hero-cloud absolute" style={style}>
      <path
        d="M40 80 Q10 80 12 60 Q14 42 36 44 Q38 18 66 18 Q86 6 106 22 Q126 4 152 22 Q182 20 184 46 Q210 46 208 64 Q206 80 182 80 Z"
        fill="#fff"
      />
    </svg>
  )
}
