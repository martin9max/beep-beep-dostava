import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Field, { FormError } from '../components/Field'
import { useAuth } from '../lib/auth'
import { Link, navigate } from '../lib/router'
import { isValidPhone } from '../lib/order'
import { PlaceField } from '../components/Address'
import { Card, usePageTitle } from './PageShell'

// posle prijave vraća tamo odakle je kupac došao (npr. /korpa), samo unutar sajta
// posle prijave firme: ponuda usluga za firme
const BUSINESS_HOME = '/naruci/other'
const safeNext = (next) => (next && next.startsWith('/') && !next.startsWith('//') ? next : '/naruci')

/** Zajednička logika forme: stanje slanja i greška. */
function useSubmit(action) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await action(new FormData(e.currentTarget))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return { error, setError, busy, onSubmit }
}

/** Ako je kupac već prijavljen, prijava/registracija ga odmah prebacuju dalje. */
function useRedirectIfLoggedIn(next) {
  const { user } = useAuth()
  useEffect(() => {
    if (user) navigate(safeNext(next), { replace: true })
  }, [user, next])
}

export function LoginPage({ next, business = false }) {
  usePageTitle(business ? 'Prijava za firme' : 'Prijava')
  useRedirectIfLoggedIn(business ? next || BUSINESS_HOME : next)
  const { login } = useAuth()
  const { error, busy, onSubmit } = useSubmit((f) => login(f.get('login'), f.get('password'), business ? 'firma' : undefined))
  const query = next ? `?next=${encodeURIComponent(next)}` : ''
  const registerHref = `${business ? '/firme/registracija' : '/registracija'}${query}`

  return (
    <Card
      title={business ? 'Prijava za firme' : 'Prijava'}
      subtitle={business ? 'Prijavite firmu i poručite uplatu pazara, dostavu dokumenata i ostale usluge za firme.' : 'Prijavite se i adresa za dostavu je već upisana.'}
    >
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Telefon ili email" name="login" autoComplete="username" inputMode="email" required placeholder={business ? 'telefon ili email firme' : '064 123 4567'} />
        <PasswordField autoComplete="current-password" />
        <FormError>{error}</FormError>
        <Button type="submit" disabled={busy} arrow className="mt-1 w-full">
          {busy ? 'Prijavljivanje...' : business ? 'Prijavi firmu' : 'Prijavi se'}
        </Button>
      </form>
      <p className="mt-6 border-t border-line pt-5 text-center text-[15px] text-deep/80">
        {business ? 'Firma nema nalog?' : 'Nemate nalog?'}{' '}
        <Link href={registerHref} className="font-bold text-red underline underline-offset-4">
          {business ? 'Registrujte firmu' : 'Registrujte se'}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-mute">Zaboravili ste lozinku? Pozovite nas, pomoći ćemo.</p>
      <OtherKindLink business={business} />
    </Card>
  )
}

/** Ispod forme: veza ka prijavi za drugu vrstu naloga (kupci / firme). */
function OtherKindLink({ business }) {
  return (
    <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-center text-sm text-deep/80">
      {business ? 'Niste firma? ' : 'Firma ste i treba vam uplata pazara ili dostava dokumenata? '}
      <Link href={business ? '/prijava' : '/firme/prijava'} className="font-bold text-ink underline underline-offset-4">
        {business ? 'Prijava za kupce' : 'Prijava za firme'}
      </Link>
    </p>
  )
}

export function RegisterPage({ next, business = false }) {
  usePageTitle(business ? 'Registracija firme' : 'Registracija')
  useRedirectIfLoggedIn(business ? next || BUSINESS_HOME : next)
  const { register } = useAuth()
  const [place, setPlace] = useState('')
  const { error, busy, onSubmit } = useSubmit(async (f) => {
    const data = Object.fromEntries(f)
    if (!data.place) throw new Error('Izaberite mesto: Negotin ili selo u kome živite.')
    if (!isValidPhone(data.phone)) throw new Error('Broj telefona nije ispravan (npr. 064 123 4567).')
    if (data.password.length < 8) throw new Error('Lozinka mora imati bar 8 znakova.')
    if (business) {
      if (!/^\d{9}$/.test(data.pib.replace(/\s/g, ''))) throw new Error('PIB mora imati tačno 9 cifara.')
      if (!/^\d{8}$/.test(data.mb.replace(/\s/g, ''))) throw new Error('Matični broj mora imati tačno 8 cifara.')
    }
    await register(business ? { ...data, kind: 'firma' } : data)
  })
  const loginHref = `${business ? '/firme/prijava' : '/prijava'}${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <Card
      wide
      title={business ? 'Registracija firme' : 'Napravite nalog'}
      subtitle={
        business
          ? 'Nalog za radnje, lokale i kancelarije: uplata pazara, dokumenta, plaćanje računa i paketi. Podatke firme upišete jednom, a posle samo poručujete.'
          : 'Jednom upišete adresu, a posle samo birate šta želite. Adresu uvek možete promeniti pri porudžbini.'
      }
    >
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        {business && (
          <>
            <Field className="sm:col-span-2" label="Naziv firme" name="company" autoComplete="organization" required maxLength={120} placeholder="npr. Cvećara Cuca" />
            <Field label="PIB" name="pib" inputMode="numeric" required maxLength={11} placeholder="9 cifara" />
            <Field label="Matični broj" name="mb" inputMode="numeric" required maxLength={10} placeholder="8 cifara" />
          </>
        )}
        <Field label={business ? 'Ime kontakt osobe' : 'Ime'} name="name" autoComplete="given-name" required maxLength={60} />
        <Field label={business ? 'Prezime kontakt osobe' : 'Prezime'} name="surname" autoComplete="family-name" required maxLength={60} />
        <Field label="Telefon" name="phone" type="tel" autoComplete="tel" required placeholder="064 123 4567" hint="Na ovaj broj zovemo da potvrdimo porudžbinu." />
        <Field label="Email" name="email" type="email" autoComplete="email" required maxLength={120} placeholder={business ? 'firma@gmail.com' : 'ime@gmail.com'} />
        <div className="sm:col-span-2">
          <PlaceField value={place} onChange={setPlace} />
        </div>
        <Field
          className="sm:col-span-2"
          label={business ? 'Adresa firme (ulica i broj)' : 'Ulica i broj'}
          name="address"
          autoComplete="street-address"
          required
          maxLength={200}
          placeholder={place && place !== 'Negotin' ? 'Ulica i broj ili opis kuće (npr. kod škole, zelena kapija)' : 'npr. Hajduk Veljkova 10'}
          hint="Ako živite na selu, mesto izaberite gore, a ovde upišite ulicu ili opis kuće."
        />
        <Field className="sm:col-span-2" label="Dodatno o adresi (nije obavezno)" name="addressNote" maxLength={200} placeholder="Sprat, stan, interfon, zelena kapija..." />
        <div className="sm:col-span-2">
          <PasswordField autoComplete="new-password" hint="Najmanje 8 znakova." minLength={8} />
        </div>
        <div className="grid gap-4 sm:col-span-2">
          <FormError>{error}</FormError>
          <Button type="submit" disabled={busy} arrow className="w-full">
            {busy ? 'Pravim nalog...' : business ? 'Registruj firmu' : 'Registruj se'}
          </Button>
        </div>
      </form>
      <p className="mt-6 border-t border-line pt-5 text-center text-[15px] text-deep/80">
        Već imate nalog?{' '}
        <Link href={loginHref} className="font-bold text-red underline underline-offset-4">
          Prijavite se
        </Link>
      </p>
      {business && (
        <p className="mt-4 text-center text-sm text-deep/80">
          Već imate nalog kao fizičko lice?{' '}
          <Link href="/prijava?next=%2Fnalog%23firma" className="font-bold text-ink underline underline-offset-4">
            Prijavite se i dodajte firmu
          </Link>{' '}
          u svoj nalog, pa birate na koju adresu dostavljamo.
        </p>
      )}
      <OtherKindLink business={business} />
    </Card>
  )
}

function PasswordField(props) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Field label="Lozinka" name="password" type={show ? 'text' : 'password'} required {...props} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2 top-[34px] rounded px-2 py-1.5 text-sm font-semibold text-deep/70 hover:text-red"
      >
        {show ? 'Sakrij' : 'Prikaži'}
      </button>
    </div>
  )
}
