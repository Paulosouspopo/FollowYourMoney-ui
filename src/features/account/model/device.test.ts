import { describe, expect, it } from 'vitest';
import { describeDevice, isMobileDevice } from './device';

describe('describeDevice', () => {
  it('navigateur et système en clair', () => {
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'))
      .toBe('Chrome sur Windows');
    expect(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'))
      .toBe('Safari sur iPhone');
    expect(describeDevice('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/126.0 Safari/537.36 Edg/126.0')).toBe('Edge sur Windows');
    expect(describeDevice(null)).toBe('Appareil inconnu');
    expect(isMobileDevice('Mozilla/5.0 (Linux; Android 14) Mobile')).toBe(true);
  });
});
