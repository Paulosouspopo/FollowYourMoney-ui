import { describe, expect, it } from 'vitest';
import { base64UrlToBytes } from './push';

describe('base64UrlToBytes', () => {
  it('décode la clé VAPID (base64 URL sans remplissage) en 65 octets, point non compressé', () => {
    // Clé publique d'exemple de la RFC 8291
    const key = 'BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8';
    const bytes = base64UrlToBytes(key);
    expect(bytes).toHaveLength(65);
    expect(bytes[0]).toBe(0x04);
    expect(bytes[64]).toBe(0x0f);
  });

  it('gère les caractères propres au base64 URL', () => {
    expect([...base64UrlToBytes('-_8')]).toEqual([0xfb, 0xff]);
  });
});
