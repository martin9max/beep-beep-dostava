import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { prerenderToNodeStream } from 'react-dom/static'
import App from './App'
import { BUSINESS, FAQ, PHONE, SERVICES, SITE, SOCIAL } from './data'
import { VILLAGES } from './places'
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
    alternateName: ['Beep Beep Dostava', 'Beep Beep dostava Negotin', 'Beep Beep', 'Dostava Negotin Beep Beep'],
    foundingDate: '2020-12-05',
    sameAs: Object.values(SOCIAL).filter(Boolean),
    description: SITE.description,
    url: `${siteUrl}/`,
    telephone: `+381${PHONE.replace(/\s/g, '').replace(/^0/, '')}`,
    image: `${siteUrl}/og-logo.png`,
    logo: `${siteUrl}/icon-512.png`,
    address: {
      '@type': 'PostalAddress',
      ...(BUSINESS.address && { streetAddress: BUSINESS.address.replace(/,\s*Negotin$/, '') }),
      addressLocality: SITE.city,
      postalCode: SITE.postalCode,
      addressCountry: 'RS',
    },
    areaServed: [
      { '@type': 'City', name: SITE.city },
      ...VILLAGES.map((name) => ({ '@type': 'Place', name })),
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Dostava u Negotinu',
      itemListElement: SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, serviceType: 'Dostava', areaServed: SITE.city, url: `${siteUrl}/naruci/${s.key}` },
      })),
    },
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
  // naziv sajta koji Google prikazuje iznad rezultata (umesto samo "beepbeepdostava.rs")
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#sajt`,
    name: 'Beep Beep Dostava',
    alternateName: ['Beep Beep Dostava Negotin', 'beepbeepdostava.rs'],
    url: `${siteUrl}/`,
    inLanguage: 'sr-Latn-RS',
    publisher: { '@id': `${siteUrl}/#firma` },
  }
  return [business, website, faq]
}
