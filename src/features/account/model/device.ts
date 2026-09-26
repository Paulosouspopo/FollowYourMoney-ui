/** « Chrome sur Windows », « Safari sur iPhone »… à partir de l'en-tête User-Agent (lisible, pas exhaustif). */
export function describeDevice(userAgent: string | null): string {
  if (!userAgent) return 'Appareil inconnu';
  const ua = userAgent;
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows' : /Mac OS X|Macintosh/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : null;
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox'
    : /Chrome\/|CriOS\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : null;
  if (browser && os) return `${browser} sur ${os}`;
  return browser ?? os ?? 'Appareil inconnu';
}

/** Appareil mobile (icône). */
export const isMobileDevice = (userAgent: string | null) => !!userAgent && /iPhone|iPad|Android|Mobile/.test(userAgent);
