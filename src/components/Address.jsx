import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from './Button'
import Field, { FormError } from './Field'
import { CITY, VILLAGES, fullAddress, isKnownPlace, zoneOf } from '../places'
import { DELIVERY } from '../data'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { EASE, formatDin } from '../lib/order'
import { Link } from '../lib/router'

const OTHER = '__drugo'

/** Trenutna adresa dostave: privremena (ako je izabrana) ili stalna iz naloga. */
export function useDeliveryAddress() {
  const { user } = useAuth()
  const { tempAddress, setTempAddress } = useCart()
  const home = user ? { address: user.address, place: user.place, addressNote: user.addressNote } : null
  const current = tempAddress ?? home
  const zone = current?.place ? zoneOf(current.place) : null
  return {
    user,
    current,
    home,
    isTemp: Boolean(tempAddress),
    setTempAddress,
    zone,
    // null = cenu javlja dostavljač (selo); undefined = mesto još nije izabrano
    price: zone ? DELIVERY.zones[zone].price : undefined,
  }
}

/** Izbor mesta: Negotin, selo sa spiska ili drugo mesto (upisuje se). */
export function PlaceField({ value, onChange, name = 'place' }) {
  const [otherMode, setOtherMode] = useState(false)
  const other = otherMode || (Boolean(value) && !isKnownPlace(value))
  const selectValue = other ? OTHER : value || ''
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-deep">Mesto</span>
        <select
          required
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value
            setOtherMode(v === OTHER)
            onChange(v === OTHER ? '' : v)
          }}
          className="block w-full rounded-lg border border-line bg-white px-3.5 py-3 text-[16px] text-deep outline-none focus:border-ink focus:ring-4 focus:ring-ink/15"
        >
          <option value="" disabled>
            Izaberite mesto...
          </option>
          <option value={CITY}>{CITY} (grad), dostava {formatDin(DELIVERY.zones.grad.price)} din</option>
          <optgroup label="Sela (cenu dostave javlja dostavljač)">
            {VILLAGES.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </optgroup>
          <option value={OTHER}>Drugo mesto (upišite)</option>
        </select>
      </label>
      {other && <Field label="Koje mesto?" value={value} onChange={(e) => onChange(e.target.value)} required maxLength={60} placeholder="npr. Kladovo" />}
      {/* za slanje kroz FormData */}
      <input type="hidden" name={name} value={value} />
    </div>
  )
}

/** Prozor za promenu adrese: samo za ovu porudžbinu ili kao nova stalna adresa. */
export function AddressDialog({ open, onClose }) {
  const { user, update } = useAuth()
  const { current, setTempAddress } = useDeliveryAddress()
  const [form, setForm] = useState({ address: '', place: '', addressNote: '' })
  const [save, setSave] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm({ address: '', place: current?.place ?? '', addressNote: '' })
    setSave(false)
    setError('')
    const onKey = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    // stranica ispod prozora ne skroluje dok je prozor otvoren
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = overflow
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault()
    const next = { address: form.address.trim(), place: form.place.trim(), addressNote: form.addressNote.trim() }
    if (!next.place) return setError('Izaberite mesto.')
    if (!next.address) return setError('Upišite ulicu i broj (ili opis kuće).')
    setBusy(true)
    try {
      if (save) {
        await update({ name: user.name, surname: user.surname, email: user.email, ...next })
        setTempAddress(null)
      } else {
        setTempAddress(next)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 sm:place-items-center sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="adresa-naslov"
            onSubmit={submit}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-t-2xl bg-white p-6 pb-[calc(24px+env(safe-area-inset-bottom,0px))] shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="adresa-naslov" className="text-[26px] font-bold">
                Gde da dostavimo?
              </h2>
              <button type="button" onClick={onClose} aria-label="Zatvori" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-xl text-deep hover:text-red">
                ×
              </button>
            </div>
            <p className="mt-1 text-sm text-mute">Niste kod kuće? Upišite gde ste sada.</p>

            <div className="mt-5 grid gap-4">
              <PlaceField value={form.place} onChange={(place) => setForm((f) => ({ ...f, place }))} />
              <Field
                label="Ulica i broj"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                maxLength={200}
                placeholder="npr. Hajduk Veljkova 10 (na selu i opis kuće)"
                autoComplete="street-address"
              />
              <Field
                label="Dodatno (nije obavezno)"
                value={form.addressNote}
                onChange={(e) => setForm((f) => ({ ...f, addressNote: e.target.value }))}
                maxLength={200}
                placeholder="Sprat, stan, interfon, kod koga ste..."
              />
              <label className="flex items-center gap-2.5 text-[15px] text-deep">
                <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-5 w-5 accent-[#d71e28]" />
                Zapamti kao moju stalnu adresu
              </label>
              <FormError>{error}</FormError>
              <Button type="submit" disabled={busy} className="w-full">
                {busy ? 'Čuvam...' : 'Dostavi na ovu adresu'}
              </Button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export const deliveryText = (price) => (price == null ? 'cenu dostave javlja dostavljač' : `dostava ${formatDin(price)} din`)

/** Traka ispod zaglavlja na stranicama za naručivanje: gde dostavljamo + "Promeni adresu". */
export function AddressBar() {
  const { user, current, isTemp, setTempAddress, price } = useDeliveryAddress()
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-line bg-white">
      <div className="mx-auto flex h-11 max-w-[1120px] items-center gap-2 px-5 text-[14px] sm:px-6">
        <PinIcon className={`h-4 w-4 shrink-0 ${isTemp ? 'text-red' : 'text-deep'}`} />
        {user === undefined ? (
          <span className="h-4 w-40 animate-pulse rounded bg-paper" />
        ) : !user ? (
          <span className="min-w-0 truncate text-deep/80">
            <Link href="/prijava?next=/naruci" className="font-bold text-red underline underline-offset-2">
              Prijavite se
            </Link>{' '}
            i adresa za dostavu je uvek ovde
          </span>
        ) : (
          <>
            <span className="min-w-0 truncate">
              <span className="text-mute">{isTemp ? 'Privremeno na: ' : 'Dostava na: '}</span>
              <b className="text-deep">{current?.place ? fullAddress(current.address, current.place) : 'izaberite mesto'}</b>
              {current?.place && <span className="hidden text-mute sm:inline"> · {deliveryText(price)}</span>}
            </span>
            <button type="button" onClick={() => setOpen(true)} className="ml-auto shrink-0 font-bold text-red underline underline-offset-2">
              Promeni adresu
            </button>
            {isTemp && (
              <button type="button" onClick={() => setTempAddress(null)} className="hidden shrink-0 text-mute underline underline-offset-2 sm:inline">
                Vrati kućnu
              </button>
            )}
          </>
        )}
      </div>
      <AddressDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export function PinIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}
