import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { useCashMovements } from '../api/cash.api';
import { CashMovementRow } from './CashMovementRow';
import { CashMovementFormSheet } from './CashMovementFormSheet';
import type { CashMovementResponse } from '../model/cash.types';

const PREVIEW_COUNT = 5;

interface Props {
  portfolioId: string;
  balance: number;
  /** Livret : le solde est la valeur du portefeuille, on n'affiche pas l'en-tête « Liquidités ». */
  isLivret?: boolean;
}

/** Solde de liquidités et derniers mouvements ; un clic ouvre la modification. */
export function CashSection({ portfolioId, balance, isLivret = false }: Props) {
  const q = useCashMovements(portfolioId);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<CashMovementResponse | null>(null);

  return (
    <section data-tour="cash" className="space-y-2">
      {isLivret ? (
        <h2 className="text-sm font-semibold tracking-tight">Mouvements</h2>
      ) : (
        <Card className="p-4 flex-row items-center gap-3">
          <span className="h-9 w-9 rounded-full bg-muted grid place-items-center shrink-0"><Wallet size={16} /></span>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Liquidités</p>
            <MoneyValue value={balance} colored={balance < 0} className="block font-semibold" />
          </div>
          {balance < 0 && (
            <p className="text-[11px] text-warning max-w-40 text-right">Solde négatif : saisis tes versements</p>
          )}
        </Card>
      )}
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={2} />}>
        {list => list.length ? (
          <>
            <div className="divide-y divide-border">
              {(expanded ? list : list.slice(0, PREVIEW_COUNT)).map(m =>
                <CashMovementRow key={m.id} movement={m} onClick={() => setEditing(m)} />)}
            </div>
            {list.length > PREVIEW_COUNT && (
              <button type="button" onClick={() => setExpanded(e => !e)} className="text-xs text-primary">
                {expanded ? 'Afficher moins' : `Tout afficher (${list.length})`}
              </button>
            )}
          </>
        ) : <p className="text-sm text-muted-foreground py-3 text-center">Aucun versement ni retrait</p>}
      </QueryBoundary>
      <CashMovementFormSheet portfolioId={portfolioId} open={editing !== null} onClose={() => setEditing(null)}
        initial={editing ?? undefined} balance={balance} noOverdraft={isLivret} />
    </section>
  );
}
