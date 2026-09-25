/**
 * Notifications push du navigateur (Web Push). Le service worker est
 * `public/sw.js` ; le back chiffre les messages avec sa clé VAPID.
 *
 * iOS : le push ne fonctionne que si l'app est ajoutée à l'écran d'accueil
 * (Safari ≥ 16.4) ; dans un onglet Safari, `PushManager` est absent.
 */

export type PushSupport = 'supported' | 'unsupported' | 'ios-install-required';

export function pushSupport(): PushSupport {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return 'unsupported';
  const standalone = window.matchMedia?.('(display-mode: standalone)').matches;
  if ('PushManager' in window && 'Notification' in window) return 'supported';
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  return ios && !standalone ? 'ios-install-required' : 'unsupported';
}

/** Enregistré au démarrage de l'app (main.tsx). */
export function registerServiceWorker(onNavigate: (path: string) => void) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch(() => { /* navigation privée, http non local… */ });
  // Clic sur une notification alors que l'app est ouverte : navigation interne
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type !== 'fym:navigate') return;
    const url = new URL(event.data.url, window.location.origin);
    if (url.origin === window.location.origin) onNavigate(url.pathname + url.search);
  });
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  if (pushSupport() !== 'supported') return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

/**
 * Demande la permission puis abonne ce navigateur.
 * @throws Error avec un message affichable si refusé
 */
export async function subscribePush(vapidPublicKey: string): Promise<PushSubscriptionJSON> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(permission === 'denied'
      ? 'Notifications bloquées : autorise-les dans les réglages du navigateur pour ce site.'
      : 'Permission non accordée.');
  }
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub = existing ?? await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(vapidPublicKey),
  });
  return sub.toJSON();
}

export async function unsubscribePush(): Promise<string | null> {
  const sub = await currentSubscription();
  if (!sub) return null;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  return endpoint;
}

export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
