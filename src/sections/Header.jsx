import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV } from '../data'
import { EASE } from '../lib/order'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { Link, SectionLink, isOrderingPath, useRoute } from '../lib/router'
import { AddressBar } from '../components/Address'
import Radio from '../components/Radio'
import logo from '../assets/logo.png'

export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const { user } = useAuth()
  const cart = useCart()
  // na podstranicama linkovi ka delovima početne idu preko /
  const { path } = useRoute()
  const home = path === '/' ? '' : '/'
  const account = user ? { href: '/nalog', label: user.name } : { href: '/prijava', label: 'Prijava' }

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="fixed inset-x-0 top-0 z-20 border-b border-white/10 bg-ink text-white pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-x-2 px-4 sm:gap-x-3 sm:px-6">
        {home ? (
          <Link href="/" onClick={close} className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[15px] min-[400px]:text-[17px] sm:gap-2.5 sm:text-[25px]">
            <Logo />
          </Link>
        ) : (
          <a href="#pocetna" onClick={close} className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[15px] min-[400px]:text-[17px] sm:gap-2.5 sm:text-[25px]">
            <Logo />
          </a>
        )}

        <nav aria-label="Glavna navigacija" className="hidden gap-0.5 xl:flex">
          {NAV.map((link) => (
            <SectionLink key={link.href} hash={link.href} className="navlink">
              {link.label}
            </SectionLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Radio />
          <Link
            href={account.href}
            aria-label={user ? `Moj nalog (${user.name})` : 'Prijava'}
            className="hidden h-11 items-center gap-2 rounded-lg border border-white/35 px-3 font-semibold text-white transition hover:bg-white/10 sm:flex"
          >
            <UserIcon />
            <span className="max-w-[10ch] truncate">{user === undefined ? '' : account.label}</span>
          </Link>
          <Link href="/korpa" aria-label={`Korpa, ${cart.count} stavki`} className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/35 text-white transition hover:bg-white/10 sm:h-11 sm:w-11">
            <BagIcon />
            {!cart.isEmpty && (
              // "skoči" svaki put kad se doda stavka
              <motion.span
                key={cart.count}
                initial={{ scale: 1.7 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-[11px] font-extrabold text-white"
              >
                {cart.count || '•'}
              </motion.span>
            )}
          </Link>
          <Link href="/naruci" className="btn btn-primary hidden px-5 py-3 text-[15px] lg:inline-flex">
            Naruči
          </Link>

          {/* meni za telefon */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobilni-meni"
            aria-label={open ? 'Zatvori meni' : 'Otvori meni'}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/35 sm:h-11 sm:w-11 xl:hidden"
          >
            <span className="relative block h-3.5 w-5" aria-hidden="true">
              <span className={`absolute left-0 h-0.5 w-5 rounded bg-white transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 h-0.5 w-5 rounded bg-white transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      {isOrderingPath(path) && <AddressBar />}

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobilni-meni"
            aria-label="Meni"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-white/15 xl:hidden"
          >
            <ul className="grid gap-1 px-5 py-3">
              <li>
                <Link href="/naruci" onClick={close} className="block rounded-lg bg-red px-3 py-3 text-lg font-bold text-white">
                  Naruči
                </Link>
              </li>
              {NAV.map((link) => (
                <li key={link.href}>
                  <SectionLink hash={link.href} onClick={close} className="block rounded-lg px-3 py-3 text-lg font-semibold hover:bg-white/10">
                    {link.label}
                  </SectionLink>
                </li>
              ))}
              <li className="border-t border-white/15 pt-1 sm:hidden">
                <Link href={account.href} onClick={close} className="flex items-center gap-2 rounded-lg px-3 py-3 text-lg font-semibold hover:bg-white/10">
                  <UserIcon />
                  {user ? `Moj nalog (${user.name})` : 'Prijava / registracija'}
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

function Logo() {
  return (
    <>
      <img src={logo} alt="" width="44" height="44" className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
      <span>
        <span className="hero-title font-body uppercase text-white">
          Beep Beep <span className="text-red">Dostava</span>
        </span>
      </span>
    </>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  )
}
