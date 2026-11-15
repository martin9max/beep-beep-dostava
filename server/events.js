// Obaveštenja unutar servera: kad stigne porudžbina (ili je vlasnik pusti, ili otkaže), panel za lokale to
// odmah javlja otvorenim stranicama lokala (vidi /api/stream u partneri/server.js), bez čekanja i osvežavanja.
import { EventEmitter } from 'node:events'

export const events = new EventEmitter()
events.setMaxListeners(0) // svaka otvorena stranica lokala je jedan slušalac

/** Javi lokalima (po slug-u) da imaju novu ili promenjenu porudžbinu. */
export const ordersChanged = (slugs) => events.emit('orders', slugs)
