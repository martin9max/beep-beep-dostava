import Reveal from '../components/Reveal'
import Button from '../components/Button'
import Phone from '../components/Phone'
import { BUSINESS, PHONE } from '../data'

const digits = PHONE.replace(/\s/g, '')
const tel = `tel:${digits}`
// 064... -> 38164... za WhatsApp
const whatsapp = `https://wa.me/381${digits.replace(/^0/, '')}`

const INFO = [
  ['Gde dostavljamo', 'Negotin, okolna sela i šire'],
  ['Radno vreme', BUSINESS.hours],
].filter(([, value]) => value)

export default function Contact() {
  return (
    <section id="kontakt" className="px-3 py-[72px] sm:px-5 md:py-[110px]">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[28px] bg-ink text-white">
        {/* pozadina kao na početnom ekranu */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_75%_50%,rgba(255,255,255,.2),transparent_70%)]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(60%_70%_at_75%_50%,black,transparent)]"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-12 px-6 py-14 sm:px-10 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:px-16 lg:py-20">
          <div>
            <Reveal as="p" className="mb-4 inline-block rounded-full bg-white px-3 py-1 text-sm font-bold uppercase tracking-[.2em] text-red">
              Kontakt
            </Reveal>
            <Reveal as="h2" delay={0.05} className="text-[clamp(38px,5.6vw,68px)] font-bold tracking-tight">
              Radije biste da pozovete?
            </Reveal>
            <Reveal as="p" delay={0.1} className="mt-4 max-w-[38ch] text-lg text-white/90">
              Javite nam šta vam treba i adresu, a mi vam dostavljamo u najkraćem roku.
            </Reveal>

            <Reveal delay={0.15}>
              <a
                href={tel}
                className="group mt-8 inline-flex items-baseline gap-3 font-serif text-[clamp(34px,4.6vw,56px)] font-bold leading-none"
              >
                <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_3px] bg-left-bottom bg-no-repeat pb-1 transition-[background-size] duration-500 group-hover:bg-[length:100%_3px]">
                  {PHONE}
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.2} className="mt-8 flex gap-3">
              <Button as="a" href={tel} className="flex-1 px-4 py-3.5 sm:min-w-[150px] sm:flex-none sm:px-6">
                <PhoneIcon />
                Pozovi
              </Button>
              <Button as="a" href={whatsapp} target="_blank" rel="noopener" variant="light" className="flex-1 px-4 py-3.5 sm:min-w-[150px] sm:flex-none sm:px-6">
                Piši na WhatsApp
              </Button>
            </Reveal>

            <Reveal delay={0.25}>
              <dl className="mt-10 grid gap-x-8 gap-y-5 border-t border-white/30 pt-8 sm:grid-cols-2">
                {INFO.map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-white/80">{label}</dt>
                    <dd className="font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="flex justify-center">
            <Phone href={tel} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
    </svg>
  )
}
