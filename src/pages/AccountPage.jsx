import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Field, { FormError } from '../components/Field'
import { apiCall, isBusiness, useAuth } from '../lib/auth'
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
        {isBusiness(user) && <p className="mt-1 font-semibold text-red">Nalog firme: {user.company}</p>}
        <form onSubmit={save} className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2">
          <h2 className="font-body text-sm font-bold uppercase tracking-[.2em] text-red sm:col-span-2">Moji podaci</h2>
          <Field label={user.kind === 'firma' ? 'Ime kontakt osobe' : 'Ime'} name="name" defaultValue={user.name} required maxLength={60} />
          <Field label={user.kind === 'firma' ? 'Prezime kontakt osobe' : 'Prezime'} name="surname" defaultValue={user.surname} required maxLength={60} />
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
        <FirmForm />
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
                  {o.address} · <b className="text-deep">{formatDin(o.total)} din</b>{o.delivery == null && ' + dostava (javlja dostavljač)'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/**
 * "Moja firma": firma u nalogu, sa svojom adresom. Kupac je dodaje ovde i tada može da poruči usluge za firme
 * i da u korpi bira da li se dostavlja na adresu firme ili na njegovu adresu.
 */
function FirmForm() {
  const { user, setUser } = useAuth()
  const [open, setOpen] = useState(isBusiness(user) || (typeof location !== 'undefined' && location.hash === '#firma'))
  const [place, setPlace] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const has = isBusiness(user)
  // sa linka "Dodaj firmu u nalog" (/nalog#firma) stranica odmah skroluje do ovog dela
  useEffect(() => {
    if (location.hash === '#firma') setTimeout(() => document.getElementById('firma')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setBusy(true)
    try {
      setUser((await apiCall('/api/firm', { method: 'PUT', body: Object.fromEntries(new FormData(e.currentTarget)) })).user)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <div id="firma" className="mt-6 rounded-2xl border border-dashed border-line bg-white p-6">
        <h2 className="font-body text-sm font-bold uppercase tracking-[.2em] text-red">Imate firmu?</h2>
        <p className="mt-2 text-[15px] text-deep/80">
          Dodajte firmu svom nalogu i poručujte uplatu pazara, dostavu dokumenata i ostale usluge za firme. Pri porudžbini birate da li
          dostavljamo na adresu firme ili na vašu.
        </p>
        <Button className="mt-4" onClick={() => setOpen(true)}>
          Dodaj firmu
        </Button>
      </div>
    )
  }
  return (
    <form id="firma" onSubmit={save} className="mt-6 grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-2">
      <h2 className="font-body text-sm font-bold uppercase tracking-[.2em] text-red sm:col-span-2">Moja firma</h2>
      <Field className="sm:col-span-2" label="Naziv firme" name="company" defaultValue={user.company} required maxLength={120} autoComplete="organization" />
      <Field label="PIB" name="pib" defaultValue={user.pib} inputMode="numeric" required maxLength={11} placeholder="9 cifara" />
      <Field label="Matični broj" name="mb" defaultValue={user.mb} inputMode="numeric" required maxLength={10} placeholder="8 cifara" />
      <div className="sm:col-span-2">
        <PlaceField name="companyPlace" value={place ?? user.companyPlace ?? ''} onChange={setPlace} />
      </div>
      <Field className="sm:col-span-2" label="Adresa firme (ulica i broj)" name="companyAddress" defaultValue={user.companyAddress} required maxLength={200} />
      <Field className="sm:col-span-2" label="Dodatno o adresi firme" name="companyAddressNote" defaultValue={user.companyAddressNote} maxLength={200} placeholder="Ulaz iz dvorišta, lokal br. 3..." />
      <div className="grid gap-3 sm:col-span-2">
        <FormError>{error}</FormError>
        {saved && <p className="text-sm font-semibold text-[#1d7a46]">{has ? 'Sačuvano.' : 'Firma je dodata.'}</p>}
        <Button type="submit" disabled={busy} className="justify-self-start">
          {busy ? 'Čuvam...' : has ? 'Sačuvaj firmu' : 'Dodaj firmu'}
        </Button>
      </div>
    </form>
  )
}
