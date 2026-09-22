import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { PercentBadge } from '@/shared/components/data/PercentBadge';
import type { DashboardResponse } from '@/features/dashboard/model/dashboard.types';

export function NetWorthHero({ data, label }: { data: DashboardResponse; label?: string }) {
  const gainTone = data.unrealizedGainEur >= 0 ? 'text-gain' : 'text-loss';
  return (
    <Card className="p-5 bg-linear-to-br from-card to-primary/10">
      <p className="text-sm text-muted-foreground">{label ?? 'Valeur totale'}</p>
      <MoneyValue value={data.totalValueEur} className="block text-4xl font-semibold tracking-tight mt-1" />
      <div className="mt-3 flex items-center gap-2">
        <MoneyValue value={data.unrealizedGainEur} signed className={`text-sm font-medium ${gainTone}`} />
        <PercentBadge value={data.unrealizedGainPercentage} />
        <span className="text-xs text-muted-foreground ml-auto">Investi <MoneyValue value={data.totalInvestedEur} /></span>
      </div>
    </Card>
  );
}