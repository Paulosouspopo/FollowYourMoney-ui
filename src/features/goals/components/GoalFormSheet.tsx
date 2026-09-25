import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { FormSelect } from '@/shared/ui/form-select';
import { FormError } from '@/shared/ui/FormError';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/toast.store';
import { todayLocal } from '@/shared/lib/dates';
import { usePortfolios } from '@/features/portfolios/api/portfolio.api';
import { useDeleteGoal, useSaveGoal } from '../api/goal.api';
import type { Goal } from '../model/goal.types';

const ALL = 'ALL';

interface Props { open: boolean; onClose: () => void; initial?: Goal; }

/** Monté seulement à l'ouverture : chaque ouverture repart d'un état neuf. */
export function GoalFormSheet(props: Props) {
  if (!props.open) return null;
  return <GoalForm key={props.initial?.id ?? 'new'} {...props} />;
}

function GoalForm({ onClose, initial }: Props) {
  const portfolios = usePortfolios();
  const save = useSaveGoal();
  const remove = useDeleteGoal();
  const [name, setName] = useState(initial?.name ?? '');
  const [amount, setAmount] = useState(initial ? String(initial.targetAmount) : '');
  const [date, setDate] = useState(initial?.targetDate ?? '');
  const [scope, setScope] = useState(initial?.portfolioId ?? ALL);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const submit = () => {
    const target = Number(amount.replace(',', '.'));
    if (!name.trim()) return setError('Donne un nom à ton objectif');
    if (!(target >= 1)) return setError('Indique un montant à atteindre');
    if (date && date <= todayLocal()) return setError("L'échéance doit être dans le futur");
    setError(null);
    save.mutate({
      id: initial?.id,
      body: { name: name.trim(), targetAmount: target, targetDate: date || null, portfolioId: scope === ALL ? null : scope },
    }, {
      onSuccess: () => { toast.success(initial ? 'Objectif modifié' : 'Objectif créé'); onClose(); },
      onError: e => setError(e.message),
    });
  };

  return (
    <BottomSheet open onClose={onClose} onBack={initial ? onClose : undefined}
      title={initial ? "Modifier l'objectif" : 'Nouvel objectif'}>
      <div className="space-y-4">
        <Input label="Nom" placeholder="Apport immobilier, 100 000 €, retraite…" maxLength={100}
          value={name} onChange={e => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Montant à atteindre (€)" type="number" inputMode="decimal" min="1" step="any" placeholder="50000"
            value={amount} onChange={e => setAmount(e.target.value)} />
          <Input label="Échéance (facultatif)" type="date" min={todayLocal()} value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <FormSelect label="Périmètre" value={scope} onChange={setScope}
          options={[{ value: ALL, label: 'Tout mon patrimoine' },
            ...(portfolios.data ?? []).map(p => ({ value: p.id, label: p.name }))]} />
        <FormError message={error ?? undefined} />
        <div className="flex gap-2">
          {initial && (
            <Button type="button" variant="destructive" aria-label="Supprimer l'objectif" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={18} />
            </Button>
          )}
          {initial && <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>}
          <Button className="flex-1" loading={save.isPending} onClick={submit}>{initial ? 'Enregistrer' : "Créer l'objectif"}</Button>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Supprimer cet objectif ?" loading={remove.isPending}
        onConfirm={() => initial && remove.mutate(initial.id, {
          onSuccess: () => { toast.success('Objectif supprimé'); onClose(); },
          onError: e => toast.error(e.message),
        })} />
    </BottomSheet>
  );
}
