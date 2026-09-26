import { useState } from 'react';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { usePortfolioTransactions } from '../api/transaction.api';
import { TransactionFormSheet } from './TransactionFormSheet';
import { TransactionRow } from './TransactionRow';
import type { TransactionResponse } from '../model/transaction.types';

const PREVIEW_COUNT = 5;

/** Dernières opérations d'un portefeuille, tous actifs confondus ; un clic ouvre l'édition. */
export function RecentTransactions({ portfolioId, heldQuantities }: { portfolioId: string; heldQuantities?: Record<string, number> }) {
  const q = usePortfolioTransactions(portfolioId);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<TransactionResponse | null>(null);

  return (
    <section data-tour="recent">
      <h2 className="text-sm font-semibold tracking-tight mb-1">Transactions</h2>
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={3} />}>
        {list => list.length ? (
          <>
            <div className="divide-y divide-border">
              {(expanded ? list : list.slice(0, PREVIEW_COUNT)).map(t =>
                <TransactionRow key={t.id} tx={t} showAsset onClick={() => setEditing(t)} />)}
            </div>
            {list.length > PREVIEW_COUNT && (
              <button type="button" onClick={() => setExpanded(e => !e)} className="mt-2 text-xs text-primary">
                {expanded ? 'Afficher moins' : `Tout afficher (${list.length})`}
              </button>
            )}
          </>
        ) : <p className="text-sm text-muted-foreground py-4 text-center">Aucune transaction</p>}
      </QueryBoundary>
      <TransactionFormSheet portfolioId={portfolioId} open={editing !== null} onClose={() => setEditing(null)}
        initial={editing ?? undefined} heldQuantities={heldQuantities} />
    </section>
  );
}
