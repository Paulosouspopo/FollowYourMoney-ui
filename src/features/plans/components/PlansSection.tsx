import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import type { PortfolioType } from '@/shared/model/enums';
import { usePortfolioPlans } from '../api/plan.api';
import { PlanFormSheet } from './PlanFormSheet';
import { PlanRow } from './PlanRow';
import type { PlanResponse } from '../model/plan.types';

interface Props { portfolioId: string; portfolioType: PortfolioType; cashTracking: boolean; }

/** Investissements programmés d'un portefeuille, avec budget mensuel. */
export function PlansSection({ portfolioId, portfolioType, cashTracking }: Props) {
  const q = usePortfolioPlans(portfolioId);
  const [editing, setEditing] = useState<PlanResponse | 'new' | null>(null);
  const monthly = (q.data ?? []).filter(p => p.active && p.nextExecutionDate).reduce((s, p) => s + p.monthlyAmount, 0);

  return (
    <section data-tour="plans" className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Investissements programmés</h2>
          {monthly > 0 && <p className="text-xs text-muted-foreground">≈ <MoneyValue value={monthly} /> par mois</p>}
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing('new')}><Plus size={14} /> Programmer</Button>
      </div>
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={1} />}>
        {plans => plans.length
          ? <div className="divide-y divide-border">{plans.map(p => <PlanRow key={p.id} plan={p} onClick={() => setEditing(p)} />)}</div>
          : <p className="text-xs text-muted-foreground py-2">
              {portfolioType === 'LIVRET' ? 'Programme un versement automatique vers ce livret.' : 'Programme un achat régulier (DCA) ou un versement.'}
            </p>}
      </QueryBoundary>
      <PlanFormSheet portfolioId={portfolioId} portfolioType={portfolioType} cashTracking={cashTracking}
        open={editing !== null} onClose={() => setEditing(null)} initial={editing === 'new' ? undefined : editing ?? undefined} />
    </section>
  );
}
