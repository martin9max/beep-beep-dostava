import { useRef } from 'react'
import { ALL_ITEMS, CATEGORIES, SHOPS, shopCategories } from '../catalog'
import { SERVICES } from '../data'
import { Link, navigate } from '../lib/router'
import Thumb, { hasImage } from '../components/Thumb'
import { usePageTitle } from './PageShell'

const TAB_LABELS = { food: 'Hrana', market: 'Namirnice', meds: 'Lekovi', flowers: 'Cveće', gifts: 'Torte i pokloni', other: 'Ostalo' }

/** /naruci/<usluga>?k=<kategorija>: kategorije sa slikama i lokali koji ih imaju. */
export default function OrderPage({ service, category }) {
  const active = SERVICES.find((s) => s.key === service) ?? SERVICES[0]
  const categories = CATEGORIES[active.key]
  const selected = categories.find((c) => c.key === category)
  usePageTitle(`Naruči: ${active.title}`)

  const shops = SHOPS.filter((s) => s.service === active.key && (!selected || shopCategories(s).has(selected.key)))

  const pick = (key) => navigate(`/naruci/${active.key}${key && key !== category ? `?k=${key}` : ''}`, { replace: true, scroll: false })

  return (
    <div className="mx-auto max-w-[1120px] px-5 pb-40 pt-8 sm:px-6 md:pt-12">
      <h1 className="text-[clamp(30px,4vw,44px)] font-bold tracking-tight">Šta vam treba?</h1>
      <p className="mt-1 max-w-[60ch] text-deep/75">
        Izaberite iz jednog ili više lokala, sve stiže u jednoj vožnji. Plaćate gotovinom kad kurir stigne.
      </p>

      {/* usluge */}
      <nav aria-label="Vrsta dostave" className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {SERVICES.map((s) => (
          <Link
            key={s.key}
            href={`/naruci/${s.key}`}
            aria-current={s.key === active.key ? 'page' : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-[15px] font-semibold transition ${
              s.key === active.key ? 'border-red bg-red text-white' : 'border-line bg-white text-deep hover:border-ink/50'
            }`}
          >
            {TAB_LABELS[s.key]}
          </Link>
        ))}
      </nav>

      {/* kategorije: jedan red sa slikama, kao brza pretraga */}
      <CategoryRow categories={categories} selected={selected} onPick={pick} />

      {/* lokali */}
      <section aria-labelledby="lokali" className="mt-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="lokali" className="text-[28px] font-bold">
            {selected ? `${selected.label}: lokali` : active.key === 'food' ? 'Lokali' : 'Odakle naručujete'}
          </h2>
          {selected && (
            <button type="button" onClick={() => pick(null)} className="text-sm font-semibold text-red underline underline-offset-4">
              Prikaži sve
            </button>
          )}
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shops.map((shop) => (
            <ShopCard key={shop.slug} shop={shop} category={selected} />
          ))}
        </ul>
        {!shops.length && <p className="rounded-xl border border-dashed border-line p-8 text-center text-mute">Za ovu kategoriju još nema lokala.</p>}
      </section>
    </div>
  )
}

/** Kategorije u jednom redu; na računaru strelice levo/desno, na telefonu prevlačenje. */
function CategoryRow({ categories, selected, onPick }) {
  const row = useRef(null)
  const scroll = (dir) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section aria-label="Kategorije" className="relative mt-6">
      <ul ref={row} className="-mx-5 flex gap-3 overflow-x-auto scroll-smooth px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const on = c.key === selected?.key
          return (
            <li key={c.key} className="w-[92px] shrink-0 sm:w-[104px]">
              <button type="button" onClick={() => onPick(c.key)} aria-pressed={on} className="group block w-full text-center">
                <Thumb
                  src={`kategorije/${c.key}`}
                  emoji={c.emoji}
                  alt=""
                  className={`aspect-square rounded-2xl ring-[3px] transition ${on ? 'ring-red' : 'ring-transparent group-hover:ring-ink/30'}`}
                  emojiClass="text-[42px] transition-transform duration-300 group-hover:scale-110"
                />
                <span className={`mt-1.5 block text-[13px] font-bold leading-tight ${on ? 'text-red' : 'text-deep'}`}>{c.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {[-1, 1].map((dir) => (
        <button
          key={dir}
          type="button"
          onClick={() => scroll(dir)}
          aria-label={dir < 0 ? 'Prethodne kategorije' : 'Sledeće kategorije'}
          className={`absolute top-[32px] hidden h-10 w-10 place-items-center rounded-full border border-line bg-white text-deep shadow-[0_8px_20px_-10px_rgba(22,115,196,.6)] transition hover:border-ink hover:text-ink lg:grid ${
            dir < 0 ? '-left-5' : '-right-5'
          }`}
        >
          <svg className={`h-4 w-4 ${dir < 0 ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 8h11M9 4l4 4-4 4" />
          </svg>
        </button>
      ))}
    </section>
  )
}

function ShopCard({ shop, category }) {
  const cats = CATEGORIES[shop.service].filter((c) => shopCategories(shop).has(c.key))
  const count = category ? ALL_ITEMS.filter((r) => r.shop === shop && r.cat === category.key).length : null
  return (
    <li>
      <Link
        href={`/lokal/${shop.slug}${category ? `?k=${category.key}` : ''}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_-20px_rgba(22,115,196,.55)]"
      >
        {hasImage(`lokali/${shop.slug}`) && (
          <Thumb src={`lokali/${shop.slug}`} emoji={shop.emoji} alt="" className="aspect-[16/9]" emojiClass="text-6xl transition-transform duration-500 group-hover:scale-110" />
        )}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[22px] font-bold">{shop.name}</h3>
          <p className="mt-1 text-[15px] leading-snug text-mute">{shop.about}</p>
          <p className="mt-3 flex flex-wrap gap-1.5">
            {cats.slice(0, 5).map((c) => (
              <span key={c.key} className="rounded-full bg-paper px-2.5 py-0.5 text-[12px] font-semibold text-deep/80">
                {c.emoji} {c.label}
              </span>
            ))}
          </p>
          <span className="mt-auto flex items-center gap-1.5 pt-4 text-[15px] font-bold text-red">
            {count ? `${count} ${stavke(count)} · ` : ''}Otvori meni
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 8h11M9 4l4 4-4 4" />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  )
}

const stavke = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'stavka' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'stavke' : 'stavki')
