import { describe, expect, it } from 'vitest';
import { areaPath, extent, indexAt, linePath, scale } from './geometry';

/** Ordonnées des points de contrôle et d'arrivée d'un tracé « M…C… ». */
const ys = (d: string) => [...d.matchAll(/-?\d+(?:\.\d+)?,(-?\d+(?:\.\d+)?)/g)].map(m => Number(m[1]));

describe('géométrie des graphiques', () => {
  it('bornes : ignore les null, ajoute une marge, élargit une plage plate', () => {
    expect(extent([[1, null, 3]], 0)).toEqual([1, 3]);
    const [lo, hi] = extent([[10, 20]]);
    expect(lo).toBeLessThan(10);
    expect(hi).toBeGreaterThan(20);
    expect(extent([[5, 5]])[0]).toBeLessThan(5);
    expect(extent([[null]])).toEqual([0, 1]);
  });

  it('échelle linéaire inversée (y du SVG vers le bas)', () => {
    const y = scale([0, 100], [200, 0]);
    expect(y(0)).toBe(200);
    expect(y(50)).toBe(100);
  });

  it('courbe monotone : jamais de faux pic au-delà des points (palier puis hausse)', () => {
    const pts = [{ x: 0, y: 100 }, { x: 10, y: 100 }, { x: 20, y: 100 }, { x: 30, y: 20 }];
    const all = ys(linePath(pts));
    expect(Math.min(...all)).toBeGreaterThanOrEqual(20);
    expect(Math.max(...all)).toBeLessThanOrEqual(100);
  });

  it('un null coupe la courbe en deux sous-chemins', () => {
    const d = linePath([{ x: 0, y: 1 }, { x: 1, y: 2 }, null, { x: 3, y: 4 }, { x: 4, y: 5 }]);
    expect(d.match(/M/g)).toHaveLength(2);
  });

  it("aire fermée jusqu'à la ligne de base", () => {
    const d = areaPath([{ x: 0, y: 10 }, { x: 50, y: 5 }], 100);
    expect(d).toMatch(/L50,100L0,100Z$/);
    expect(areaPath([{ x: 0, y: 1 }], 100)).toBe('');
  });

  it('index survolé : arrondi au point le plus proche, borné', () => {
    expect(indexAt(0, 300, 31)).toBe(0);
    expect(indexAt(155, 300, 31)).toBe(16);
    expect(indexAt(400, 300, 31)).toBe(30);
    expect(indexAt(-5, 300, 31)).toBe(0);
  });
});
