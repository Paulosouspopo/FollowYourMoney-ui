import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import type { Kpi } from './kpis';

export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(k => (
        <Card key={k.label} className="p-3">
          <p className="text-xs text-muted-foreground">{k.label}</p>
          <MoneyValue value={k.value} signed={k.signed} colored={k.colored} className="block text-base font-semibold mt-0.5" />
          {k.hint && <p className="text-[11px] text-muted-foreground mt-0.5">{k.hint}</p>}
        </Card>
      ))}
    </div>
  );
}
