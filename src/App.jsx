import { MotionConfig } from 'framer-motion'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { AuthProvider } from './lib/auth'
import { CartProvider } from './lib/cart'
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
import OrderPage from './pages/OrderPage'
import ShopPage from './pages/ShopPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import NotFound from './pages/NotFound'
import { LoginPage, RegisterPage } from './pages/AuthPages'

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
    case 'nalog':
      return <AccountPage />
    default:
      return <NotFound />
  }
}

export default function App() {
  useSmoothScroll()
  const { path, query } = useRoute()

  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <CartProvider>
          <Header />
          {path === '/' ? (
            <main>
              <Hero />
              <About />
              <Services />
              <Reviews />
              <Faq />
              <Contact />
            </main>
          ) : (
            <PageShell>
              <Page path={path} query={query} />
            </PageShell>
          )}
          <Footer />
          <CartBar />
        </CartProvider>
      </AuthProvider>
    </MotionConfig>
  )
}
