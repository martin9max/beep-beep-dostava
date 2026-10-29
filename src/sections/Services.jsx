import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import Photo from '../components/Photo'
import Button from '../components/Button'
import { EXTRA_STOP, PHONE, PREMIUM, SERVICES } from '../data'

const whatsapp = `https://wa.me/381${PHONE.replace(/\s/g, '').replace(/^0/, '')}`
import { Link } from '../lib/router'

export default function Services() {
  return (
    <section id="usluge" className="border-y border-line bg-white py-[72px] md:py-[110px]">
      <div className="mx-auto max-w-[1120px] px-6">
        <SectionTitle>Usluge</SectionTitle>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.key} delay={(i % 3) * 0.12} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded border border-line bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-20px_rgba(13,47,128,.45)]">
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

        {/* premium usluga: izdvojena crvena kartica ispod usluga */}
        <Reveal className="mt-10">
          <article className="relative grid gap-8 overflow-hidden rounded-2xl bg-red p-7 text-white shadow-[0_30px_60px_-30px_rgba(227,19,28,.75)] sm:p-10 md:grid-cols-[1.1fr_1fr] md:items-center">
            <div>
              <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[.18em] text-red">
                <span aria-hidden="true">★</span> {PREMIUM.badge}
              </span>
              <h3 className="text-[clamp(30px,4vw,44px)] font-bold text-white">{PREMIUM.title}</h3>
              <p className="mt-3 max-w-[46ch] text-lg text-white/90">{PREMIUM.text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button as="a" href={whatsapp} target="_blank" rel="noopener" variant="light" className="px-6 py-3.5 text-[15px]">
                  Piši na WhatsApp
                </Button>
              </div>
              {/* napomena o više adresa u jednoj vožnji */}
              <p className="mt-6 flex items-start gap-2 rounded-lg bg-white/15 px-3 py-2.5 text-sm font-semibold">
                <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 5v3.5M8 11h.01" />
                </svg>
                <span>
                  {EXTRA_STOP.hint} {EXTRA_STOP.note}
                </span>
              </p>
            </div>

            {/* kako ide: od poruke iz inostranstva do vrata u Srbiji */}
            <ol className="grid gap-3">
              {PREMIUM.steps.map((step, n) => (
                <li key={step} className="flex items-center gap-4 rounded-xl bg-white/10 p-4 ring-1 ring-white/20">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-serif text-lg font-bold text-red">{n + 1}</span>
                  <span className="text-lg font-semibold">{step}</span>
                </li>
              ))}
            </ol>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
