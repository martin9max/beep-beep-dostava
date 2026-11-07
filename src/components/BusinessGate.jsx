import { isBusiness, useAuth } from '../lib/auth'
import { Link, navigate } from '../lib/router'

/**
 * Usluge za firme (uplata pazara, dokumenta...) vide i poručuju samo nalozi firmi.
 * Dok se proverava prijava, ne prikazuje se ništa. Neprijavljeni dobijaju prijavu ili registraciju firme,
 * a prijavljeni kupac (običan nalog) poruku da je ovo samo za firme. Posle prijave firma se vraća
 * tačno na stranicu sa koje je krenula (`next`).
 */
export default function BusinessGate({ next, children }) {
  const { user, logout } = useAuth()
  if (user === undefined) return <div className="min-h-[240px]" aria-busy="true" />
  if (isBusiness(user)) return children

  const query = `?next=${encodeURIComponent(next)}`
  const switchTo = (href) => async () => {
    await logout()
    navigate(href)
  }
  return (
    <section className="mx-auto mt-8 max-w-[620px] rounded-2xl border border-line bg-white p-7 text-center shadow-[0_24px_40px_-32px_rgba(13,47,128,.5)] sm:p-10">
      <span aria-hidden="true" className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red/10 text-4xl">
        💼
      </span>
      <h2 className="mt-5 text-[28px] font-bold leading-tight">Usluge za firme</h2>
      {user ? (
        <>
          <p className="mx-auto mt-3 max-w-[46ch] text-deep/75">
            Prijavljeni ste kao kupac ({user.name}). Uplatu pazara, dokumenta i ostale usluge za firme mogu da poruče samo nalozi firmi.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={switchTo(`/firme/prijava${query}`)} className="btn btn-primary px-6 py-3">
              Odjavi se i prijavi firmu
            </button>
            <button type="button" onClick={switchTo(`/firme/registracija${query}`)} className="btn btn-ghost px-6 py-3">
              Registruj firmu
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mx-auto mt-3 max-w-[46ch] text-deep/75">
            Uplatu pazara, dokumenta, plaćanje računa i ostale usluge za firme vide i poručuju samo registrovane firme. Prijavite firmu ili je
            registrujte, pa nastavite ovde.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={`/firme/prijava${query}`} className="btn btn-primary px-6 py-3">
              Prijava firme
            </Link>
            <Link href={`/firme/registracija${query}`} className="btn btn-ghost px-6 py-3">
              Registracija firme
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
