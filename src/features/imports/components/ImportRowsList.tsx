import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { formatDate, formatMoney, formatQty } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { IMPORT_KIND_LABEL, ROW_STATUS_LABEL } from '../model/import.presentation';
import { isTradeKind, type ImportRow, type RowStatus } from '../model/import.types';

const STATUSES: RowStatus[] = ['READY', 'DUPLICATE', 'IGNORED', 'ERROR'];
const PAGE = 50;

interface Props {
  rows: ImportRow[];
  selected: Set<number>;
  /** Lignes non cochables (ignorées, en erreur, mouvements sans suivi des liquidités). */
  isSelectable: (row: ImportRow) => boolean;
  onToggle: (id: number) => void;
  /** Erreurs renvoyées par la validation, par ligne. */
  rowErrors: Record<number, string>;
  filter: RowStatus;
  onFilter: (s: RowStatus) => void;
}

function describe(r: ImportRow): { title: string; detail: string } {
  if (!r.kind) return { title: 'Ligne non importée', detail: '' };
  const kind = IMPORT_KIND_LABEL[r.kind];
  if (!isTradeKind(r.kind)) {
    return { title: kind, detail: r.amount != null ? formatMoney(r.amount, 'EUR') : '' };
  }
  const price = r.unitPrice != null && r.currency ? formatMoney(r.unitPrice, r.currency) : 'prix estimé à la validation';
  const detail = r.kind === 'DIVIDEND'
    ? price
    : `${formatQty(r.quantity ?? 0)} × ${price}`;
  return { title: `${kind} · ${r.assetLabel ?? ''}`, detail: detail + (r.fees ? ` · frais ${formatMoney(r.fees, r.currency ?? 'EUR')}` : '') };
}

/** Lignes de l'aperçu, filtrées par statut, avec case à cocher. */
export function ImportRowsList({ rows, selected, isSelectable, onToggle, rowErrors, filter, onFilter }: Props) {
  const [limit, setLimit] = useState(PAGE);
  const counts = Object.fromEntries(STATUSES.map(s => [s, rows.filter(r => r.status === s).length])) as Record<RowStatus, number>;
  const visible = rows.filter(r => r.status === filter);

  return (
    <section className="space-y-2">
      <div className="overflow-x-auto -mx-4 px-4">
        <SegmentedControl<RowStatus> value={filter} onChange={s => { onFilter(s); setLimit(PAGE); }}
          options={STATUSES.map(s => ({ value: s, label: `${ROW_STATUS_LABEL[s]} (${counts[s]})` }))} />
      </div>
      {visible.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucune ligne</p>}
      <ul className="divide-y divide-border">
        {visible.slice(0, limit).map(r => {
          const { title, detail } = describe(r);
          const error = rowErrors[r.id];
          const selectable = isSelectable(r);
          return (
            <li key={r.id} id={`import-row-${r.id}`} className={cn('py-2.5 flex gap-3', error && 'bg-loss/5 -mx-2 px-2 rounded-lg')}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-(--primary)" aria-label={`Importer : ${title}`}
                checked={selected.has(r.id)} disabled={!selectable} onChange={() => onToggle(r.id)} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <p className="text-sm font-medium truncate">{title}</p>
                  {r.dateTime && <span className="text-xs text-muted-foreground shrink-0">{formatDate(r.dateTime)}</span>}
                </div>
                {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
                {r.notes && <p className="text-[11px] text-muted-foreground">{r.notes}</p>}
                {(error || r.message) && (
                  <p className={cn('text-[11px] flex items-start gap-1 mt-0.5', error || r.status === 'ERROR' ? 'text-loss' : 'text-muted-foreground')}>
                    {error && <AlertTriangle size={11} className="shrink-0 mt-px" />}{error ?? r.message}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground/70">ligne{r.lines.length > 1 ? 's' : ''} {r.lines.join(', ')}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {visible.length > limit && (
        <button type="button" className="text-xs text-primary" onClick={() => setLimit(l => l + PAGE)}>
          Afficher plus ({visible.length - limit} restantes)
        </button>
      )}
    </section>
  );
}
