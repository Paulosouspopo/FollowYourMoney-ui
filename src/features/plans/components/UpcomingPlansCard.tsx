import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { useMyPlans } from '../api/plan.api';
import { PlanRow } from './PlanRow';

const SHOWN = 3;

/** Dashboard : budget mensuel programmé et prochaines échéances, tous portefeuilles. */
export function UpcomingPlansCard() {
  const { data } = useMyPlans();
  const nav = useNavigate();
  const running = (data ?? []).filter(p => p.active && p.nextExecutionDate);
  if (!running.length) return null;
  const monthly = running.reduce((s, p) => s + p.monthlyAmount, 0);

  return (
    <section>
      <SectionHeader title="Investissements programmés"
        action={<span className="text-xs text-muted-foreground">≈ <MoneyValue value={monthly} /> / mois</span>} />
      <Card className="px-4 py-1 gap-0">
        <div className="divide-y divide-border">
          {running.slice(0, SHOWN).map(p => (
            <PlanRow key={p.id} plan={p} showPortfolio onClick={() => nav(`/portfolios/${p.portfolioId}`)} />
          ))}
        </div>
      </Card>
    </section>
  );
}
