import { BUSINESS, NAV, PHONE, SERVICES } from '../data'
import logo from '../assets/logo.png'
import { Link, useRoute } from '../lib/router'

const tel = `tel:${PHONE.replace(/\s/g, '')}`

export default function Footer() {
  // na podstranicama linkovi ka delovima početne idu preko /
  const home = useRoute().path === '/' ? '' : '/'
  return (
    <footer className="relative overflow-hidden bg-ink text-white/90">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-6 pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <a href={`${home}#pocetna`} className="inline-flex items-center gap-2.5 font-serif text-[22px] font-bold text-white">
            <img src={logo} alt="" width="44" height="44" className="h-11 w-11" />
            <span>
              Beep Beep <span className="hero-red">Dostava</span>
            </span>
          </a>
          <p className="mt-4 max-w-[30ch] text-sm leading-relaxed">
            Brži od kojota, sporiji samo od vaše gladi. Od 2020. godine vozimo po Negotinu, selima i šire.
          </p>
        </div>

        <FooterList title="Stranica">
          {NAV.map((link) => (
            <li key={link.href}>
              <a href={home + link.href} className="footer-link">
                {link.label}
              </a>
            </li>
          ))}
        </FooterList>

        <FooterList title="Dostavljamo">
          {SERVICES.map((service) => (
            <li key={service.key}>
              <Link href={`/naruci/${service.key}`} className="footer-link">
                {service.title}
              </Link>
            </li>
          ))}
        </FooterList>

        <FooterList title="Kontakt">
          <li>
            <a href={tel} className="text-lg font-bold text-white transition-colors hover:text-white/75">
              {PHONE}
            </a>
          </li>
          <li>Negotin, okolna sela i šire</li>
          <li>Plaćanje gotovinom</li>
          {BUSINESS.address && <li>{BUSINESS.address}</li>}
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
