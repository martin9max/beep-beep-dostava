import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Field, { FormError } from '../components/Field'
import Thumb, { hasImage, logoOf } from '../components/Thumb'
import { Qty } from '../components/MenuItem'
import { variantLabel } from '../catalog'
import { AddressDialog, PinIcon, useDeliveryAddress } from '../components/Address'
import { deliveryNote, fullAddress } from '../places'
import { DELIVERY, EXTRA_STOP, PHONE, deliveryPriceOf } from '../data'
import { apiCall, useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { formatDin } from '../lib/order'
import { Link } from '../lib/router'
import { usePageTitle } from './PageShell'

const din = (n) => `${formatDin(n)} din`

/** /korpa: pregled stavki po lokalima, adresa i slanje porudžbine. */
export default function CheckoutPage() {
  usePageTitle('Vaša porudžbina')
  const cart = useCart()
  const { user } = useAuth()
  const [done, setDone] = useState(null)

  // posle slanja potvrda se vidi od vrha
  useEffect(() => {
    if (!done) return
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [done])

  if (done) return <Done order={done} />
  if (cart.isEmpty) {
    return (
      <div className="mx-auto max-w-[560px] px-5 py-24 text-center">
        <p className="text-6xl" aria-hidden="true">🧺</p>
        <h1 className="mt-6 text-[40px] font-bold">Korpa je prazna</h1>
        <p className="mt-2 text-lg text-deep/75">Izaberite lokal i dodajte nešto ukusno.</p>
        <Button as={Link} href="/naruci" arrow className="mt-8">
          Izaberi lokal
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-[1120px] gap-8 px-5 pb-24 pt-8 sm:px-6 md:pt-12 lg:grid-cols-[1.25fr_1fr] lg:items-start">
      <div>
        <h1 className="text-[clamp(34px,5vw,50px)] font-bold tracking-tight">Vaša porudžbina</h1>

        {cart.shops.length > 1 && (
          <p className="mt-4 flex gap-3 rounded-xl bg-red px-4 py-3.5 text-[15px] font-semibold text-white">
            <span aria-hidden="true">🛵</span>
            <span>
              Naručujete iz {cart.shops.length} lokala. Kurir svraća redom u svaki, a sve stiže u jednoj vožnji. {EXTRA_STOP.note}
            </span>
          </p>
        )}

        <div className="mt-6 grid gap-5">
          {cart.shops.map(({ shop, lines, request }, i) => (
            <section key={shop.slug} className="overflow-hidden rounded-2xl border border-line bg-white">
              <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
                {logoOf(shop) ? (
                  <img src={logoOf(shop)} alt="" className="h-11 w-[113px] shrink-0 rounded-lg object-cover" />
                ) : hasImage(`lokali/${shop.slug}`) && (
                  <Thumb src={`lokali/${shop.slug}`} emoji={shop.emoji} className="h-11 w-11 shrink-0 rounded-lg" emojiClass="text-2xl" />
                )}
                <div className="min-w-0 flex-1">
                  {cart.shops.length > 1 && <p className="text-xs font-bold uppercase tracking-[.14em] text-red">{i + 1}. zaustavljanje</p>}
                  <h2 className="truncate font-body text-lg font-bold">{shop.name}</h2>
                </div>
                <Link href={`/lokal/${shop.slug}`} className="text-sm font-semibold text-deep/75 underline underline-offset-4 hover:text-red">
                  Dodaj još
                </Link>
              </header>
              <ul className="px-5">
                {lines.map((l) => (
                  <li key={`${l.id}-${l.variant}`} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug text-deep">
                        {l.item.name}
                        {variantLabel(l.item, l.variant) && <span className="text-mute"> · {variantLabel(l.item, l.variant)}</span>}
                      </p>
                      <p className="text-sm text-mute">{l.price == null ? 'po računu' : din(l.price * l.qty)}</p>
                    </div>
                    <Qty value={l.qty} label={l.item.name} onChange={(n) => cart.setQty(l.shop, l.id, l.variant, n)} />
                  </li>
                ))}
              </ul>
              {shop.request && (
                <div className="border-t border-line bg-paper/60 px-5 py-4">
                  <label htmlFor={`req-${shop.slug}`} className="text-sm font-semibold text-deep">
                    {shop.request.label}
                  </label>
                  <textarea
                    id={`req-${shop.slug}`}
                    rows={2}
                    maxLength={600}
                    value={request}
                    onChange={(e) => cart.setRequest(shop.slug, e.target.value)}
                    placeholder={shop.request.placeholder}
                    className="mt-1.5 block w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-deep outline-none placeholder:text-mute/60 focus:border-ink focus:ring-4 focus:ring-ink/15"
                  />
                </div>
              )}
            </section>
          ))}
        </div>
        <button type="button" onClick={cart.clear} className="mt-4 text-sm font-semibold text-mute underline underline-offset-4 hover:text-red">
          Isprazni korpu
        </button>
      </div>

      <aside className="lg:sticky lg:top-[140px]">
        {user === undefined ? (
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        ) : user ? (
          <DeliveryForm cart={cart} onDone={setDone} />
        ) : (
          <div className="rounded-2xl border border-line bg-white p-6">
            <Summary cart={cart} />
            <h2 className="mt-6 border-t border-line pt-6 text-[24px] font-bold">Još samo jedan korak</h2>
            <p className="mt-2 text-deep/75">
              Prijavite se ili napravite nalog. Adresu upišete samo jednom, a sledeći put je porudžbina gotova u dva klika.
            </p>
            <div className="mt-5 grid gap-3">
              <Button as={Link} href="/prijava?next=/korpa" arrow className="w-full">
                Prijavi se
              </Button>
              <Button as={Link} href="/registracija?next=/korpa" variant="ghost" className="w-full">
                Napravi nalog
              </Button>
            </div>
            <p className="mt-4 text-center text-sm text-mute">
              Ili nas pozovite: <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="font-bold text-deep">{PHONE}</a>
            </p>
          </div>
        )}
      </aside>
    </div>
  )
}

/**
 * Zbir: dostava se dodaje u ukupno (Negotin 500 din, selo km × 120 din).
 * Samo za mesto van spiska piše da cenu dostave javlja dostavljač.
 */
function Summary({ cart, place }) {
  const delivery = place ? deliveryPriceOf(place) : undefined
  const note = place ? deliveryNote(place, DELIVERY.perKm) : ''
  return (
    <dl className="grid gap-2 text-[15px]">
      <div className="flex justify-between">
        <dt className="text-deep/75">Hrana i proizvodi</dt>
        <dd className="font-semibold">{din(cart.total)}</dd>
      </div>
      {cart.hasUnpriced && (
        <div className="flex justify-between">
          <dt className="text-deep/75">Stavke po računu</dt>
          <dd className="font-semibold">plaćate kuriru</dd>
        </div>
      )}
      {delivery != null && (
        <div className="flex justify-between gap-3">
          <dt className="text-deep/75">
            Dostava ({place}){note && <span className="block text-[13px] text-mute">{note}</span>}
          </dt>
          <dd className="font-semibold">{din(delivery)}</dd>
        </div>
      )}
      <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
        <dt className="font-bold">Ukupno</dt>
        <dd className="font-serif text-[26px] font-bold">{din(cart.total + (delivery ?? 0))}</dd>
      </div>
      {delivery === null && (
        <p className="rounded-lg bg-[#fff3c4] px-3 py-2 text-sm font-semibold text-[#7a5a00]">
          + dostava za {place}: cenu vam javlja dostavljač kada vas pozove.
        </p>
      )}
      {delivery === undefined && (
        <p className="text-sm text-mute">
          Dostava: {din(DELIVERY.city)} u Negotinu, za sela {DELIVERY.perKm} din po kilometru.
        </p>
      )}
    </dl>
  )
}

function DeliveryForm({ cart, onDone }) {
  const { user, current, isTemp, setTempAddress } = useDeliveryAddress()
  const [dialog, setDialog] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!current?.place) return setDialog(true)
    setBusy(true)
    try {
      const body = { items: cart.items, requests: cart.requests, note, ...(isTemp ? current : {}) }
      const order = await apiCall('/api/orders', { method: 'POST', body })
      cart.clear()
      setTempAddress(null)
      onDone({ ...order, address: fullAddress(current.address, current.place) })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-[24px] font-bold">Dostava</h2>

      <div className={`mt-4 rounded-xl border-2 p-4 ${isTemp ? 'border-red/50 bg-red/5' : 'border-line bg-paper/60'}`}>
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.14em] text-mute">
          <PinIcon className="h-3.5 w-3.5" />
          {isTemp ? 'Privremena adresa' : 'Dostavljamo na'}
        </p>
        {current?.place ? (
          <>
            <p className="mt-1 text-lg font-bold leading-snug text-deep">{fullAddress(current.address, current.place)}</p>
            {current.addressNote && <p className="text-sm text-deep/75">{current.addressNote}</p>}
          </>
        ) : (
          <p className="mt-1 font-semibold text-red">Izaberite mesto (Negotin ili selo) da bismo znali cenu dostave.</p>
        )}
        <p className="mt-2 text-sm text-deep/75">
          {user.name} {user.surname} · {user.phone}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <button type="button" onClick={() => setDialog(true)} className="text-[15px] font-bold text-red underline underline-offset-4">
            Promeni adresu
          </button>
          {isTemp && (
            <button type="button" onClick={() => setTempAddress(null)} className="text-left text-[15px] font-semibold text-mute underline underline-offset-4">
              Vrati na kućnu ({fullAddress(user.address, user.place)})
            </button>
          )}
        </div>
      </div>
      <AddressDialog open={dialog} onClose={() => setDialog(false)} />

      <Field
        as="textarea"
        className="mt-4"
        label="Napomena za kurira (nije obavezno)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={500}
        placeholder="npr. pozovite kad stignete, imam sitno za 2000"
      />

      <div className="mt-6 border-t border-line pt-5">
        <Summary cart={cart} place={current?.place} />
      </div>
      <div className="mt-5 grid gap-3">
        <FormError>{error}</FormError>
        <Button type="submit" disabled={busy} arrow className="w-full py-4 text-[17px]">
          {busy ? 'Šaljem...' : 'Pošalji porudžbinu'}
        </Button>
        <p className="text-center text-sm text-mute">Pozvaćemo vas da potvrdimo porudžbinu.</p>
      </div>
    </form>
  )
}

function Done({ order }) {
  return (
    <div className="mx-auto max-w-[560px] px-5 py-20 text-center">
      <p className="text-6xl" aria-hidden="true">✅</p>
      <h1 className="mt-6 text-[40px] font-bold">Porudžbina je primljena!</h1>
      <p className="mt-3 text-lg text-deep/80">
        Broj porudžbine: <b>#{order.id}</b>. Uskoro vas zovemo da potvrdimo{order.delivery == null ? ' i kažemo cenu dostave' : ''}, pa beep beep, krećemo na <b>{order.address}</b>.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button as={Link} href="/nalog" variant="ghost">
          Moje porudžbine
        </Button>
        <Button as={Link} href="/" arrow>
          Početna
        </Button>
      </div>
    </div>
  )
}
