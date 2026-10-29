import { BUSINESS, NAV, PHONE, SERVICES } from '../data'
import logo from '../assets/logo.png'
import { Link, SectionLink, useRoute } from '../lib/router'

const tel = `tel:${PHONE.replace(/\s/g, '')}`
const whatsapp = `https://wa.me/381${PHONE.replace(/\s/g, '').replace(/^0/, '')}`

export default function Footer() {
  // na podstranicama linkovi ka delovima početne idu preko /
  const home = useRoute().path === '/' ? '' : '/'
  return (
    <footer className="relative overflow-hidden bg-navy text-white/90">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-6 pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <SectionLink hash="#pocetna" className="inline-flex items-center gap-2.5 font-serif text-[22px] font-bold text-white">
            <img src={logo} alt="" width="44" height="44" className="h-11 w-11" />
            <span>
              <span className="hero-title font-body uppercase text-white">
                Beep Beep <span className="text-red">Dostava</span>
              </span>
            </span>
          </SectionLink>
          <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed">
            Prva i prava dostava u Negotinu i okolini. Od 5. decembra 2020. donosimo hranu, lekove, cveće i sve ostalo do
            vaših vrata, brzo i sa osmehom.
          </p>
          <a href={tel} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold text-red transition hover:bg-white/90">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
            </svg>
            {PHONE}
          </a>
        </div>

        <FooterList title="Naše usluge">
          {SERVICES.map((service) => (
            <li key={service.key}>
              <Link href={`/naruci/${service.key}`} className="footer-link">
                {service.title}
              </Link>
            </li>
          ))}
        </FooterList>

        <FooterList title="Stranica">
          {NAV.map((link) => (
            <li key={link.href}>
              <SectionLink hash={link.href} className="footer-link">
                {link.label}
              </SectionLink>
            </li>
          ))}
        </FooterList>

        <FooterList title="Kontakt">
          <li>
            <a href={tel} className="footer-link font-semibold text-white">
              Pozovite: {PHONE}
            </a>
          </li>
          <li>
            <a href={whatsapp} target="_blank" rel="noopener" className="footer-link">
              Pišite na WhatsApp
            </a>
          </li>
          <li>Negotin, okolna sela i šire</li>
          {BUSINESS.hours && <li>{BUSINESS.hours}</li>}
        </FooterList>
      </div>

      {/* veliki natpis preko cele širine */}
      <p
        aria-hidden="true"
        className="pointer-events-none select-none whitespace-nowrap text-center font-body text-[17vw] font-extrabold uppercase leading-[.8] tracking-tighter text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/.3)] lg:text-[190px]"
      >
        Beep Beep
      </p>

      <div className="relative border-t border-white/25">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-3 px-6 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Beep Beep Dostava Negotin{BUSINESS.legal && ` · ${BUSINESS.legal}`}
          </p>
          <a href={home ? '#' : '#pocetna'} className="footer-link inline-flex items-center gap-2 font-semibold">
            Nazad na vrh
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 13V3M4 7l4-4 4 4" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}

function FooterList({ title, children }) {
  return (
    <div>
      <h3 className="mb-4 font-body text-xs font-bold uppercase tracking-[.2em] text-white/75">{title}</h3>
      <ul className="grid gap-2.5 text-sm">{children}</ul>
    </div>
  )
}
