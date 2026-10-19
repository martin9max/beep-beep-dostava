import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import Photo from '../components/Photo'
import { motion } from 'framer-motion'

const PARAGRAPHS = [
  'Krenuli smo 5. decembra 2020. godine, usred zime i usred pandemije, kada su nam svi govorili da Negotinu dostava ne treba. Danas niko ne pita da li treba. Pitaju samo koliko brzo stižemo.',
  'Naša tajna nije nikakva tajna: termo kutija. Pica stiže topla, sladoled stiže hladan, a torta stiže onakva kakvu ste je naručili. Ako vam je neko doneo mlaku pljeskavicu i rekao da je to normalno, slagao vas je.',
  'Vozimo po Negotinu, po selima i dalje, gde god vas put odvede. Vi samo pozovite. Ostalo je naš posao.',
]

const FACTS = [
  ['2020.', 'vozimo od 5. decembra'],
  ['5,0', 'ocena na Google-u'],
  ['Termo', 'kutija u svakoj vožnji'],
]

export default function About() {
  return (
    <section id="o-nama" className="py-[72px] md:py-[110px]">
      <div className="mx-auto max-w-[1120px] px-6">
        <SectionTitle>O nama</SectionTitle>
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div className="space-y-5 text-lg text-deep/80">
            {PARAGRAPHS.map((text, i) => (
              <Reveal key={i} as="p" delay={i * 0.12} className="max-w-[46ch]">
                {text}
              </Reveal>
            ))}
            <Reveal as="dl" delay={0.36} className="grid max-w-[46ch] grid-cols-3 gap-4 border-t border-line pt-6">
              {FACTS.map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="text-sm leading-snug text-mute">{label}</dt>
                  <dd className="font-serif text-3xl font-bold text-red">{value}</dd>
                </div>
              ))}
            </Reveal>
          </div>
          {/* fotografija se otkriva odozgo nadole kad uđe u ekran */}
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Photo name="about" label="dostavljač na poslu" alt="Beep Beep dostavljač" className="aspect-[4/3] rounded md:aspect-[4/5]" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
