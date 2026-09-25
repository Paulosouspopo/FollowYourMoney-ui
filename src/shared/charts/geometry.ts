/**
 * Géométrie des graphiques SVG maison (sans librairie) : échelles, tracé
 * lissé monotone (la courbe ne dépasse jamais les points : pas de faux
 * pic entre deux clôtures), index survolé.
 */

export interface Point { x: number; y: number; }

/** Bornes des valeurs (null ignorés), avec une marge verticale ; plage nulle élargie. */
export function extent(values: (number | null)[][], padding = 0.08): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const series of values) {
    for (const v of series) {
      if (v == null || Number.isNaN(v)) continue;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  if (min === Infinity) return [0, 1];
  if (min === max) {
    const d = Math.abs(min) * 0.05 || 1;
    return [min - d, max + d];
  }
  const pad = (max - min) * padding;
  return [min - pad, max + pad];
}

export const scale = (domain: [number, number], range: [number, number]) => {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
};

/**
 * Tracé monotone (Fritsch–Carlson) en segments de Bézier. Les null coupent
 * la courbe (plusieurs sous-chemins).
 */
export function linePath(points: (Point | null)[]): string {
  let d = '';
  let run: Point[] = [];
  const flush = () => {
    if (run.length) d += monotone(run);
    run = [];
  };
  for (const p of points) {
    if (p) run.push(p);
    else flush();
  }
  flush();
  return d;
}

function monotone(pts: Point[]): string {
  const n = pts.length;
  if (n === 1) return `M${f(pts[0].x)},${f(pts[0].y)}`;
  if (n === 2) return `M${f(pts[0].x)},${f(pts[0].y)}L${f(pts[1].x)},${f(pts[1].y)}`;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = pts[i + 1].x - pts[i].x;
    slope[i] = dx[i] === 0 ? 0 : (pts[i + 1].y - pts[i].y) / dx[i];
  }
  const t: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    t[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  }
  t[n - 1] = slope[n - 2];
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / slope[i];
    const b = t[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const k = 3 / Math.sqrt(h);
      t[i] = k * a * slope[i];
      t[i + 1] = k * b * slope[i];
    }
  }
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${f(pts[i].x + h)},${f(pts[i].y + t[i] * h)},${f(pts[i + 1].x - h)},${f(pts[i + 1].y - t[i + 1] * h)},${f(pts[i + 1].x)},${f(pts[i + 1].y)}`;
  }
  return d;
}

/** Aire sous la courbe jusqu'à `baseline` (premier sous-chemin continu seulement si coupé). */
export function areaPath(points: (Point | null)[], baseline: number): string {
  const pts = points.filter((p): p is Point => p != null);
  if (pts.length < 2) return '';
  return `${linePath(pts)}L${f(pts[pts.length - 1].x)},${f(baseline)}L${f(pts[0].x)},${f(baseline)}Z`;
}

/** Index de la donnée la plus proche d'une abscisse. */
export const indexAt = (x: number, width: number, count: number) =>
  count <= 1 || width <= 0 ? 0 : Math.max(0, Math.min(count - 1, Math.round((x / width) * (count - 1))));

const f = (v: number) => (Math.round(v * 10) / 10).toString();
