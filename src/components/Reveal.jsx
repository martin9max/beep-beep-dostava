import { motion } from 'framer-motion'
import { EASE } from '../lib/order'

/** Ulazi u kadar (fade + pomeraj) kada se skroluje do njega. */
export default function Reveal({ as = 'div', delay = 0, y = 24, className, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  )
}
