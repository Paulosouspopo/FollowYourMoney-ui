import { MoneyValue } from '@/shared/components/data/MoneyValue';
import type { DashboardResponse } from '../model/dashboard.types';

interface Stat { label: string; value: number; signed?: boolean; colored?: boolean; }

const stats = (d: DashboardResponse): Stat[] => [
  { label: 'Plus-value latente', value: d.unrealizedGainEur, signed: true, colored: true },
  // Les autres seulement s'ils existent : pas de tuile « 0,00 € »
  ...(d.realizedGainEur ? [{ label: 'Plus-value réalisée', value: d.realizedGainEur, signed: true, colored: true }] : []),
  ...(d.dividendsEur ? [{ label: 'Dividendes', value: d.dividendsEur, colored: true }] : []),
  ...(d.interestEur ? [{ label: 'Intérêts', value: d.interestEur, colored: true }] : []),
  ...(d.cashEur ? [{ label: 'Liquidités', value: d.cashEur }] : []),
  ...(d.totalFeesEur ? [{ label: 'Frais', value: -d.totalFeesEur, signed: true }] : []),
];

/** Chiffres clés : défilement horizontal sur mobile, grille sur grand écran. */
export function StatStrip({ data }: { data: DashboardResponse }) {
  return (
    <div data-tour="stats" className="-mx-4 px-4 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 gap-2 overflow-x-auto scrollbar-none snap-x">
      {stats(data).map(s => (
        <div key={s.label} className="min-w-[42%] md:min-w-0 snap-start rounded-2xl bg-card ring-1 ring-border px-3.5 py-3">
          <p className="text-[11px] text-muted-foreground">{s.label}</p>
          <MoneyValue value={s.value} signed={s.signed} colored={s.colored}
            className="mt-0.5 block text-base font-semibold tracking-tight" />
        </div>
      ))}
    </div>
  );
}
