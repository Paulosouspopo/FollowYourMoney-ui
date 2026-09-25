import { useMemo, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { TOURS } from '@/features/guide/tours';
import { usePageTour } from '@/shared/tour/usePageTour';
import { TourButton } from '@/shared/tour/TourButton';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { EditHint } from '@/shared/ui/EditHint';
import { TimeSeriesChart, type ChartSeries } from '@/shared/charts/TimeSeriesChart';
import { formatEurRounded } from '@/shared/lib/format';
import { useDashboard } from '@/features/dashboard/api/dashboard.api';
import { useMyPlans } from '@/features/plans/api/plan.api';
import { useGoals } from '../api/goal.api';
import { GoalFormSheet } from '../components/GoalFormSheet';
import { GoalVerdict } from '../components/GoalVerdict';
import { scenarios, yearlySeries } from '../model/projection';
import type { Goal } from '../model/goal.types';

/**
 * Projection et objectifs : « combien j'aurai dans N ans » (3 scénarios), puis
 * des objectifs suivis avec leur verdict au rythme actuel.
 */
export default function GoalsPage() {
  const dashboard = useDashboard('30d');
  const plans = useMyPlans();
  const plannedMonthly = Math.round((plans.data ?? []).filter(p => p.active && p.nextExecutionDate)
    .reduce((s, p) => s + p.monthlyAmount, 0));
  const [rate, setRate] = useState(5);
  usePageTour(TOURS.goals, !!dashboard.data && !!plans.data);

  return (
    <div className="lg:max-w-5xl">
      <TopBar back title="Projection et objectifs" right={<TourButton tour={TOURS.goals} />} />
      <div className="space-y-8">
        {dashboard.data && plans.data && (
          <Simulator key={plannedMonthly} start={dashboard.data.totalValueEur} defaultMonthly={plannedMonthly}
            rate={rate} onRate={setRate} />
        )}
        <Goals rate={rate} />
      </div>
    </div>
  );
}

function Simulator({ start, defaultMonthly, rate, onRate }: {
  start: number; defaultMonthly: number; rate: number; onRate: (r: number) => void;
}) {
  const [years, setYears] = useState(15);
  const [monthly, setMonthly] = useState(defaultMonthly);
  const s = scenarios(rate);

  const { dates, series, final } = useMemo(() => {
    const median = yearlySeries(start, monthly, s.median, years);
    const prudent = yearlySeries(start, monthly, s.prudent, years);
    const dynamic = yearlySeries(start, monthly, s.dynamic, years);
    const now = new Date().getFullYear();
    return {
      dates: median.map(p => `${now + p.year}-01-01`),
      series: [
        { key: 'median', values: median.map(p => p.value), color: 'var(--primary)', variant: 'area' },
        { key: 'dynamic', values: dynamic.map(p => p.value), color: 'var(--positive)', variant: 'line' },
        { key: 'prudent', values: prudent.map(p => p.value), color: 'var(--warning)', variant: 'line' },
        { key: 'invested', values: median.map(p => p.invested), color: 'var(--muted-foreground)', variant: 'dashed' },
      ] as ChartSeries[],
      final: { median: median[years], prudent: prudent[years].value, dynamic: dynamic[years].value },
    };
  }, [start, monthly, years, s.median, s.prudent, s.dynamic]);

  return (
    <section className="space-y-4">
      <div data-tour="goals-hero" className="glow -mx-4 px-4 md:mx-0 md:px-0 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Dans {years} ans</p>
        <p className="text-display mt-2">≈ {formatEurRounded(final.median.value)}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          entre <span className="text-foreground font-medium tabular-nums">{formatEurRounded(final.prudent)}</span> (prudent)
          {' '}et <span className="text-foreground font-medium tabular-nums">{formatEurRounded(final.dynamic)}</span> (dynamique)
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          dont <span className="text-foreground font-medium tabular-nums">{formatEurRounded(final.median.invested)}</span> versés
          {' '}et <span className="text-gain font-medium tabular-nums">{formatEurRounded(final.median.value - final.median.invested)}</span> d'intérêts composés
        </p>
      </div>

      <Card className="p-4 space-y-5">
        <TimeSeriesChart dates={dates} series={series} height={220}
          ariaLabel={`Projection sur ${years} ans : trois scénarios de rendement`}
          tooltip={i => (
            <div className="mt-0.5 space-y-0.5">
              <Row label="Dynamique" value={series[1].values[i]!} />
              <Row label="Médian" value={series[0].values[i]!} />
              <Row label="Prudent" value={series[2].values[i]!} />
              <Row label="Versé" value={series[3].values[i]!} />
            </div>
          )} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <Legend color="bg-positive" label={`Dynamique ${s.dynamic} %`} />
          <Legend color="bg-primary" label={`Médian ${s.median} %`} />
          <Legend color="bg-warning" label={`Prudent ${s.prudent} %`} />
          <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-muted-foreground" /> Versé</span>
        </div>

        <div data-tour="goals-sliders" className="grid gap-5 md:grid-cols-3">
          <Range label="Horizon" value={years} min={1} max={40} step={1} onChange={setYears} display={`${years} ans`} />
          <Range label="Versement mensuel" value={monthly} min={0} max={5000} step={25} onChange={setMonthly}
            display={formatEurRounded(monthly)} hint={defaultMonthly > 0 ? `Tes plans : ${formatEurRounded(defaultMonthly)} / mois` : undefined} />
          <Range label="Rendement médian" value={rate} min={0} max={12} step={0.5} onChange={onRate}
            display={`${String(rate).replace('.', ',')} % / an`} hint="Actions monde ≈ 6-7 % sur longue période, livret ≈ 2-3 %" />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Départ : ton patrimoine actuel (<MoneyValue value={start} />). Rendement constant, avant impôts et inflation : un ordre de grandeur, pas une promesse.
        </p>
      </Card>
    </section>
  );
}

function Goals({ rate }: { rate: number }) {
  const q = useGoals();
  const [editing, setEditing] = useState<Goal | 'new' | null>(null);
  return (
    <section data-tour="goals-list">
      <SectionHeader title="Mes objectifs"
        action={<Button size="sm" onClick={() => setEditing('new')}><Plus size={14} /> Nouvel objectif</Button>} />
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={2} />}>
        {goals => goals.length === 0 ? (
          <Card className="p-6 items-center text-center gap-2">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary"><Target size={20} /></span>
            <p className="text-sm font-semibold">Fixe-toi un cap</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Un apport immobilier, 100 000 €, ta retraite : l'app te dit si ton rythme actuel suffit, et sinon combien verser par mois.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {goals.map(g => (
              <button key={g.id} type="button" onClick={() => setEditing(g)} aria-label={`Modifier l'objectif ${g.name}`}
                className="group text-left">
                <Card className="p-4 gap-3 h-full transition-colors group-hover:ring-primary/40">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{g.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {g.portfolioName ?? 'Tout le patrimoine'}{g.targetDate && ` · avant le ${new Date(`${g.targetDate}T12:00:00`).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <EditHint />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-sm">
                      <MoneyValue value={g.currentValueEur} className="font-semibold" />
                      <span className="text-xs text-muted-foreground">sur <MoneyValue value={g.targetAmount} /></span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted" role="progressbar"
                      aria-valuenow={Math.round(g.progressPct)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${g.progressPct}%` }} />
                    </div>
                    <p className="mt-1 text-right text-[11px] text-muted-foreground tabular-nums">{Math.round(g.progressPct)} %</p>
                  </div>
                  <GoalVerdict goal={g} ratePct={rate} />
                </Card>
              </button>
            ))}
          </div>
        )}
      </QueryBoundary>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Verdicts calculés avec tes investissements programmés et le rendement médian choisi plus haut.
      </p>
      <GoalFormSheet open={editing !== null} onClose={() => setEditing(null)}
        initial={editing === 'new' ? undefined : editing ?? undefined} />
    </section>
  );
}

function Range({ label, value, min, max, step, onChange, display, hint }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
  display: string; hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums font-semibold text-primary">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]" />
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <p className="flex justify-between gap-2"><span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{formatEurRounded(value)}</span></p>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5"><span className={`h-0.5 w-4 rounded ${color}`} /> {label}</span>;
}
