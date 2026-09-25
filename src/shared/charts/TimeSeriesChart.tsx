import { memo, useId, useMemo, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { formatMonthYear, formatShortDate } from '@/shared/lib/format';
import { areaPath, extent, indexAt, linePath, scale } from './geometry';
import { useElementWidth } from './useElementWidth';

export interface ChartSeries {
  key: string;
  values: (number | null)[];
  /** Couleur CSS (token : `var(--primary)`…). */
  color: string;
  variant?: 'area' | 'line' | 'dashed';
}

interface Props {
  dates: string[];
  series: ChartSeries[];
  height?: number;
  /** Index survolé / touché (null en sortie) : permet d'afficher la valeur ailleurs (en-tête). */
  onScrub?: (index: number | null) => void;
  /** Bulle près du curseur, pour les graphiques qui ne pilotent pas d'en-tête. */
  tooltip?: (index: number) => ReactNode;
  /** Axe des valeurs à droite (3 graduations). */
  yFormat?: (v: number) => string;
  /** Ligne de référence (ex. 0 %). */
  baseline?: number;
  ariaLabel: string;
}

const PAD_TOP = 12;
const PAD_BOTTOM = 22;

/**
 * Courbe temporelle SVG : aire en dégradé, lignes secondaires, curseur au
 * doigt / à la souris / au clavier. Tracé animé à l'apparition. ~0 Ko de
 * dépendance (remplace recharts, ~100 Ko gzip).
 */
export const TimeSeriesChart = memo(function TimeSeriesChart({
  dates, series, height = 200, onScrub, tooltip, yFormat, baseline, ariaLabel,
}: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const axisWidth = yFormat ? 44 : 0;
  const plotWidth = Math.max(0, width - axisWidth);
  const count = dates.length;

  const geo = useMemo(() => {
    if (!plotWidth || count < 2) return null;
    const domain = extent([...series.map(s => s.values), baseline != null ? [baseline] : []]);
    const y = scale(domain, [height - PAD_BOTTOM, PAD_TOP]);
    const x = (i: number) => (i / (count - 1)) * plotWidth;
    const paths = series.map(s => {
      const pts = s.values.map((v, i) => (v == null ? null : { x: x(i), y: y(v) }));
      return { ...s, line: linePath(pts), area: s.variant === 'area' ? areaPath(pts, height - PAD_BOTTOM) : '' };
    });
    const ticks = yFormat ? [domain[0] + (domain[1] - domain[0]) * 0.15, (domain[0] + domain[1]) / 2,
      domain[1] - (domain[1] - domain[0]) * 0.15] : [];
    return { x, y, paths, ticks };
  }, [plotWidth, count, series, height, baseline, yFormat]);

  const move = (i: number | null) => {
    setActive(i);
    onScrub?.(i);
  };
  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (!geo) return;
    const rect = e.currentTarget.getBoundingClientRect();
    move(indexAt(e.clientX - rect.left, plotWidth, count));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const from = active ?? count - 1;
    move(Math.max(0, Math.min(count - 1, from + (e.key === 'ArrowRight' ? 1 : -1))));
  };

  const labels = count >= 2 ? [0, Math.floor((count - 1) / 2), count - 1] : [];
  // Au-delà de ~11 mois, « 27 août » est ambigu : on affiche le mois et l'année
  const longRange = count >= 2 && (Date.parse(dates[count - 1]) - Date.parse(dates[0])) / 86_400_000 > 330;
  const axisDate = longRange ? formatMonthYear : formatShortDate;
  const primary = series[0];
  const lastIndex = primary ? lastDefined(primary.values) : -1;

  return (
    <div ref={ref} className="relative select-none touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      style={{ height }} role="img" aria-label={ariaLabel} tabIndex={0}
      onPointerMove={onPointer} onPointerDown={onPointer} onPointerLeave={() => move(null)}
      onKeyDown={onKey} onBlur={() => move(null)}>
      {geo && (
        <svg width={width} height={height} className="block overflow-visible">
          <defs>
            {geo.paths.filter(p => p.variant === 'area').map(p => (
              <linearGradient key={p.key} id={`${uid}${p.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={p.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          {geo.ticks.map(t => (
            <g key={t}>
              <line x1={0} x2={plotWidth} y1={geo.y(t)} y2={geo.y(t)} stroke="var(--border)" strokeDasharray="2 4" />
              <text x={width} y={geo.y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                {yFormat!(t)}
              </text>
            </g>
          ))}
          {baseline != null && (
            <line x1={0} x2={plotWidth} y1={geo.y(baseline)} y2={geo.y(baseline)} stroke="var(--muted-foreground)"
              strokeOpacity={0.35} />
          )}
          {geo.paths.map(p => (
            <g key={p.key}>
              {p.area && <path d={p.area} fill={`url(#${uid}${p.key})`} className="chart-fade" />}
              {p.variant === 'dashed' ? (
                <path d={p.line} fill="none" stroke={p.color} strokeWidth={1.5} strokeDasharray="4 4"
                  strokeLinecap="round" className="chart-fade" />
              ) : (
                <path d={p.line} fill="none" stroke={p.color} pathLength={1}
                  strokeWidth={p.variant === 'area' ? 2.25 : 1.5} strokeLinecap="round" strokeLinejoin="round"
                  className="chart-draw" />
              )}
            </g>
          ))}
          {active == null && lastIndex >= 0 && primary.values[lastIndex] != null && (
            <circle cx={geo.x(lastIndex)} cy={geo.y(primary.values[lastIndex]!)} r={3.5} fill={primary.color}
              className="chart-fade" />
          )}
          {active != null && (
            <g>
              <line x1={geo.x(active)} x2={geo.x(active)} y1={PAD_TOP / 2} y2={height - PAD_BOTTOM}
                stroke="var(--foreground)" strokeOpacity={0.25} />
              {series.map(s => s.values[active] != null && (
                <circle key={s.key} cx={geo.x(active)} cy={geo.y(s.values[active]!)} r={4.5} fill={s.color}
                  stroke="var(--background)" strokeWidth={2} />
              ))}
            </g>
          )}
          {labels.map((i, n) => (
            <text key={i} x={geo.x(i)} y={height - 4} textAnchor={n === 0 ? 'start' : n === 2 ? 'end' : 'middle'}
              className="fill-muted-foreground text-[10px]">
              {axisDate(dates[i])}
            </text>
          ))}
        </svg>
      )}
      {geo && active != null && tooltip && (
        <div className="pointer-events-none absolute top-0 z-10 rounded-lg border border-border bg-popover/95 px-2.5 py-1.5 text-xs shadow-lg backdrop-blur"
          style={{ left: Math.min(Math.max(geo.x(active) - 70, 0), Math.max(plotWidth - 140, 0)), width: 140 }}>
          <p className="text-[10px] text-muted-foreground">{formatShortDate(dates[active])}</p>
          {tooltip(active)}
        </div>
      )}
    </div>
  );
});

function lastDefined(values: (number | null)[]) {
  for (let i = values.length - 1; i >= 0; i--) if (values[i] != null) return i;
  return -1;
}
