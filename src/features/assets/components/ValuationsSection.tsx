import { useState } from 'react';
import { PenLine, Trash2 } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { FormError } from '@/shared/ui/FormError';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { toast } from '@/shared/ui/toast.store';
import { formatDate, formatMoney } from '@/shared/lib/format';
import { todayLocal } from '@/shared/lib/dates';
import { useDeleteValuation, useSaveValuation, useValuations } from '../api/manualAsset.api';

const PREVIEW_COUNT = 6;

interface Props { portfolioId: string; assetId: string; currency: string; }

/**
 * Actif non coté : ses valeurs liquidatives saisies (relevés). Entre deux
 * valeurs, la dernière connue s'applique ; sans valeur, le prix de la dernière
 * opération.
 */
export function ValuationsSection({ portfolioId, assetId, currency }: Props) {
  const list = useValuations(portfolioId, assetId).data ?? [];
  const save = useSaveValuation(portfolioId, assetId);
  const remove = useDeleteValuation(portfolioId, assetId);
  const [date, setDate] = useState(todayLocal());
  const [price, setPrice] = useState('');
  const [expanded, setExpanded] = useState(false);
  const value = Number(price.replace(',', '.'));

  const submit = () => {
    if (!(value > 0)) return;
    save.mutate({ date, price: value }, {
      onSuccess: () => { toast.success('Valeur enregistrée'); setPrice(''); },
    });
  };

  return (
    <section>
      <SectionHeader title="Valeurs saisies" action={<span className="text-[11px] text-muted-foreground">actif non coté</span>} />
      <Card className="p-4 gap-3">
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <PenLine size={14} className="mt-px shrink-0 text-primary" />
          Reporte la valeur d'une part indiquée sur tes relevés : la ligne et la courbe suivent. Entre deux valeurs, la dernière connue s'applique.
        </p>
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <Input label="Date" type="date" max={todayLocal()} value={date} onChange={e => setDate(e.target.value)} />
          <Input label={`Valeur (${currency === 'EUR' ? '€' : currency})`} type="number" inputMode="decimal"
            step="any" min="0" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
          <Button type="button" onClick={submit} disabled={!(value > 0)} loading={save.isPending}>Ajouter</Button>
        </div>
        {save.isError && <FormError message={save.error.message} />}
        {list.length > 0 && (
          <ul className="divide-y divide-border">
            {(expanded ? list : list.slice(0, PREVIEW_COUNT)).map(v => (
              <li key={v.date} className="flex items-center gap-3 py-2 text-sm">
                <span className="flex-1 text-muted-foreground">{formatDate(v.date)}</span>
                <span className="font-medium tabular-nums">{formatMoney(v.price, v.currency ?? currency)}</span>
                <button type="button" aria-label={`Supprimer la valeur du ${formatDate(v.date)}`}
                  onClick={() => remove.mutate(v.date, { onError: e => toast.error(e.message) })}
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-loss">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {list.length > PREVIEW_COUNT && (
          <button type="button" onClick={() => setExpanded(e => !e)} className="self-start text-xs text-primary">
            {expanded ? 'Afficher moins' : `Tout afficher (${list.length})`}
          </button>
        )}
      </Card>
    </section>
  );
}
