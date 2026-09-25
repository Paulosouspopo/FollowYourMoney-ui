import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Coins, Landmark } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { Skeleton } from '@/shared/ui/skeleton';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { BarChart, type Bar } from '@/shared/charts/BarChart';
import { formatDate, formatEur, formatMoney, formatPercent } from '@/shared/lib/format';
import { useIncome } from '../api/income.api';
import { FREQUENCY_LABEL, type IncomeResponse } from '../model/income.types';

const monthLabel = (ym: string) => new Intl.DateTimeFormat('fr-FR', { month: 'short' })
  .format(new Date(`${ym}-01T12:00:00`)).replace('.', '');
const monthTitle = (ym: string) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })
  .format(new Date(`${ym}-01T12:00:00`));

/**
 * Revenus passifs : combien tes placements te versent (projeté), ce qui a été
 * reçu mois par mois, les prochains versements et le détail par ligne.
 */
export default function IncomePage() {
  const q = useIncome();
  return (
    <div className="lg:max-w-5xl">
      <TopBar back title="Revenus passifs" />
      <QueryBoundary query={q} skeleton={<Skeleton className="h-96 w-full rounded-2xl" />}>
        {d => d.positions.length === 0 && d.receivedLast12mEur === 0 ? (
          <EmptyState title="Pas encore de revenus"
            description="Les dividendes de tes actions et les intérêts de tes livrets apparaîtront ici. Les ETF capitalisants réinvestissent leurs dividendes : ils n'en versent pas." />
        ) : <Income data={d} />}
      </QueryBoundary>
    </div>
  );
}

function Income({ data: d }: { data: IncomeResponse }) {
  const bars = useMemo<Bar[]>(() => d.received.map(m => ({
    key: m.month, label: monthLabel(m.month),
    segments: [{ value: m.dividendsEur, color: 'var(--chart-5)' }, { value: m.interestEur, color: 'var(--chart-2)' }],
  })), [d.received]);
  const upcomingByMonth = useMemo(() => {
    const groups = new Map<string, IncomeResponse['upcoming']>();
    d.upcoming.forEach(u => groups.set(u.date.slice(0, 7), [...(groups.get(u.date.slice(0, 7)) ?? []), u]));
    return [...groups.entries()];
  }, [d.upcoming]);

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
      <div className="space-y-6 lg:col-span-7 min-w-0">
        <section className="glow -mx-4 px-4 md:mx-0 md:px-0 pt-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Revenus attendus</p>
          <p className="text-display mt-2">{formatEur(d.monthlyProjectedEur)}<span className="text-2xl text-muted-foreground font-medium"> / mois</span></p>
          <p className="mt-3 text-sm text-muted-foreground">
            ≈ <MoneyValue value={d.annualProjectedEur} className="text-foreground font-medium" /> sur 12 mois
            {d.yieldOnCostPct != null && <> · <span className="text-gain font-medium">{formatPercent(d.yieldOnCostPct)}</span> sur ton prix de revient</>}
          </p>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="Reçu cette année" value={d.receivedThisYearEur} />
          <Stat label="Reçu sur 12 mois" value={d.receivedLast12mEur} />
        </div>

        <section>
          <SectionHeader title="Reçu par mois" action={
            <span className="flex gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-5" /> Dividendes</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-chart-2" /> Intérêts</span>
            </span>} />
          <Card className="p-4">
            <BarChart bars={bars} labelEvery={3} ariaLabel="Revenus reçus par mois sur 24 mois"
              tooltip={b => {
                const m = d.received.find(x => x.month === b.key)!;
                return (
                  <p><span className="font-medium capitalize">{monthTitle(m.month)}</span> · dividendes <MoneyValue value={m.dividendsEur} />
                    {m.interestEur > 0 && <> · intérêts <MoneyValue value={m.interestEur} /></>}</p>
                );
              }} />
          </Card>
          <p className="mt-2 text-[11px] text-muted-foreground">D'après les dividendes et intérêts saisis ou importés.</p>
        </section>

        <section>
          <SectionHeader title="Par ligne" />
          <Card className="p-0 gap-0">
            <ul className="divide-y divide-border">
              {d.positions.map(p => (
                <li key={`${p.portfolioId}-${p.symbol ?? 'livret'}`} className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                    {p.kind === 'INTEREST' ? <Landmark size={16} /> : <Coins size={16} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {p.kind === 'INTEREST'
                        ? `Livret · ${p.yieldOnCostPct != null ? formatPercent(p.yieldOnCostPct) : ''} · versé au 31 décembre`
                        : `${p.portfolioName} · ${FREQUENCY_LABEL(p.paymentsPerYear)} · ${p.perShare != null ? formatMoney(p.perShare, p.currency) : ''} / action`}
                    </p>
                  </div>
                  <div className="text-right">
                    <MoneyValue value={p.annualEur} className="block text-sm font-semibold" />
                    {p.kind === 'DIVIDEND' && p.yieldOnCostPct != null && (
                      <span className="text-[11px] text-gain tabular-nums">{formatPercent(p.yieldOnCostPct)} / PRU</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <aside className="space-y-6 lg:col-span-5 min-w-0 lg:pt-2">
        <section>
          <SectionHeader title="Prochains versements" action={<span className="text-[11px] text-muted-foreground">estimés</span>} />
          {upcomingByMonth.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">Aucun versement attendu dans les 12 prochains mois.</Card>
          ) : (
            <Card className="p-0 gap-0">
              {upcomingByMonth.map(([month, items]) => (
                <div key={month} className="border-b border-border last:border-0">
                  <p className="px-4 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground capitalize">{monthTitle(month)}</p>
                  <ul>
                    {items.map((u, i) => (
                      <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                        <CalendarClock size={14} className="shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{formatDate(u.date)}</p>
                        </div>
                        <MoneyValue value={u.amountEur} signed colored className="text-sm font-medium" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Estimation : mêmes dates et montants que l'an dernier, pour tes quantités actuelles. Avant impôts.
          </p>
        </section>
        <p className="text-xs text-muted-foreground">
          Envie de faire grandir ces revenus ? <Link to="/goals" className="font-medium text-primary">Simule ta trajectoire</Link>.
        </p>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border px-3.5 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <MoneyValue value={value} className="block text-base font-semibold tracking-tight mt-0.5" />
    </div>
  );
}
