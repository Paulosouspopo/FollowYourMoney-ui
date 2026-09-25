import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { TimeSeriesChart, type ChartSeries } from '@/shared/charts/TimeSeriesChart';
import { formatEur, formatLongDate, formatPercent, formatPrivateMoney } from '@/shared/lib/format';
import { PrivacyToggle } from '@/shared/privacy/PrivacyToggle';
import { useCountUp } from '@/shared/lib/useCountUp';
import { cn } from '@/shared/lib/cn';
import type { CurvePointDTO } from '../model/dashboard.types';
import { periodChange } from '../model/periodChange';

interface Props {
  label: string;
  /** Valeur actuelle en EUR (affichée dans la devise d'affichage). */
  valueEur: number;
  curve: CurvePointDTO[];
  /** Devise des montants de la courbe (déjà convertis par le back). */
  curveCurrency?: string;
  /** Libellé de la période (« sur 1 mois »). */
  periodLabel: string;
  /** Sélecteur de période, sous la courbe. */
  controls?: ReactNode;
  /** Ligne d'information sous la variation (investi, liquidités…). */
  aside?: ReactNode;
}

/**
 * Le patrimoine en très grand, la courbe juste dessous. Glisser sur la courbe
 * fait défiler l'en-tête : valeur, date et variation depuis le début de la
 * période. La variation suit la plus-value : un versement ne compte pas comme
 * un gain ; son % est rapporté à l'argent engagé (`periodChange`).
 */
export function ValueHero({ label, valueEur, curve, curveCurrency = 'EUR', periodLabel, controls, aside }: Props) {
  const [scrub, setScrub] = useState<number | null>(null);
  const onScrub = useCallback((i: number | null) => setScrub(i), []);
  const animated = useCountUp(valueEur);

  const first = curve[0];
  const point = scrub != null ? curve[scrub] : curve[curve.length - 1];
  const change = periodChange(first, point);
  const delta = change?.gain ?? null;
  const deltaPct = change?.pct ?? null;

  const series = useMemo<ChartSeries[]>(() => [
    { key: 'value', values: curve.map(p => p.totalValueEur), color: 'var(--primary)', variant: 'area' },
    { key: 'invested', values: curve.map(p => p.totalInvestedEur), color: 'var(--muted-foreground)', variant: 'dashed' },
  ], [curve]);
  const dates = useMemo(() => curve.map(p => p.date), [curve]);

  return (
    <section className="glow -mx-4 px-4 md:mx-0 md:px-0 md:rounded-3xl pt-4 lg:pt-2">
      <div className="flex items-center justify-between gap-2 h-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {scrub != null && point ? formatLongDate(point.date) : label}
        </p>
        <PrivacyToggle className="-mr-1.5" />
      </div>
      <p className="text-display mt-2" aria-live="polite">
        {scrub != null && point ? formatPrivateMoney(point.totalValueEur, curveCurrency) : formatEur(animated)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm min-h-6">
        {delta != null && (
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium tabular-nums',
            delta >= 0 ? 'bg-positive-bg text-gain' : 'bg-negative-bg text-loss')}>
            {delta >= 0 ? '▲' : '▼'} {delta >= 0 ? '+' : '−'}{formatPrivateMoney(Math.abs(delta), curveCurrency)}
            {deltaPct != null && <span className="opacity-80">({formatPercent(Math.abs(deltaPct))})</span>}
          </span>
        )}
        <span className="text-muted-foreground">
          {scrub != null && first ? `de gain depuis le ${formatLongDate(first.date)}` : `de gain ${periodLabel}`}
        </span>
        {aside && scrub == null && <span className="text-muted-foreground md:ml-auto">{aside}</span>}
      </div>

      <div className="mt-5">
        {curve.length >= 2 ? (
          <TimeSeriesChart dates={dates} series={series} height={240} onScrub={onScrub}
            ariaLabel={`Évolution de la valeur ${periodLabel}. Flèches gauche et droite pour parcourir.`} />
        ) : (
          <div className="grid h-[240px] place-items-center rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground px-6">
            {curve.length === 0
              ? 'La courbe apparaîtra après ta première opération.'
              : "Une seule journée pour l'instant : la courbe se dessine dès demain, ou tout de suite avec une opération plus ancienne."}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-primary" /> Valeur</span>
          <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-muted-foreground" /> Investi</span>
        </span>
        {controls}
      </div>
    </section>
  );
}
