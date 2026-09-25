import { MoneyValue } from '@/shared/components/data/MoneyValue';
import type { Kpi } from './kpis';

/** Tuiles de chiffres clés : 2 colonnes sur mobile, 4 sur tablette et plus. */
export function KpiGrid({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map(k => (
        <div key={k.label} className="rounded-2xl bg-card ring-1 ring-border px-3.5 py-3">
          <p className="text-[11px] text-muted-foreground">{k.label}</p>
          <MoneyValue value={k.value} signed={k.signed} colored={k.colored} className="block text-base font-semibold tracking-tight mt-0.5" />
          {k.hint && <p className="text-[11px] text-muted-foreground mt-0.5">{k.hint}</p>}
        </div>
      ))}
    </div>
  );
}
