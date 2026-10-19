import { useEffect } from 'react'
import { CATEGORIES, itemCategory, shopBySlug } from '../catalog'
import { useCart } from '../lib/cart'
import { Link } from '../lib/router'
import Thumb, { hasImage } from '../components/Thumb'
import MenuItem from '../components/MenuItem'
import NotFound from './NotFound'
import { usePageTitle } from './PageShell'

const sectionId = (i) => `meni-${i}`

/** /lokal/<slug>: digitalni meni lokala. */
export default function ShopPage({ slug, category }) {
  const shop = shopBySlug(slug)
  const cart = useCart()
  usePageTitle(shop ? `${shop.name}: meni` : 'Lokal nije pronađen')

  // sa ?k=pica stranica odmah skroluje do pica
  useEffect(() => {
    if (!shop || !category) return
    const i = shop.menu.findIndex((s) => s.cat === category || s.items.some((it) => itemCategory(s, it) === category))
    if (i > 0) setTimeout(() => scrollToSection(i), 50)
  }, [shop, category])

  if (!shop) return <NotFound />
  const categoryLabel = CATEGORIES[shop.service].find((c) => c.key === category)?.label
  const back = `/naruci/${shop.service}${category ? `?k=${category}` : ''}`
  const backLabel = categoryLabel ? `${categoryLabel}: svi lokali` : 'Svi lokali'

  return (
    <div className="pb-40">
      <div className="mx-auto max-w-[920px] px-5 pt-6 sm:px-6">
        <BackButton href={back} label={backLabel} />

        <header className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
          {hasImage(`lokali/${shop.slug}`) && (
            <Thumb src={`lokali/${shop.slug}`} emoji={shop.emoji} alt={shop.name} className="aspect-[16/7] sm:aspect-[16/5]" emojiClass="text-7xl" />
          )}
          <div className="p-5 sm:p-7">
            <h1 className="text-[clamp(32px,5vw,48px)] font-bold tracking-tight">{shop.name}</h1>
            <p className="mt-2 text-lg text-deep/75">{shop.about}</p>
            {import.meta.env.DEV && (
              <p className="mt-3 rounded-lg bg-[#fff3c4] px-3 py-2 text-sm text-[#7a5a00]">
                Razvoj: meni i cene su primer. Pravi meni upišite u <code>src/catalog.js</code>.
              </p>
            )}
          </div>
        </header>
      </div>

      {/* traka koja ostaje gore: strelica nazad, ime lokala i delovi menija */}
      <nav aria-label="Delovi menija" className="sticky top-[calc(116px+env(safe-area-inset-top,0px))] z-10 mt-6 border-y border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[920px] items-center gap-3 px-5 py-2.5 sm:px-6">
          <Link
            href={back}
            aria-label={`Nazad: ${backLabel}`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red text-white shadow-[0_8px_18px_-10px_rgba(215,30,40,.9)] transition hover:bg-red-dark"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="hidden shrink-0 font-serif text-lg font-bold sm:block">{shop.name}</span>
          {shop.menu.length > 1 && (
            <div className="flex min-w-0 gap-2 overflow-x-auto [scrollbar-width:none]">
              {shop.menu.map((section, i) => (
                <button
                  key={section.title}
                  type="button"
                  onClick={() => scrollToSection(i)}
                  className="shrink-0 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-semibold text-deep transition hover:border-red hover:text-red"
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto mt-6 grid max-w-[920px] gap-6 px-5 sm:px-6">
        {shop.menu.map((section, i) => (
          <section key={section.title} id={sectionId(i)} className="scroll-mt-[190px] rounded-2xl border border-line bg-white px-5 pt-5 sm:px-7 sm:pt-6">
            <h2 className="text-[26px] font-bold">{section.title}</h2>
            <ul>
              {section.items.map((item) => (
                <MenuItem key={item.id} shop={shop} item={item} />
              ))}
            </ul>
          </section>
        ))}

        {shop.request && (
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
  if (window.lenis) window.lenis.scrollTo(el, { offset: -184 })
  else el.scrollIntoView({ behavior: 'smooth' })
}
