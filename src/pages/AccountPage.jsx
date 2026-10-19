import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Field, { FormError } from '../components/Field'
import { apiCall, useAuth } from '../lib/auth'
import { formatDin } from '../lib/order'
import { navigate } from '../lib/router'
import { usePageTitle } from './PageShell'
import { PlaceField } from '../components/Address'

const STATUS_COLORS = {
  nova: 'bg-[#fff3c4] text-[#7a5a00]',
  prihvaćena: 'bg-ink/10 text-deep',
  'u dostavi': 'bg-ink text-white',
  isporučena: 'bg-[#dff5dc] text-[#1d6a3a]',
  otkazana: 'bg-line text-mute',
}

/** /nalog: lični podaci, stalna adresa i istorija porudžbina. */
export default function AccountPage() {
  usePageTitle('Moj nalog')
  const { user, update, logout } = useAuth()
  const [orders, setOrders] = useState(null)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [place, setPlace] = useState(null)

  useEffect(() => {
    if (user === null) navigate('/prijava?next=/nalog', { replace: true })
    if (user) apiCall('/api/orders').then((d) => setOrders(d.orders)).catch(() => setOrders([]))
  }, [user])

  if (!user) return <div className="mx-auto h-96 max-w-[1120px] animate-pulse px-5 pt-10" />

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setBusy(true)
    try {
      await update(Object.fromEntries(new FormData(e.currentTarget)))
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto grid max-w-[1120px] gap-8 px-5 pb-24 pt-8 sm:px-6 md:pt-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
      <div>
        <h1 className="text-[clamp(34px,5vw,50px)] font-bold tracking-tight">Zdravo, {user.name}!</h1>
        <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2">
          <h2 className="font-body text-sm font-bold uppercase tracking-[.2em] text-red sm:col-span-2">Moji podaci</h2>
          <Field label="Ime" name="name" defaultValue={user.name} required maxLength={60} />
          <Field label="Prezime" name="surname" defaultValue={user.surname} required maxLength={60} />
          <Field label="Telefon" value={user.phone} disabled hint="Za promenu broja nas pozovite." />
          <Field label="Email" name="email" type="email" defaultValue={user.email ?? ''} required maxLength={120} />
          <div className="sm:col-span-2">
            <PlaceField value={place ?? user.place ?? ''} onChange={setPlace} />
          </div>
          <Field className="sm:col-span-2" label="Ulica i broj (stalna adresa)" name="address" defaultValue={user.address} required maxLength={200} />
          <Field className="sm:col-span-2" label="Dodatno o adresi" name="addressNote" defaultValue={user.addressNote} maxLength={200} placeholder="Sprat, stan, interfon..." />
          <div className="grid gap-3 sm:col-span-2">
            <FormError>{error}</FormError>
            {saved && <p className="text-sm font-semibold text-[#1d7a46]">Sačuvano.</p>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={busy}>
                {busy ? 'Čuvam...' : 'Sačuvaj'}
              </Button>
              <Button variant="ghost" onClick={async () => { await logout(); navigate('/') }}>
                Odjavi se
              </Button>
            </div>
          </div>
        </form>
      </div>

      <section className="lg:pt-[76px]">
        <h2 className="mb-4 text-[28px] font-bold">Moje porudžbine</h2>
        {orders === null ? (
          <div className="h-40 animate-pulse rounded-2xl bg-white" />
        ) : orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line bg-white p-8 text-center text-mute">Još niste ništa poručili.</p>
        ) : (
          <ul className="grid gap-4">
            {orders.map((o) => (
              <li key={o.id} className="rounded-2xl border border-line bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-deep">
                    #{o.id} <span className="font-normal text-mute">· {o.created_at.slice(0, 16)}</span>
                  </p>
                  <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${STATUS_COLORS[o.status] ?? ''}`}>{o.status}</span>
                </div>
                {o.shops.map((s) => (
                  <div key={s.slug} className="mt-3">
                    <p className="text-sm font-bold text-red">{s.name}</p>
                    <p className="text-[15px] text-deep/80">
                      {s.lines.map((l) => `${l.qty}× ${l.name}${l.variant ? ` (${l.variant})` : ''}`).join(', ')}
                      {s.request && <span className="block italic text-mute">„{s.request}“</span>}
                    </p>
                  </div>
                ))}
                <p className="mt-3 border-t border-line pt-3 text-sm text-mute">
                  {o.address} · <b className="text-deep">{formatDin(o.total)} din</b>{o.delivery == null && ' + dostava po taksi tarifi'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
