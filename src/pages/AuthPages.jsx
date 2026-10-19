import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Field, { FormError } from '../components/Field'
import { useAuth } from '../lib/auth'
import { Link, navigate } from '../lib/router'
import { isValidPhone } from '../lib/order'
import { PlaceField } from '../components/Address'
import { Card, usePageTitle } from './PageShell'

// posle prijave vraća tamo odakle je kupac došao (npr. /korpa), samo unutar sajta
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

export function LoginPage({ next }) {
  usePageTitle('Prijava')
  useRedirectIfLoggedIn(next)
  const { login } = useAuth()
  const { error, busy, onSubmit } = useSubmit((f) => login(f.get('login'), f.get('password')))
  const registerHref = `/registracija${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <Card title="Prijava" subtitle="Prijavite se i adresa za dostavu je već upisana.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Telefon ili email" name="login" autoComplete="username" inputMode="email" required placeholder="064 123 4567" />
        <PasswordField autoComplete="current-password" />
        <FormError>{error}</FormError>
        <Button type="submit" disabled={busy} arrow className="mt-1 w-full">
          {busy ? 'Prijavljivanje...' : 'Prijavi se'}
        </Button>
      </form>
      <p className="mt-6 border-t border-line pt-5 text-center text-[15px] text-deep/80">
        Nemate nalog?{' '}
        <Link href={registerHref} className="font-bold text-red underline underline-offset-4">
          Registrujte se
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-mute">Zaboravili ste lozinku? Pozovite nas, pomoći ćemo.</p>
    </Card>
  )
}

export function RegisterPage({ next }) {
  usePageTitle('Registracija')
  useRedirectIfLoggedIn(next)
  const { register } = useAuth()
  const [place, setPlace] = useState('')
  const { error, busy, onSubmit } = useSubmit(async (f) => {
    const data = Object.fromEntries(f)
    if (!data.place) throw new Error('Izaberite mesto: Negotin ili selo u kome živite.')
    if (!isValidPhone(data.phone)) throw new Error('Broj telefona nije ispravan (npr. 064 123 4567).')
    if (data.password.length < 8) throw new Error('Lozinka mora imati bar 8 znakova.')
    await register(data)
  })
  const loginHref = `/prijava${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <Card wide title="Napravite nalog" subtitle="Jednom upišete adresu, a posle samo birate šta želite. Adresu uvek možete promeniti pri porudžbini.">
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <Field label="Ime" name="name" autoComplete="given-name" required maxLength={60} />
        <Field label="Prezime" name="surname" autoComplete="family-name" required maxLength={60} />
        <Field label="Telefon" name="phone" type="tel" autoComplete="tel" required placeholder="064 123 4567" hint="Na ovaj broj zovemo da potvrdimo porudžbinu." />
        <Field label="Email" name="email" type="email" autoComplete="email" required maxLength={120} placeholder="ime@gmail.com" />
        <div className="sm:col-span-2">
          <PlaceField value={place} onChange={setPlace} />
        </div>
        <Field
          className="sm:col-span-2"
          label="Ulica i broj"
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
            {busy ? 'Pravim nalog...' : 'Registruj se'}
          </Button>
        </div>
      </form>
      <p className="mt-6 border-t border-line pt-5 text-center text-[15px] text-deep/80">
        Već imate nalog?{' '}
        <Link href={loginHref} className="font-bold text-red underline underline-offset-4">
          Prijavite se
        </Link>
      </p>
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
