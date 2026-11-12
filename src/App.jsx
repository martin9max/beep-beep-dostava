import { Suspense, lazy } from 'react'
import { MotionConfig, motion } from 'framer-motion'
import { EASE } from './lib/order'
import { AuthProvider } from './lib/auth'
import { CartProvider } from './lib/cart'
import { RadioProvider } from './lib/radio'
import { useRoute } from './lib/router'
import Header from './sections/Header'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Reviews from './sections/Reviews'
import Contact from './sections/Contact'
import Faq from './sections/Faq'
import Footer from './sections/Footer'
import CartBar from './components/CartBar'
import PageShell from './pages/PageShell'
import NotFound from './pages/NotFound'

// podstranice se učitavaju tek kad se otvore, da početna bude brža
const OrderPage = lazy(() => import('./pages/OrderPage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const RadioPage = lazy(() => import('./pages/RadioPage'))
const LoginPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.RegisterPage })))

/** Koja stranica se prikazuje za koju adresu. */
function Page({ path, query }) {
  const [, first, second] = path.split('/')
  const next = query.get('next')
  switch (first) {
    case '':
      return null
    case 'naruci':
      return <OrderPage service={second} category={query.get('k')} />
    case 'lokal':
      return <ShopPage key={second} slug={second} category={query.get('k')} />
    case 'korpa':
      return <CheckoutPage />
    case 'prijava':
      return <LoginPage next={next} />
    case 'registracija':
      return <RegisterPage next={next} />
    case 'firme':
      // prijava i registracija firmi (usluge za firme)
      if (second === 'prijava') return <LoginPage key="firma" next={next} business />
      if (second === 'registracija') return <RegisterPage key="firma" next={next} business />
      return <NotFound />
    case 'nalog':
      return <AccountPage />
    case 'radio':
      return <RadioPage />
    default:
      return <NotFound />
  }
}

export default function App() {
  const { path, query } = useRoute()

  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CartProvider>
          <RadioProvider>
            <Header />
            {path === '/' ? (
              <main>
                <Hero />
                <Services />
                <About />
                <Reviews />
                <Faq />
                <Contact />
              </main>
            ) : (
              <PageShell>
                {/* blag prelaz između stranica: nova stranica uđe odozdo umesto da samo "iskoči" */}
                <motion.div key={path} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                  <Suspense fallback={<div className="min-h-[60vh]" />}>
                    <Page path={path} query={query} />
                  </Suspense>
                </motion.div>
              </PageShell>
            )}
            <Footer />
            <CartBar />
          </RadioProvider>
        </CartProvider>
      </AuthProvider>
    </MotionConfig>
  )
}
