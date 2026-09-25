import { useId } from 'react';

/**
 * Mini-courbe SVG (30 jours), verte si la période monte, rouge sinon.
 * `up` force le sens (ex. gain d'un portefeuille : un versement fait monter la valeur sans être un gain).
 */
export function Sparkline({ values, width = 72, height = 28, up }: { values: number[]; width?: number; height?: number; up?: boolean }) {
  const gradientId = `spark${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`; // utilisable dans url(#…)
  if (values.length < 2) return <div style={{ width, height }} aria-hidden />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => [
    (i / (values.length - 1)) * width,
    height - 2 - ((v - min) / span) * (height - 4),
  ]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const rising = up ?? values[values.length - 1] >= values[0];
  const color = rising ? 'var(--positive)' : 'var(--negative)';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
