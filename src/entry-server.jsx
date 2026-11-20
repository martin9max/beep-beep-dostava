import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { prerenderToNodeStream } from 'react-dom/static'
import App from './App'
import { FAQ, PHONE, SITE } from './data'
import { setServerHref } from './lib/router'

export { indexedPaths, pageMeta } from './seo'

/**
 * HTML jedne strane za pretraživače (pravi se pri buildu, vidi scripts/prerender.mjs).
 * Početna se pravi odmah (pregledač je "oživi"), a ostale strane čekaju da se učitaju njihovi delovi
 * (podstranice se učitavaju posebno), da bi u HTML-u bio ceo sadržaj, npr. ceo meni lokala.
 */
export async function render(url = '/') {
  setServerHref(url)
  const app = (
    <StrictMode>
      <App />
    </StrictMode>
  )
  if (url === '/') return renderToString(app)
  const { prelude } = await prerenderToNodeStream(app)
  let html = ''
  for await (const chunk of prelude) html += chunk
  return html
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
    image: `${siteUrl}/og-logo.png`,
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
