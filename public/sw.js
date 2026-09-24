/*
 * Service worker de FollowYourMoney : notifications push uniquement.
 * Pas de cache hors ligne (les chiffres doivent toujours venir du serveur).
 * Contenu d'un message (envoyé par le back, PushService) : { title, body, link, tag }.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'FollowYourMoney', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'FollowYourMoney';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    tag: data.tag || undefined,
    data: { link: data.link || '/' },
    lang: 'fr',
  }));
});

// Clic : réutilise un onglet ouvert de l'app (navigation vers le lien), sinon en ouvre un
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const client = windows.find(w => new URL(w.url).origin === self.location.origin);
    if (client) {
      await client.focus();
      client.postMessage({ type: 'fym:navigate', url });
      return;
    }
    await self.clients.openWindow(url);
  })());
});
