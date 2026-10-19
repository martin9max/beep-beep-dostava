import { motion } from 'framer-motion'
import Reveal from './Reveal'
import { EASE } from '../lib/order'

export default function SectionTitle({ children, center = false }) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <Reveal as="h2" className="text-[clamp(34px,5.2vw,60px)] font-bold tracking-tight">
        {children}
      </Reveal>
      <motion.span
        className={`mt-4 block h-1 w-14 bg-red ${center ? 'mx-auto origin-center' : 'origin-left'}`}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
      />
    </div>
  )
}
