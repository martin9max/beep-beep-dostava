import { useState } from 'react'
import { formatDin } from '../lib/order'
import { useCart } from '../lib/cart'
import { useAuth } from '../lib/auth'
import { navigate, useRoute } from '../lib/router'

const price = (value) => (value == null ? 'po računu' : `${formatDin(value)} din`)

/** Jedna stavka digitalnog menija: naziv, opis, veličina, cena i dugme za količinu. */
export default function MenuItem({ shop, item, showShop = false }) {
  const cart = useCart()
  const { user } = useAuth()
  const { path, query } = useRoute()
  const variants = Array.isArray(item.price) ? item.price : null
  const [variant, setVariant] = useState(0)
  const qty = cart.qtyOf(shop.slug, item.id, variant)
  const current = variants ? variants[variant][1] : item.price

  const allPrices = variants ? variants.map(([, value]) => formatDin(value)).join(' / ') + ' din' : price(item.price)
  const inCart = cart.items.some((l) => l.shop === shop.slug && l.id === item.id)
  const qtyButton = (
    <Qty
      value={qty}
      label={variants ? `${item.name} ${variants[variant][0]}` : item.name}
      onChange={(n) => {
        // u korpu dodaju samo prijavljeni; ostale vodi na prijavu pa nazad na ovaj meni
        if (!user && n > qty) {
          const here = path + (query.size ? `?${query}` : '')
          navigate(`/prijava?next=${encodeURIComponent(here)}`)
          return
        }
        cart.setQty(shop.slug, item.id, variant, n)
      }}
    />
  )

  return (
    // red kao na digitalnom meniju lokala: naziv i sastojci levo, cena desno, ceo red se blago istakne
    <li
      className={`group -mx-3 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-[1fr_auto] rounded-xl border-b border-line px-3 py-4 transition-colors last:border-b-0 sm:-mx-4 sm:px-4 ${
        inCart ? 'bg-red/[.06]' : 'hover:bg-paper'
      }`}
    >
      <div className="min-w-0">
        {showShop && <p className="text-xs font-bold uppercase tracking-[.14em] text-red">{shop.name}</p>}
        <h4 className={`font-serif text-[17px] font-bold uppercase leading-snug tracking-[.03em] transition-colors sm:text-[18px] ${inCart ? 'text-red' : 'text-deep group-hover:text-red'}`}>
          {item.name}
          {item.weight && <span className="ml-2 whitespace-nowrap font-body text-[12px] font-semibold normal-case tracking-normal text-mute">{item.weight}</span>}
        </h4>
        {item.desc && <p className="mt-1 text-sm leading-snug text-mute">{item.desc}</p>}
      </div>

      <div className={`flex items-center justify-between gap-4 sm:justify-end ${variants ? 'self-start' : 'self-center'}`}>
        <p className="whitespace-nowrap text-right text-[16px] font-extrabold text-red sm:text-[17px]">
          {allPrices.replace(' din', '')}
          <span className="ml-1 text-[12px] font-semibold text-mute">{item.price == null ? '' : 'din'}</span>
        </p>
        {!variants && qtyButton}
      </div>

      {/* veličina (32 / 48 cm, 300 / 450 g) i dugme za dodavanje u drugom redu */}
      {variants && (
        <>
          <div className="col-span-full flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-line bg-white p-0.5" role="radiogroup" aria-label={`Veličina: ${item.name}`}>
              {variants.map(([label, value], i) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={i === variant}
                  aria-label={`${label}, ${formatDin(value)} din`}
                  onClick={() => setVariant(i)}
                  className={`rounded-full px-3 py-1 text-[13px] font-bold transition ${
                    i === variant ? 'bg-ink text-white shadow-sm' : 'text-deep hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="hidden text-[13px] font-semibold text-mute min-[400px]:inline">{price(current)}</span>
          </div>
          {qtyButton}
          </div>
        </>
      )}
    </li>
  )
}

/** "Dodaj" dugme koje postaje − 1 + kad je stavka u korpi. */
export function Qty({ value, onChange, label }) {
  if (!value) {
    return (
      <button
        type="button"
        onClick={() => onChange(1)}
        aria-label={`Dodaj: ${label}`}
        className="btn btn-primary px-4 py-2.5 text-sm"
      >
        <span aria-hidden="true" className="text-lg leading-none">+</span> Dodaj
      </button>
    )
  }
  return (
    <div className="flex items-center rounded-md border border-red/40 bg-white">
      <button type="button" onClick={() => onChange(value - 1)} aria-label={`Manje: ${label}`} className="grid h-10 w-10 place-items-center text-xl font-bold text-red">
        −
      </button>
      <span className="min-w-6 text-center font-bold text-deep" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label={`Više: ${label}`} className="grid h-10 w-10 place-items-center text-xl font-bold text-red">
        +
      </button>
    </div>
  )
}

