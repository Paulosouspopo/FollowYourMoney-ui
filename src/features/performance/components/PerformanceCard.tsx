import { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { TimeSeriesChart, type ChartSeries } from '@/shared/charts/TimeSeriesChart';
import { Card } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorState } from '@/shared/ui/ErrorState';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatPercent, gainTone } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { usePerformance } from '../api/performance.api';
import { useBenchmarkStore } from '../model/benchmark.store';
import {
  PERFORMANCE_PERIODS, PERFORMANCE_PERIOD_LABEL, type PerformancePeriod, type PerformanceResponse,
} from '../model/performance.types';
import { BenchmarkPicker } from './BenchmarkPicker';
import { PortfolioRanking } from './PortfolioRanking';

const signedPercent = (v: number | null | undefined) =>
  v == null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatPercent(Math.abs(v))}`;

/**
 * Performance réelle sur une période : rendement des placements (TWR,
 * comparable à un indice) et rendement de ton argent (versements compris).
 *
 * @param portfolioId null = tout le patrimoine (avec le classement des portefeuilles)
 */
export function PerformanceCard({ portfolioId }: { portfolioId: string | null }) {
  const [period, setPeriod] = useState<PerformancePeriod>('1y');
  const benchmark = useBenchmarkStore(s => s.benchmark);
  const q = usePerformance(portfolioId, period, benchmark?.symbol ?? null);
  const [help, setHelp] = useState(false);

  return (
    <section data-tour="performance" className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
          Performance
          <button type="button" onClick={() => setHelp(h => !h)} aria-expanded={help}
            aria-label="Comment la performance est calculée" className="text-muted-foreground">
            <Info size={14} />
          </button>
        </h2>
        <PeriodPills value={period} onChange={setPeriod} />
      </div>
      {help && (
        <Card className="p-3 text-xs text-muted-foreground space-y-1.5">
          <p><strong className="text-foreground">Performance</strong> : ce que tes placements ont rapporté, sans l'effet
            de tes versements ni de leur date (TWR). C'est ce chiffre qui se compare à un indice ou entre portefeuilles.</p>
          <p><strong className="text-foreground">Rendement de ton argent</strong> : tient compte du moment où tu as
            versé (XIRR, par an au-delà d'un an). Verser juste avant une baisse le fait passer sous la performance.</p>
          <p>Calculs en euros, frais et dividendes compris.</p>
        </Card>
      )}

      {q.isPending ? <Skeleton className="h-72 w-full" /> : q.isError ? (
        <ErrorState error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <>
          <Card className={cn('p-4 space-y-4 transition-opacity', q.isFetching && 'opacity-60')}>
            <Kpis data={q.data} />
            <ComparisonChart data={q.data} />
            <BenchmarkPicker />
          </Card>
          {portfolioId == null && q.data.portfolios.length > 1 && <PortfolioRanking portfolios={q.data.portfolios} />}
        </>
      )}
    </section>
  );
}

function PeriodPills({ value, onChange }: { value: PerformancePeriod; onChange: (p: PerformancePeriod) => void }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5">
      {PERFORMANCE_PERIODS.map(p => (
        <button key={p} type="button" onClick={() => onChange(p)} aria-pressed={value === p}
          className={cn('rounded-full px-2 py-1 text-[11px] font-medium transition-colors',
            value === p ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
          {PERFORMANCE_PERIOD_LABEL[p]}
        </button>
      ))}
    </div>
  );
}

/** Nom court de l'indice : celui choisi (« MSCI World ») plutôt que le nom Yahoo complet. */
function useBenchmarkName(d: PerformanceResponse) {
  const chosen = useBenchmarkStore(s => s.benchmark);
  return chosen?.symbol === d.benchmark?.symbol ? chosen?.label : d.benchmark?.name;
}

function Kpis({ data: d }: { data: PerformanceResponse }) {
  const vsIndex = d.benchmark?.returnPct != null ? d.twrPct - d.benchmark.returnPct : null;
  const benchmarkName = useBenchmarkName(d);
  // Sur 1 an pile, l'annualisé répète le cumulé : on ne l'affiche que s'il diffère
  const annualized = d.twrAnnualizedPct != null && Math.abs(d.twrAnnualizedPct - d.twrPct) >= 0.05
    ? d.twrAnnualizedPct : null;
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <Kpi label="Performance" value={signedPercent(d.twrPct)} tone={d.twrPct}
        sub={annualized != null ? `${signedPercent(annualized)} par an` : 'sur la période'} />
      <Kpi label="Rendement de ton argent" value={signedPercent(d.xirrPct ?? d.mwrPct)} tone={d.xirrPct ?? d.mwrPct}
        sub={d.xirrPct != null ? 'par an (XIRR)' : 'sur la période'} />
      <div>
        <p className="text-[11px] text-muted-foreground">Gain sur la période</p>
        <MoneyValue value={d.gainEur} signed colored className="text-base font-semibold" />
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground">Apports nets</p>
        <MoneyValue value={d.netFlowsEur} signed className="text-base font-semibold" />
      </div>
      {vsIndex != null && d.benchmark && (
        <p className={cn('col-span-2 text-xs', gainTone(vsIndex))}>
          {vsIndex >= 0 ? 'Devant' : 'Derrière'} {benchmarkName} de {formatPercent(Math.abs(vsIndex))}
          <span className="text-muted-foreground"> ({signedPercent(d.benchmark.returnPct)} pour l'indice)</span>
        </p>
      )}
    </div>
  );
}

function Kpi({ label, value, tone, sub }: { label: string; value: string; tone: number; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-semibold tabular-nums', gainTone(tone))}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function ComparisonChart({ data: d }: { data: PerformanceResponse }) {
  const benchmarkName = useBenchmarkName(d);
  const hasBenchmark = d.series.some(p => p.benchmarkPct != null);
  const dates = useMemo(() => d.series.map(p => p.date), [d.series]);
  const series = useMemo<ChartSeries[]>(() => [
    { key: 'twr', values: d.series.map(p => p.twrPct), color: 'var(--primary)', variant: 'line' },
    ...(hasBenchmark
      ? [{ key: 'bench', values: d.series.map(p => p.benchmarkPct), color: 'var(--muted-foreground)', variant: 'dashed' as const }]
      : []),
  ], [d.series, hasBenchmark]);

  if (d.series.length < 2) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Pas encore assez d'historique sur cette période.</p>;
  }
  return (
    <div>
      <TimeSeriesChart dates={dates} series={series} height={180} baseline={0}
        yFormat={v => `${Math.round(v)} %`}
        ariaLabel={`Performance comparée${hasBenchmark ? ` à ${benchmarkName}` : ''}`}
        tooltip={i => (
          <div className="mt-0.5 space-y-0.5">
            <p className="flex justify-between gap-2"><span className="text-muted-foreground">Moi</span>
              <span className="font-medium tabular-nums">{signedPercent(d.series[i].twrPct)}</span></p>
            {hasBenchmark && (
              <p className="flex justify-between gap-2"><span className="text-muted-foreground">Indice</span>
                <span className="font-medium tabular-nums">{signedPercent(d.series[i].benchmarkPct)}</span></p>
            )}
          </div>
        )} />
      <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary rounded" /> Mes placements</span>
        {hasBenchmark && (
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="h-0 w-4 shrink-0 border-t border-dashed border-muted-foreground" />
            <span className="truncate">{benchmarkName}</span>
          </span>
        )}
      </div>
    </div>
  );
}
