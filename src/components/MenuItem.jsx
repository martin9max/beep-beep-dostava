import { useState } from 'react'
import { formatDin } from '../lib/order'
import { useCart } from '../lib/cart'

const price = (value) => (value == null ? 'po računu' : `${formatDin(value)} din`)

/** Jedna stavka digitalnog menija: naziv, opis, veličina, cena i dugme za količinu. */
export default function MenuItem({ shop, item, showShop = false }) {
  const cart = useCart()
  const variants = Array.isArray(item.price) ? item.price : null
  const [variant, setVariant] = useState(0)
  const qty = cart.qtyOf(shop.slug, item.id, variant)
  const current = variants ? variants[variant][1] : item.price

  return (
    <li className="flex gap-4 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        {showShop && <p className="text-xs font-bold uppercase tracking-[.14em] text-red">{shop.name}</p>}
        <h4 className="font-body text-[17px] font-bold leading-snug text-deep">{item.name}</h4>
        {item.desc && <p className="mt-0.5 text-sm leading-snug text-mute">{item.desc}</p>}

        {variants && (
          <div className="mt-2.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Veličina: ${item.name}`}>
            {variants.map(([label, value], i) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={i === variant}
                onClick={() => setVariant(i)}
                className={`rounded-full border px-3 py-1 text-[13px] font-semibold transition ${
                  i === variant ? 'border-ink bg-ink text-white' : 'border-line bg-white text-deep hover:border-ink/60'
                }`}
              >
                {label} · {formatDin(value)}
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 font-bold text-deep">{variants ? price(current) : price(item.price)}</p>
      </div>

      <div className="self-end">
        <Qty
          value={qty}
          label={item.name}
          onChange={(n) => cart.setQty(shop.slug, item.id, variant, n)}
        />
      </div>
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

