import { AnimatePresence, motion } from 'framer-motion'
import { Link, useRoute } from '../lib/router'
import { useCart } from '../lib/cart'
import { EASE, formatDin } from '../lib/order'

/** Traka na dnu ekrana sa stanjem korpe, vidi se na stranicama za naručivanje. */
export default function CartBar() {
  const cart = useCart()
  const { path } = useRoute()
  const show = !cart.isEmpty && (path.startsWith('/naruci') || path.startsWith('/lokal'))

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120 }}
          animate={{ y: 0 }}
          exit={{ y: 120 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]"
        >
          <Link
            href="/korpa"
            className="btn btn-primary mx-auto flex w-full max-w-[640px] justify-between gap-3 rounded-xl px-5 py-4 shadow-[0_18px_40px_-14px_rgba(215,30,40,.8)]"
          >
            <span className="flex items-center gap-3">
              <motion.span
                key={cart.count}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="grid h-8 min-w-8 place-items-center rounded-full bg-white px-2 text-sm font-extrabold text-red"
              >
                {cart.count || '✎'}
              </motion.span>
              <span className="text-left leading-tight">
                Pregled porudžbine
                <span className="block text-[13px] font-semibold text-white/85">
                  {cart.shops.length === 1 ? cart.shops[0].shop.name : `${cart.shops.length} lokala`}
                </span>
              </span>
            </span>
            <span className="text-right">
              {formatDin(cart.total)} din
              {cart.hasUnpriced && <span className="block text-[12px] font-semibold text-white/85">+ po računu</span>}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
