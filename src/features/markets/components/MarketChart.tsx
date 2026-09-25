import { useCallback, useMemo, useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { PercentBadge } from '@/shared/components/data/PercentBadge';
import { TimeSeriesChart, type ChartSeries } from '@/shared/charts/TimeSeriesChart';
import { formatLongDate, formatMoney } from '@/shared/lib/format';
import { useMarketHistory } from '../api/market.api';
import { MARKET_RANGES, type MarketRange } from '../model/market.types';

/**
 * Cours de clôture sur la période choisie (devise de cotation). Glisser sur la
 * courbe affiche le cours du jour survolé et la variation depuis le début.
 */
export function MarketChart({ symbol, currency }: { symbol: string; currency: string }) {
  const [range, setRange] = useState<MarketRange>('1Y');
  const [scrub, setScrub] = useState<number | null>(null);
  const onScrub = useCallback((i: number | null) => setScrub(i), []);
  const q = useMarketHistory(symbol, range);
  const points = useMemo(() => q.data ?? [], [q.data]);
  const first = points[0]?.close;
  const current = points[scrub ?? points.length - 1];
  const change = first && current ? ((current.close - first) / first) * 100 : null;
  const up = change == null || change >= 0;

  const dates = useMemo(() => points.map(p => p.date), [points]);
  const series = useMemo<ChartSeries[]>(() => [
    { key: 'close', values: points.map(p => p.close), color: up ? 'var(--positive)' : 'var(--negative)', variant: 'area' },
  ], [points, up]);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 min-h-7">
        <p className="text-xs text-muted-foreground tabular-nums">
          {scrub != null && current
            ? <><span className="font-semibold text-foreground">{formatMoney(current.close, currency)}</span> · {formatLongDate(current.date)}</>
            : 'Sur la période'}
        </p>
        <PercentBadge value={change} />
      </div>
      {q.isPending ? <Skeleton className="h-[220px] w-full" /> : points.length < 2 ? (
        <p className="h-[220px] grid place-items-center text-sm text-muted-foreground">Pas d'historique sur cette période</p>
      ) : (
        <TimeSeriesChart key={range} dates={dates} series={series} height={220} onScrub={onScrub}
          ariaLabel={`Cours de ${symbol}`} />
      )}
      <SegmentedControl<MarketRange> fullWidth value={range} onChange={setRange} options={MARKET_RANGES} />
    </Card>
  );
}

/** Position du cours entre le plus bas et le plus haut sur 1 an. */
export function RangeBar({ low, high, price, currency }: { low: number; high: number; price: number; currency: string }) {
  const pos = high > low ? Math.min(100, Math.max(0, ((price - low) / (high - low)) * 100)) : 50;
  const fromHigh = high > 0 ? ((price - high) / high) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Plus bas 1 an</span>
        <span>{fromHigh < -0.05 ? `${fromHigh.toFixed(1).replace('.', ',')} % du plus haut` : 'Au plus haut'}</span>
        <span>Plus haut 1 an</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-muted" role="img"
        aria-label={`Cours à ${Math.round(pos)} % entre le plus bas et le plus haut sur 1 an`}>
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary/40" style={{ width: `${pos}%` }} />
        <div className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
          style={{ left: `${pos}%` }} />
      </div>
      <div className="flex justify-between text-xs tabular-nums">
        <span>{formatMoney(low, currency)}</span><span>{formatMoney(high, currency)}</span>
      </div>
    </div>
  );
}
