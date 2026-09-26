import { describe, expect, it } from 'vitest';
import { squarify } from './squarify';

describe('squarify', () => {
  it('surfaces proportionnelles aux valeurs, tuiles dans le cadre, sans chevauchement de surface', () => {
    const rects = squarify([
      { key: 'a', value: 6 }, { key: 'b', value: 6 }, { key: 'c', value: 4 }, { key: 'd', value: 3 },
      { key: 'e', value: 2 }, { key: 'f', value: 2 }, { key: 'g', value: 1 }, { key: 'zero', value: 0 },
    ], 600, 400);
    expect(rects).toHaveLength(7);
    const total = rects.reduce((s, r) => s + r.w * r.h, 0);
    expect(total).toBeCloseTo(600 * 400, 3);
    const a = rects.find(r => r.key === 'a')!;
    expect(a.w * a.h).toBeCloseTo((600 * 400 * 6) / 24, 3);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(-1e-9);
      expect(r.y).toBeGreaterThanOrEqual(-1e-9);
      expect(r.x + r.w).toBeLessThanOrEqual(600 + 1e-6);
      expect(r.y + r.h).toBeLessThanOrEqual(400 + 1e-6);
    }
    // Squarifié : pas de tuile démesurément allongée
    const ratios = rects.map(r => Math.max(r.w / r.h, r.h / r.w));
    expect(Math.max(...ratios)).toBeLessThan(4);
  });

  it('rien à dessiner sans valeur', () => {
    expect(squarify([], 100, 100)).toEqual([]);
    expect(squarify([{ key: 'a', value: 0 }], 100, 100)).toEqual([]);
  });
});
