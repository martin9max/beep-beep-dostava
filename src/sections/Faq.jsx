import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import Button from '../components/Button'
import { FAQ_GROUPS } from '../data'

export default function Faq() {
  // prvo pitanje je otvoreno odmah
  const [open, setOpen] = useState('0-0')
  return (
    <section id="pitanja" className="border-y border-line bg-white py-[72px] md:py-[110px]">
      <div className="mx-auto grid max-w-[1120px] gap-10 px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionTitle>Česta pitanja</SectionTitle>
          <Reveal as="p" className="-mt-4 max-w-[34ch] text-lg text-deep/75">
            Niste našli odgovor? Pitajte nas direktno, odgovaramo brže nego što kurir stigne do vas.
          </Reveal>
          <Reveal delay={0.1} className="mt-6">
            <Button as="a" href="#kontakt" arrow className="px-6 py-3.5">
              Pitajte nas
            </Button>
          </Reveal>
        </div>

        <div className="grid gap-10">
          {FAQ_GROUPS.map(([group, items], g) => (
            <div key={group}>
              <Reveal as="h3" className="mb-4 font-body text-sm font-bold uppercase tracking-[.2em] text-red">
                {group}
              </Reveal>
              <div className="space-y-2.5">
                {items.map(([question, answer], i) => {
                  const id = `${g}-${i}`
                  const isOpen = open === id
                  return (
                    <Reveal key={question} delay={i * 0.06} y={16}>
                      <div className={`overflow-hidden rounded border bg-paper transition-colors ${isOpen ? 'border-ink/50' : 'border-line'}`}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? null : id)}
                          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-bold transition-colors hover:text-ink"
                        >
                          {question}
                          <motion.span
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.25 }}
                            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xl leading-none transition-colors ${
                              isOpen ? 'bg-red text-white' : 'bg-white text-red'
                            }`}
                            aria-hidden="true"
                          >
                            +
                          </motion.span>
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.28 }}
                              className="overflow-hidden"
                            >
                              <p className="px-5 pb-5 text-deep/80">{answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Reveal>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
