import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { PercentBadge } from '@/shared/components/data/PercentBadge';
import { formatMoney, formatShortDate } from '@/shared/lib/format';
import { useMarketHistory } from '../api/market.api';
import { MARKET_RANGES, type MarketRange } from '../model/market.types';

/** Cours de clôture d'un actif sur la période choisie (devise de cotation). */
export function MarketChart({ symbol, currency }: { symbol: string; currency: string }) {
  const [range, setRange] = useState<MarketRange>('1Y');
  const q = useMarketHistory(symbol, range);
  const points = q.data ?? [];
  const first = points[0]?.close;
  const last = points[points.length - 1]?.close;
  const change = first && last ? ((last - first) / first) * 100 : null;
  const color = change == null || change >= 0 ? 'var(--positive)' : 'var(--negative)';

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <SegmentedControl<MarketRange> value={range} onChange={setRange} options={MARKET_RANGES} />
        <PercentBadge value={change} />
      </div>
      {q.isPending ? <Skeleton className="h-[200px] w-full" /> : points.length < 2 ? (
        <p className="h-[200px] grid place-items-center text-sm text-muted-foreground">Pas d'historique sur cette période</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={points} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fym-market-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              axisLine={false} tickLine={false} minTickGap={32} />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)', borderRadius: 12 }}
              itemStyle={{ color: 'var(--popover-foreground)' }}
              formatter={v => [formatMoney(Number(v ?? 0), currency), 'Clôture']}
              labelFormatter={l => formatShortDate(String(l))}
            />
            <Area type="monotone" dataKey="close" stroke={color} fill="url(#fym-market-area)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
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
