import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';

export interface Kpi { label: string; value: number; signed?: boolean; colored?: boolean; hint?: string; }
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

/** Une seule fonction pour dériver les KPI, que ce soit d'un DashboardResponse ou d'un PortfolioValuation (ils partagent ces champs). */
export const performanceKpis = (d: { realizedGainEur: number; dividendsEur: number; totalFeesEur: number; unrealizedGainEur: number }): Kpi[] => [
  { label: 'Latent', value: d.unrealizedGainEur, signed: true, colored: true },
  { label: 'Réalisé', value: d.realizedGainEur, signed: true, colored: true },
  { label: 'Dividendes', value: d.dividendsEur },
  { label: 'Frais', value: -d.totalFeesEur, signed: true, colored: true },
];