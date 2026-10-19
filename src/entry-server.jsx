import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { FAQ, PHONE, SITE } from './data'

/** HTML stranice za pretraživače (pravi se pri buildu, vidi scripts/prerender.mjs). */
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

/** Structured data (schema.org) za Google: firma i česta pitanja. */
export function structuredData(siteUrl) {
  const business = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#firma`,
    name: SITE.name,
    description: SITE.description,
    url: `${siteUrl}/`,
    telephone: `+381${PHONE.replace(/\s/g, '').replace(/^0/, '')}`,
    image: `${siteUrl}/og-image.png`,
    logo: `${siteUrl}/icon-512.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.city,
      postalCode: SITE.postalCode,
      addressCountry: 'RS',
    },
    areaServed: [
      { '@type': 'City', name: SITE.city },
      { '@type': 'Place', name: 'Okolna sela Negotina' },
    ],
    paymentAccepted: 'Gotovina',
    currenciesAccepted: 'RSD',
  }
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
  return [business, faq]
}
