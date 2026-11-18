import { useEffect, useState } from 'react'
import { apiCall } from '../lib/auth'

// Potvrda porudžbine za kupca: šta je uradio svaki lokal (čeka, prihvatio i za koliko je spremno, spremno,
// odbio) i dugme "Otkaži porudžbinu" dok je nijedan lokal nije prihvatio. Osvežava se samo dok je porudžbina
// u toku, pa kupac ne mora da zove ili poručuje ponovo da bi saznao šta se dešava.

const DONE = ['isporučena', 'otkazana', 'nije preuzeta']
const REFRESH_MS = 10000

/** Jedan red o porudžbini, za kupca. */
function headline(order) {
  if (order.status === 'otkazana') return ['Porudžbina je otkazana.', 'text-mute']
  if (order.status === 'isporučena') return ['Isporučeno. Prijatno! 😊', 'text-[#1d6a3a]']
  if (order.status === 'nije preuzeta') return ['Porudžbina nije preuzeta.', 'text-mute']
  if (order.status === 'u dostavi') return ['Dostavljač je krenuo ka vama. 🛵', 'text-ink']
  const parts = order.parts ?? []
  if (parts.length && parts.every((p) => p.status === 'spremna')) return ['Sve je spremno, dostavljač preuzima porudžbinu.', 'text-[#1d6a3a]']
  if (parts.some((p) => p.status === 'prihvaćena' || p.status === 'spremna')) return ['Potvrđeno! Lokal priprema vašu porudžbinu.', 'text-[#1d6a3a]']
  if (parts.length && parts.every((p) => p.status === 'odbijena')) return ['Lokal trenutno ne može da pripremi porudžbinu. Javićemo vam se.', 'text-red']
  return ['Primljeno. Čekamo da lokal potvrdi porudžbinu.', 'text-[#7a5a00]']
}

function partLine(p) {
  if (p.status === 'prihvaćena') return `prihvatio, spremno za ${p.minutes} min${p.readyAt ? ` (oko ${p.readyAt})` : ''}`
  if (p.status === 'spremna') return 'spremno, dostavljač preuzima'
  if (p.status === 'odbijena') return `ne može da pripremi${p.reason ? ` (${p.reason.toLowerCase()})` : ''}, javićemo vam se`
  return 'čeka potvrdu lokala'
}

/**
 * Stanje porudžbine. `order`: porudžbina iz /api/orders (ili samo { id } posle poručivanja: ostalo se učita).
 * `onChange`: kad se porudžbina promeni (npr. otkazana), da roditelj osveži svoju listu.
 */
export default function OrderStatus({ order: initial, onChange }) {
  const [order, setOrder] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setOrder((o) => ({ ...o, ...initial })), [initial])

  // dok porudžbina traje, stanje se proverava na 10 sekundi
  useEffect(() => {
    if (DONE.includes(order.status)) return
    let alive = true
    const load = () =>
      apiCall('/api/orders')
        .then((d) => {
          const fresh = d.orders.find((o) => o.id === order.id)
          if (alive && fresh) setOrder(fresh)
        })
        .catch(() => {})
    if (!order.parts) load()
    const timer = setInterval(load, REFRESH_MS)
    return () => {
      alive = false
      clearInterval(timer)
    }
  }, [order.id, order.status, order.parts])

  const cancel = async () => {
    if (!confirm(`Otkazati porudžbinu #${order.id}?`)) return
    setBusy(true)
    setError('')
    try {
      await apiCall('/api/orders/cancel', { method: 'POST', body: { id: order.id } })
      const next = { ...order, status: 'otkazana', canCancel: false }
      setOrder(next)
      onChange?.(next)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const [text, color] = headline(order)
  const parts = order.parts ?? []
  const active = !DONE.includes(order.status) && order.status !== 'u dostavi'

  return (
    <div className="rounded-xl border border-line bg-paper/60 p-4 text-left" aria-live="polite">
      <p className={`font-bold ${color}`}>{text}</p>
      {active && parts.length > 0 && (
        <ul className="mt-2 grid gap-1 text-[15px] text-deep/85">
          {parts.map((p) => (
            <li key={p.slug}>
              <b>{p.name}:</b> {partLine(p)}
            </li>
          ))}
        </ul>
      )}
      {order.canCancel && (
        <button
          type="button"
          onClick={cancel}
          disabled={busy}
          className="mt-3 rounded-lg border-2 border-red px-4 py-2 text-sm font-bold text-red transition hover:bg-red hover:text-white disabled:opacity-50"
        >
          {busy ? 'Otkazujem...' : 'Otkaži porudžbinu'}
        </button>
      )}
      {order.canCancel && <p className="mt-2 text-[13px] text-mute">Otkazivanje je moguće dok lokal ne prihvati porudžbinu.</p>}
      {error && <p className="mt-2 text-sm font-semibold text-red">{error}</p>}
    </div>
  )
}
