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
          <SectionTitle>Šta kažu mušterije</SectionTitle>
          <Reveal className="mb-12 flex items-center gap-3">
            <b className="font-serif text-4xl leading-none">{RATING.score}</b>
            <span>
              <Stars />
              <span className="mt-1 block text-sm text-mute">{RATING.count} recenzije na Google-u</span>
            </span>
          </Reveal>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.name} as="li" delay={i * 0.12} className="h-full">
              <figure className="flex h-full flex-col rounded border border-line bg-white p-7 shadow-[0_24px_40px_-32px_rgba(22,115,196,.5)]">
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
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded bg-ink px-6 py-5 text-white sm:px-8">
          <p className="text-lg font-semibold">Vozili smo i vama? Recite i drugima kako je bilo.</p>
          <Button as="a" href={REVIEWS_URL} target="_blank" rel="noopener noreferrer" arrow className="px-6 py-3.5">
            Ostavi recenziju
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
