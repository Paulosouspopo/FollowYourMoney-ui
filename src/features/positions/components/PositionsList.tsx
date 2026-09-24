import { useMemo, useState } from 'react';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PositionRow } from '@/features/positions/components/PositionRow';
import type { PositionValuation } from '@/features/dashboard/model/dashboard.types';

type Sort = 'value' | 'gain' | 'name';
const SORTERS: Record<Sort, (a: PositionValuation, b: PositionValuation) => number> = {
  value: (a, b) => b.currentValueEur - a.currentValueEur,
  gain:  (a, b) => b.unrealizedGainPercentage - a.unrealizedGainPercentage,
  name:  (a, b) => a.name.localeCompare(b.name, 'fr'),
};

interface Props { portfolioId: string; positions: PositionValuation[]; }

export function PositionsList({ portfolioId, positions }: Props) {
  const [sort, setSort] = useState<Sort>('value');
  const [showClosed, setShowClosed] = useState(false);

  const rows = useMemo(() =>
    positions.filter(p => showClosed || p.quantity > 0).sort(SORTERS[sort]),
  [positions, sort, showClosed]);

  if (!positions.length) {
    return <EmptyState title="Aucune position" description="Ajoute une première transaction avec le bouton +" />;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium">Positions ({rows.length})</h2>
        <SegmentedControl value={sort} onChange={setSort}
          options={[{ value: 'value', label: 'Valeur' }, { value: 'gain', label: '%' }, { value: 'name', label: 'A‑Z' }]} />
      </div>
      <div className="divide-y divide-border">
        {rows.map(p => <PositionRow key={p.assetId} portfolioId={portfolioId} position={p} />)}
      </div>
      {positions.some(p => p.quantity <= 0) && (
        <button type="button" onClick={() => setShowClosed(c => !c)} className="mt-2 text-xs text-primary">
          {showClosed ? 'Masquer' : 'Afficher'} les positions clôturées
        </button>
      )}
    </section>
  );
}
