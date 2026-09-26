/** Vert ou rouge d'autant plus soutenu que la variation est forte (saturé à ±15 %). */
export function returnColor(pct: number | null): string {
  if (pct == null) return 'var(--muted-foreground)';
  const strength = Math.round(25 + Math.min(Math.abs(pct) / 15, 1) * 60);
  const tone = pct >= 0 ? 'var(--positive)' : 'var(--negative)';
  return `color-mix(in oklch, ${tone} ${strength}%, var(--muted))`;
}
