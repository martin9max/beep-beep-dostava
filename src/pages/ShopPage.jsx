import { useEffect, useRef, useState } from 'react'
import { CATEGORIES, itemCategory, shopBySlug } from '../catalog'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { Link } from '../lib/router'
import Thumb, { hasImage, logoOf } from '../components/Thumb'
import MenuItem from '../components/MenuItem'
import NotFound from './NotFound'
import { usePageTitle } from './PageShell'

const sectionId = (i) => `meni-${i}`

/** /lokal/<slug>: digitalni meni lokala. */
export default function ShopPage({ slug, category }) {
  const shop = shopBySlug(slug)
  const cart = useCart()
  const { user } = useAuth()
  usePageTitle(shop ? `${shop.name}: meni` : 'Lokal nije pronađen')

  // deo menija koji se trenutno čita je istaknut na traci gore (kao na digitalnim menijima lokala)
  const [active, setActive] = useState(0)
  const pills = useRef([])
  useEffect(() => {
    if (!shop || shop.menu.length < 2) return
    const sections = shop.menu.map((_, i) => document.getElementById(sectionId(i)))
    const onScroll = () => {
      // poslednji deo čiji je vrh prešao ispod trake sa delovima menija
      let current = 0
      sections.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < 220) current = i
      })
      setActive(current)
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    return () => removeEventListener('scroll', onScroll)
  }, [shop])
  // istaknuto dugme se pomeri u vidno polje kad traka ne staje na ekran (telefon)
  useEffect(() => {
    // samo vodoravno, unutar trake (scrollIntoView bi pomerio i celu stranicu)
    const pill = pills.current[active]
    const bar = pill?.parentElement
    if (bar) bar.scrollTo({ left: pill.offsetLeft - bar.offsetLeft - (bar.clientWidth - pill.clientWidth) / 2, behavior: 'smooth' })
  }, [active])

  // sa ?k=pica stranica odmah skroluje do pica
  useEffect(() => {
    if (!shop || !category) return
    const i = shop.menu.findIndex((s) => s.cat === category || s.items.some((it) => itemCategory(s, it) === category))
    if (i > 0) setTimeout(() => scrollToSection(i), 50)
  }, [shop, category])

  if (!shop) return <NotFound />
  const food = shop.service === 'food'
  const categoryLabel = CATEGORIES[shop.service].find((c) => c.key === category)?.label
  const back = `/naruci/${shop.service}${category ? `?k=${category}` : ''}`
  const backLabel = categoryLabel ? `${categoryLabel}: svi lokali` : 'Svi lokali'

  return (
    <div className="pb-40">
      <div className="mx-auto max-w-[920px] px-5 pt-6 sm:px-6">
        <BackButton href={back} label={backLabel} />

        <header className="relative mt-4 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_60px_-45px_rgba(13,47,128,.6)]">
          {logoOf(shop) ? (
            <img src={logoOf(shop)} alt={`${shop.name}, logo`} decoding="async" className="aspect-[288/112] w-full object-cover sm:aspect-[288/100]" />
          ) : shop.stripe && (
            <div className="flex h-1.5" aria-hidden="true">
              {shop.stripe.map((color) => (
                <span key={color} className="flex-1" style={{ background: color }} />
              ))}
            </div>
          )}
          {!logoOf(shop) && hasImage(`lokali/${shop.slug}`) && (
            <Thumb src={`lokali/${shop.slug}`} emoji={shop.emoji} alt={shop.name} className="aspect-[16/7] sm:aspect-[16/5]" emojiClass="text-7xl" />
          )}
          {/* blaga šara od ikonica iza naslova */}
          {!logoOf(shop) && (
            <div className="pointer-events-none absolute -right-6 top-4 select-none text-[120px] leading-none opacity-[.07] sm:text-[170px]" aria-hidden="true">
              {shop.emoji}
            </div>
          )}
          <div className="relative p-5 sm:p-8">
            <h1 className="font-serif text-[clamp(36px,6vw,60px)] font-bold italic leading-none tracking-tight">{shop.name}</h1>
            {import.meta.env.DEV && !shop.realMenu && (
              <p className="mt-3 rounded-lg bg-[#fff3c4] px-3 py-2 text-sm text-[#7a5a00]">
                Razvoj: meni i cene su primer. Pravi meni upišite u <code>src/catalog.js</code>.
              </p>
            )}
          </div>

          {/* ponuda na prvi pogled: pločice za svaki deo menija (kao "Naša ponuda" na sajtovima lokala) */}
          {shop.menu.length > 2 && (
            <div className="relative grid grid-cols-2 gap-2 border-t border-line bg-paper/50 p-3 sm:grid-cols-4 sm:p-4">
              {shop.menu.map((section, i) => (
                <button
                  key={section.title}
                  type="button"
                  onClick={() => scrollToSection(i)}
                  className="group flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-red"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red/10 text-xl transition-transform group-hover:scale-110" aria-hidden="true">
                    {section.emoji ?? shop.emoji}
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[14px] font-bold text-deep group-hover:text-red">{section.title}</span>
                    <span className="block text-[12px] text-mute">
                      {section.items.length} {unit(section.items.length, food)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </header>
      </div>

      {/* traka koja ostaje gore: strelica nazad, ime lokala i delovi menija */}
      <nav aria-label="Delovi menija" className="sticky top-[calc(116px+env(safe-area-inset-top,0px))] z-10 mt-6 border-y border-line bg-paper">
        <div className="mx-auto flex max-w-[920px] items-center gap-3 px-5 py-2.5 sm:px-6">
          <Link
            href={back}
            aria-label={`Nazad: ${backLabel}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red text-white shadow-[0_8px_18px_-10px_rgba(227,19,28,.9)] transition hover:bg-red-dark"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="hidden shrink-0 font-serif text-lg font-bold sm:block">{shop.name}</span>
          {shop.menu.length > 1 && (
            <div className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none]">
              {shop.menu.map((section, i) => (
                <button
                  key={section.title}
                  ref={(el) => (pills.current[i] = el)}
                  type="button"
                  onClick={() => scrollToSection(i)}
                  aria-current={i === active ? 'true' : undefined}
                  className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                    i === active ? 'border-red bg-red text-white' : 'border-line bg-white text-deep hover:border-red hover:text-red'
                  }`}
                >
                  {section.emoji && <span aria-hidden="true" className="mr-1.5">{section.emoji}</span>}
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto mt-6 grid max-w-[920px] gap-6 px-5 sm:px-6">
        {user === null && (
          <p className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/20 bg-ink/5 px-5 py-4 text-[15px] text-deep">
            <span>Da biste dodavali u korpu i naručili, prijavite se ili napravite nalog.</span>
            <Link href={`/prijava?next=${encodeURIComponent(`/lokal/${shop.slug}`)}`} className="btn btn-primary px-4 py-2.5 text-sm">
              Prijavi se
            </Link>
          </p>
        )}
        {shop.menu.map((section, i) => (
          <section key={section.title} id={sectionId(i)} className="scroll-mt-[190px] rounded-2xl border border-line bg-white px-5 pt-5 sm:px-7 sm:pt-6">
            <div className="flex items-center gap-3">
              {section.emoji && (
                <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red/10 text-2xl">
                  {section.emoji}
                </span>
              )}
              <div>
                <h2 className="font-serif text-[24px] font-bold uppercase tracking-[.04em] sm:text-[28px]">{section.title}</h2>
                {section.note && <p className="mt-0.5 text-[12px] font-bold uppercase tracking-[.1em] text-mute">{section.note}</p>}
              </div>
            </div>
            <ul className="mt-1">
              {section.items.map((item) => (
                <MenuItem key={item.id} shop={shop} item={item} />
              ))}
            </ul>
            {section.extras && (
              <p className="-mx-5 border-t border-line bg-paper/60 px-5 py-3.5 text-sm text-mute sm:-mx-7 sm:px-7">
                <span className="font-bold text-deep">Dodaci po želji:</span> {section.extras.join(', ')}.
                {shop.request && (shop.request.checkoutOnly ? ' Upišite ih u napomenu u korpi, pre slanja porudžbine.' : ' Upišite ih u napomenu na dnu menija.')}
              </p>
            )}
          </section>
        ))}

        {shop.request && !shop.request.checkoutOnly && (
          <section className="rounded-2xl border-2 border-dashed border-ink/40 bg-white p-5 sm:p-7">
            <label htmlFor="zahtev" className="block text-[22px] font-bold font-serif">
              {shop.request.label}
            </label>
            <p className="mt-1 text-sm text-mute">Napišite slobodno, kurir će pročitati pre nego što krene.</p>
            <textarea
              id="zahtev"
              rows={4}
              maxLength={600}
              value={cart.requests[shop.slug] ?? ''}
              onChange={(e) => cart.setRequest(shop.slug, e.target.value)}
              placeholder={shop.request.placeholder}
              className="mt-3 block w-full rounded-lg border border-line bg-paper/50 px-3.5 py-3 text-[16px] text-deep outline-none placeholder:text-mute/60 focus:border-ink focus:ring-4 focus:ring-ink/15"
            />
          </section>
        )}

        <p className="text-center text-sm text-mute">
          Hoćete još nešto iz drugog lokala?{' '}
          <Link href="/naruci" className="font-semibold text-red underline underline-offset-4">
            Dodajte i to
          </Link>
          , stiže u istoj vožnji.
        </p>
      </div>
    </div>
  )
}

// "1 jelo, 5 jela" za hranu, "1 stavka, 3 stavke, 5 stavki" za ostalo
const one = (n) => n % 10 === 1 && n % 100 !== 11
const few = (n) => [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)
const unit = (n, food) => (food ? (one(n) ? 'jelo' : 'jela') : one(n) ? 'stavka' : few(n) ? 'stavke' : 'stavki')

function BackButton({ href, label }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 rounded-full border border-line bg-white py-2 pl-2 pr-4 text-[15px] font-semibold text-deep transition hover:border-red hover:text-red">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-red text-white">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      </span>
      {label}
    </Link>
  )
}

function ArrowLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 8H3M7 4 3 8l4 4" />
    </svg>
  )
}

function scrollToSection(i) {
  const el = document.getElementById(sectionId(i))
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth' })
}
