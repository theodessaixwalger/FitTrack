// Service worker FitTrack : affiche les notifications push.
// Pas de cache hors ligne ici, volontairement : il servirait d'anciens
// fichiers après un déploiement.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data?.text() }
  }

  const title = payload.title || 'FitTrack'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: payload.tag,
      data: { url: payload.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // App déjà ouverte : on la ramène au premier plan sur la bonne page
      const client = clients.find((c) => c.url.startsWith(self.location.origin))
      if (client) {
        return client.focus().then((focused) => focused.navigate?.(url) ?? focused)
      }
      return self.clients.openWindow(url)
    })
  )
})
