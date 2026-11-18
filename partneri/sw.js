// Servisna skripta panela "Beep Beep partneri": prikazuje obaveštenje o novoj porudžbini u uglu ekrana i kad
// lokal nije na stranici panela (drugi sajt, zatvorena kartica, umanjen pregledač). Klik otvara panel.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {}
  event.waitUntil(
    // ako lokal upravo gleda panel, stranica sama pušta zvuk i prikazuje porudžbinu: obaveštenje nije potrebno
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.some((c) => c.focused && c.visibilityState === 'visible')) return
      return self.registration.showNotification(data.title || 'Beep Beep: nova porudžbina', {
      body: data.body || '',
      tag: data.tag,
      renotify: true,
      requireInteraction: true, // ostaje na ekranu dok ga lokal ne klikne
      icon: '/favicon-96.png',
      data: { url: data.url || self.registration.scope },
      })
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || self.registration.scope, self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const open = list.find((c) => c.url.startsWith(url))
      return open ? open.focus() : self.clients.openWindow(url)
    }),
  )
})
