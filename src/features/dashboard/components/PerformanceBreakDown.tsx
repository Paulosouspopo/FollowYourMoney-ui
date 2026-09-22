import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import type { DashboardResponse } from '@/features/dashboard/model/dashboard.types';

const rows = (d: DashboardResponse) => [
  { label: 'Plus-value latente', value: d.unrealizedGainEur, signed: true },
  { label: 'Plus-value réalisée', value: d.realizedGainEur, signed: true },
  { label: 'Dividendes perçus', value: d.dividendsEur, signed: false },
  { label: 'Frais cumulés', value: -d.totalFeesEur, signed: true },
];

export function PerformanceBreakdown({ data }: { data: DashboardResponse }) {
  return (
    <Card className="divide-y divide-border">
      {rows(data).map(r => (
        <div key={r.label} className="flex justify-between px-4 py-3 text-sm">
          <span className="text-muted-foreground">{r.label}</span>
          <MoneyValue value={r.value} signed={r.signed} colored />
        </div>
      ))}
    </Card>
  );
}