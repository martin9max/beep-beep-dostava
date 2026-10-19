import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import Photo from '../components/Photo'
import Button from '../components/Button'
import { EXTRA_STOP, SERVICES } from '../data'
import { Link } from '../lib/router'

export default function Services() {
  return (
    <section id="usluge" className="border-y border-line bg-white py-[72px] md:py-[110px]">
      <div className="mx-auto max-w-[1120px] px-6">
        <SectionTitle>Usluge</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.key} delay={(i % 3) * 0.12} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded border border-line bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-20px_rgba(22,115,196,.45)]">
                <Photo name={service.key} label={service.label} alt={service.title} zoom className="aspect-[4/3]" />
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-2 text-2xl font-bold">{service.title}</h3>
                  <p className="mb-6 text-deep/75">{service.text}</p>
                  <Button as={Link} href={`/naruci/${service.key}`} arrow className="mt-auto self-start px-6 py-3.5 text-[15px]">
                    Naruči
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* posebna usluga: izdvojena crvena traka ispod kartica */}
        <Reveal className="mt-10">
          <article className="relative grid gap-8 overflow-hidden rounded-2xl bg-red p-7 text-white shadow-[0_30px_60px_-30px_rgba(215,30,40,.75)] sm:p-10 md:grid-cols-[1fr_1.2fr] md:items-center">
            <div>
              <span className="mb-5 inline-block rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-red">
                Posebna usluga
              </span>
              <h3 className="text-[clamp(30px,4vw,44px)] font-bold text-white">{EXTRA_STOP.title}</h3>
              <p className="mt-3 max-w-[44ch] text-lg text-white/90">{EXTRA_STOP.text}</p>
              <p className="mt-5 inline-flex items-center gap-2 rounded bg-white/15 px-3 py-2 text-sm font-semibold">
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 5v3.5M8 11h.01" />
                </svg>
                {EXTRA_STOP.note}
              </p>
            </div>
            {/* ruta sa više zaustavljanja */}
            <svg viewBox="0 0 420 160" className="w-full" fill="none" aria-hidden="true">
              <path d="M20 120 C 90 20, 150 150, 210 80 S 330 20, 400 70" stroke="#fff" strokeOpacity=".55" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
              {[
                [20, 120, 'start'],
                [210, 80, '1'],
                [300, 40, '2'],
                [400, 70, 'cilj'],
              ].map(([x, y, label]) => (
                <g key={label}>
                  <circle cx={x} cy={y} r="13" fill="#fff" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize={label.length > 1 ? 8 : 12} fontWeight="800" fill="#d71e28">
                    {label.toUpperCase()}
                  </text>
                </g>
              ))}
            </svg>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
