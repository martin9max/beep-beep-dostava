import Button from '../components/Button'
import { Link } from '../lib/router'
import { usePageTitle } from './PageShell'

export default function NotFound() {
  usePageTitle('Stranica ne postoji')
  return (
    <div className="mx-auto max-w-[560px] px-5 py-24 text-center">
      <p className="text-6xl" aria-hidden="true">🛵💨</p>
      <h1 className="mt-6 text-[40px] font-bold">Ovde nema ničega</h1>
      <p className="mt-2 text-lg text-deep/75">Kurir je prošao, ali ovu stranicu nije našao.</p>
      <Button as={Link} href="/" arrow className="mt-8">
        Na početnu
      </Button>
    </div>
  )
}
