import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, RotateCcw, Trash2, Wallet } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { toast } from '@/shared/ui/toast.store';
import { formatDate } from '@/shared/lib/format';
import { useDeleteTrashItem, useEmptyTrash, useRestoreTrashItem, useTrash } from '../api/trash.api';
import type { TrashItem } from '../model/trash.types';

const ICON = { TRANSACTION: ArrowLeftRight, CASH_MOVEMENT: ArrowLeftRight, PORTFOLIO: Wallet } as const;

/** Corbeille : ce qui a été supprimé depuis moins de 30 jours, à restaurer ou effacer. */
export default function TrashPage() {
  const q = useTrash();
  const restore = useRestoreTrashItem();
  const remove = useDeleteTrashItem();
  const empty = useEmptyTrash();
  const navigate = useNavigate();
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  const onRestore = (item: TrashItem) => restore.mutate(item.id, {
    onSuccess: ({ portfolioId }) => {
      toast.success(item.kind === 'PORTFOLIO' ? 'Portefeuille restauré' : 'Restauré');
      navigate(`/portfolios/${portfolioId}`);
    },
    onError: e => toast.error(e.message),
  });

  return (
    <div className="lg:max-w-2xl">
      <TopBar back title="Corbeille" right={q.data && q.data.length > 0 && (
        <Button size="sm" variant="ghost" onClick={() => setConfirmEmpty(true)}>Vider</Button>
      )} />
      <p className="mb-4 text-sm text-muted-foreground">
        Opérations, mouvements et portefeuilles supprimés : restaurables 30 jours, puis effacés définitivement.
      </p>
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={3} />}>
        {items => items.length === 0 ? (
          <EmptyState title="Corbeille vide" description="Ce que tu supprimes arrive ici : tu as 30 jours pour changer d'avis." />
        ) : (
          <Card className="p-0 gap-0">
            <ul className="divide-y divide-border">
              {items.map(item => {
                const Icon = ICON[item.kind];
                return (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {item.portfolioName ? `${item.portfolioName} · ` : ''}supprimé le {formatDate(item.deletedAt)} · effacé le {formatDate(item.expiresAt)}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" loading={restore.isPending && restore.variables === item.id}
                      onClick={() => onRestore(item)}>
                      <RotateCcw size={14} /> Restaurer
                    </Button>
                    <button type="button" aria-label={`Effacer définitivement : ${item.label}`}
                      onClick={() => remove.mutate(item.id, { onError: e => toast.error(e.message) })}
                      className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-loss">
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </QueryBoundary>
      <ConfirmDialog open={confirmEmpty} onOpenChange={setConfirmEmpty} title="Vider la corbeille ?"
        description="Tout ce qu'elle contient sera effacé définitivement." confirmLabel="Vider" loading={empty.isPending}
        onConfirm={() => empty.mutate(undefined, { onSuccess: () => setConfirmEmpty(false), onError: e => toast.error(e.message) })} />
    </div>
  );
}
