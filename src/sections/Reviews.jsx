import { useEffect, useRef, useState } from 'react'
import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import Button from '../components/Button'
import { RATING, REVIEWS, REVIEWS_URL } from '../data'

function Stars({ className = '' }) {
  return (
    <span className={`flex gap-0.5 text-[#f5b301] ${className}`} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  )
}

export default function Reviews() {
  return (
    <section id="recenzije" className="py-[72px] md:py-[110px]">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-2">
          <SectionTitle>Šta kažete Vi</SectionTitle>
          <Reveal className="mb-12 flex items-center gap-3">
            <b className="font-serif text-4xl leading-none">{RATING.score}</b>
            <span>
              <Stars />
              <span className="mt-1 block text-sm text-mute">{RATING.count} recenzije na Google-u</span>
            </span>
          </Reveal>
        </div>

        <ReviewSlider />

        <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded bg-ink px-6 py-5 text-white sm:px-8">
          <p className="text-lg font-semibold">Vaš utisak i iskustvo sa nama</p>
          <Button as="a" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" arrow className="px-6 py-3.5">
            Ostavi recenziju
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

// koliko dugo stoji jedna recenzija pre nego što traka pređe na sledeću: na telefonu 3 sekunde,
// na računaru (gde se vide tri odjednom) malo duže
const AUTO_MS = { phone: 3000, desktop: 4500 }

/**
 * Traka recenzija: na telefonu se vidi jedna, na računaru tri. Sama prelazi za po jednu recenziju,
 * a može i prstom (prevlačenjem) ili strelicama. Dok prst drži traku, ne pomera se sama; posle klika ili
 * prevlačenja odbrojavanje do sledeće kreće iz početka (miš preko trake je ne zaustavlja).
 */
function ReviewSlider() {
  const track = useRef(null)
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState(0)

  // pomeraj do recenzije broj `index` (posle poslednje ide ponovo prva)
  const goTo = (index) => {
    const el = track.current
    const cards = el?.children
    if (!cards?.length) return
    const perView = Math.max(1, Math.round(el.clientWidth / cards[0].offsetWidth))
    const last = cards.length - perView
    const next = index > last ? 0 : index < 0 ? last : index
    el.scrollTo({ left: cards[next].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' })
  }

  // koja je recenzija prva u kadru (za tačkice ispod)
  const onScroll = () => {
    const el = track.current
    const step = el.children[0].offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0)
    setActive(Math.round(el.scrollLeft / step))
  }

  // samostalno pomeranje, osim ako posetilac ne želi animacije ili ako je traka van ekrana
  useEffect(() => {
    if (paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      const el = track.current
      const rect = el?.getBoundingClientRect()
      if (!rect || rect.bottom < 0 || rect.top > innerHeight || document.hidden) return
      goTo(active + 1)
    }, matchMedia('(min-width: 768px)').matches ? AUTO_MS.desktop : AUTO_MS.phone)
    return () => clearInterval(timer)
  }, [paused, active])

  return (
    <Reveal>
      <div
        className="relative"
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 1500)}
      >
        <ul
          ref={track}
          onScroll={onScroll}
          aria-label="Recenzije kupaca"
          className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.map((review) => (
            <li key={review.name} className="w-full shrink-0 snap-start md:w-[calc((100%-48px)/3)]">
              <figure className="flex h-full flex-col rounded border border-line bg-white p-7 shadow-[0_24px_40px_-32px_rgba(13,47,128,.5)]">
                <Stars className="mb-5" />
                <blockquote className="flex-1 text-lg leading-relaxed">„{review.text}“</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-bold text-white">
                    {review.name[0]}
                  </span>
                  <span>
                    <b className="block leading-tight">{review.name}</b>
                    <span className="text-sm text-mute">Google recenzija</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {/* strelice i tačkice */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <SlideButton label="Prethodna recenzija" onClick={() => goTo(active - 1)}>
            <path d="M15 5l-7 7 7 7" />
          </SlideButton>
          <div className="flex gap-1.5" aria-hidden="true">
            {REVIEWS.map((review, i) => (
              <span key={review.name} className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-red' : 'w-2 bg-line'}`} />
            ))}
          </div>
          <SlideButton label="Sledeća recenzija" onClick={() => goTo(active + 1)}>
            <path d="M9 5l7 7-7 7" />
          </SlideButton>
        </div>
      </div>
    </Reveal>
  )
}

function SlideButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-deep transition hover:border-red hover:text-red"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
