// Poruke na Telegram (koriste ih sajt i panel za lokale).

/**
 * Poruke na Telegram, preko istog bota, različitim ljudima:
 *   'orders'   -> TELEGRAM_ORDERS_CHAT_ID   (vlasnik: nove porudžbine)
 *   'accounts' -> TELEGRAM_ACCOUNTS_CHAT_ID (administrator sajta: novi korisnici, problemi sa prijavom)
 * `buttons` (nije obavezno): dugmad sa linkovima ispod poruke (npr. WhatsApp kupcu sa gotovom porukom).
 * U svakom može više chat id-jeva odvojenih zarezom. Bez tokena ili chat id-ja poruka se ne šalje.
 */
export async function notify(kind, message, buttons) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const key = kind === 'orders' ? 'TELEGRAM_ORDERS_CHAT_ID' : 'TELEGRAM_ACCOUNTS_CHAT_ID'
  const chats = (process.env[key] || '').split(',').map((c) => c.trim()).filter(Boolean)
  if (!token || !chats.length) return
  await Promise.all(
    chats.map(async (chat) => {
      try {
        const send = (markup) =>
          fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chat, text: message, ...(markup && { reply_markup: markup }) }),
          })
        let res = await send(buttons)
        // ako Telegram odbije dugmad (npr. predugačka), porudžbina ipak mora da stigne, makar bez dugmadi
        if (!res.ok && buttons) {
          console.error(`Telegram (${chat}) odbio dugmad:`, (await res.text()).slice(0, 200))
          res = await send(null)
        }
        if (!res.ok) console.error(`Telegram (${chat}) nije uspeo:`, (await res.text()).slice(0, 200))
      } catch (err) {
        console.error(`Telegram (${chat}) nije uspeo:`, err.message)
      }
    }),
  )
}
