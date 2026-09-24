import { useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Trash2 } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { FormError } from '@/shared/ui/FormError';
import { FormSelect } from '@/shared/ui/form-select';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/toast.store';
import { formatDate } from '@/shared/lib/format';
import { todayLocal } from '@/shared/lib/dates';
import type { ApiError } from '@/shared/api/types';
import type { PortfolioType } from '@/shared/model/enums';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';
import { useCreatePlan, useDeletePlan, useUpdatePlan } from '../api/plan.api';
import {
  PLAN_FREQUENCIES, PLAN_FREQUENCY_LABEL, PLAN_TYPE_LABEL, type PlanResponse, type PlanType,
} from '../model/plan.types';

const money = (msg: string) => z.coerce.number({ error: msg });

const schema = z.object({
  type: z.enum(['BUY', 'DEPOSIT']),
  amount: money('Montant invalide').gt(0, 'Montant > 0 requis'),
  fees: money('Frais invalides').min(0, 'Frais ≥ 0'),
  frequency: z.enum(PLAN_FREQUENCIES),
  startDate: z.string().min(1, 'Date requise'),
  endDate: z.string(),
  fractional: z.boolean(),
  active: z.boolean(),
}).superRefine((v, ctx) => {
  if (v.fees >= v.amount) ctx.addIssue({ path: ['fees'], code: 'custom', message: 'Les frais doivent être inférieurs au montant' });
  if (v.endDate && v.endDate < v.startDate) ctx.addIssue({ path: ['endDate'], code: 'custom', message: 'Doit suivre la date de début' });
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  portfolioId: string;
  portfolioType: PortfolioType;
  cashTracking: boolean;
  open: boolean;
  onClose: () => void;
  initial?: PlanResponse;
}

/** Monté uniquement quand la feuille est ouverte : chaque ouverture repart d'un état neuf. */
export function PlanFormSheet(props: Props) {
  if (!props.open) return null;
  return <PlanForm key={props.initial?.id ?? 'new'} {...props} />;
}

/** Types de plan possibles selon le compte : un livret ne fait que des versements. */
function allowedTypes(portfolioType: PortfolioType, cashTracking: boolean): PlanType[] {
  if (portfolioType === 'LIVRET') return ['DEPOSIT'];
  return cashTracking ? ['BUY', 'DEPOSIT'] : ['BUY'];
}

function PlanForm({ portfolioId, portfolioType, cashTracking, onClose, initial }: Props) {
  const isEdit = !!initial;
  const locked = (initial?.occurrences ?? 0) > 0; // actif, fréquence et début figés après une échéance
  const types = allowedTypes(portfolioType, cashTracking);
  const [asset, setAsset] = useState<AssetSearchResult | null>(
    initial?.symbol ? { symbol: initial.symbol, name: initial.name, exchange: null, assetType: 'ACTION' } : null);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, setValue, setError, control, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          type: initial.type, amount: initial.amount, fees: initial.fees, frequency: initial.frequency,
          startDate: initial.startDate, endDate: initial.endDate ?? '', fractional: initial.fractional, active: initial.active,
        }
      : { type: types[0], amount: '', fees: '', frequency: 'MONTHLY', startDate: todayLocal(), endDate: '', fractional: true, active: true },
  });
  const [type, startDate] = useWatch({ control, name: ['type', 'startDate'] });

  const create = useCreatePlan(portfolioId);
  const update = useUpdatePlan(portfolioId);
  const remove = useDeletePlan(portfolioId);
  const mutation = isEdit ? update : create;

  const onSubmit: SubmitHandler<FormOutput> = (v) => {
    if (v.type === 'BUY' && !asset) return setAssetError('Choisis l\'actif à acheter');
    const body = {
      ...v,
      symbol: v.type === 'BUY' ? asset!.symbol : null,
      fees: v.type === 'BUY' ? v.fees : 0,
      endDate: v.endDate || null,
    };
    const onSuccess = (plan: PlanResponse) => {
      toast.success(isEdit ? 'Plan modifié' : plan.occurrences > 0
        ? `Plan créé : ${plan.occurrences} échéance${plan.occurrences > 1 ? 's' : ''} passée${plan.occurrences > 1 ? 's' : ''} ajoutée${plan.occurrences > 1 ? 's' : ''}`
        : 'Plan créé');
      onClose();
    };
    const onError = (e: ApiError) => e.fieldErrors?.length
      ? e.fieldErrors.forEach(f => setError(f.field as keyof FormInput, { message: f.message }))
      : setError('root.server', { message: e.message });
    if (isEdit) update.mutate({ id: initial!.id, body }, { onSuccess, onError });
    else create.mutate(body, { onSuccess, onError });
  };

  const backfill = !isEdit && startDate && startDate < todayLocal();

  return (
    <BottomSheet open onClose={onClose} title={isEdit ? 'Modifier le plan' : 'Investissement programmé'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {types.length > 1 && (
          <SegmentedControl<PlanType> fullWidth value={type} onChange={v => !locked && setValue('type', v)}
            options={types.map(t => ({ value: t, label: PLAN_TYPE_LABEL[t] }))} />
        )}

        {type === 'BUY' && (
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Actif</span>
            <AssetSearchCombobox value={asset} disabled={locked} placeholder="ETF, action, crypto…"
              onChange={r => { setAsset(r); setAssetError(null); }} />
            {assetError && <p className="text-xs text-destructive">{assetError}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Montant par échéance (€)" type="number" inputMode="decimal" step="any" min="0" placeholder="100"
            {...register('amount')} error={errors.amount?.message} />
          {type === 'BUY' && (
            <Input label="Frais par échéance (€)" type="number" inputMode="decimal" step="any" min="0" placeholder="0"
              {...register('fees')} error={errors.fees?.message} />
          )}
          <Controller name="frequency" control={control} render={({ field }) => (
            <FormSelect label="Fréquence" value={field.value} onChange={field.onChange} disabled={locked}
              options={PLAN_FREQUENCIES.map(f => ({ value: f, label: PLAN_FREQUENCY_LABEL[f] }))} />
          )} />
          <Input label="Première échéance" type="date" disabled={locked} {...register('startDate')} error={errors.startDate?.message} />
          <Input label="Fin (optionnel)" type="date" {...register('endDate')} error={errors.endDate?.message} />
        </div>

        {type === 'BUY' && (
          <Controller name="fractional" control={control} render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Fractions de parts"
              description="Désactive pour un courtier qui n'achète que des parts entières (PEA classique) : le reliquat reste en espèces." />
          )} />
        )}
        {isEdit && (
          <Controller name="active" control={control} render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Plan actif"
              description="En pause, aucune échéance n'est exécutée ni rattrapée à la reprise." />
          )} />
        )}

        {backfill && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <CalendarClock size={14} className="shrink-0 mt-px" />
            Les échéances depuis le {formatDate(startDate)} seront créées au cours de clôture de chaque jour (prix estimé).
          </p>
        )}
        {locked && <p className="text-xs text-muted-foreground">Actif, fréquence et date de début sont figés après la première échéance.</p>}
        {mutation.isPending && <p className="text-xs text-muted-foreground">Création des échéances et recalcul de l'historique…</p>}
        <FormError message={errors.root?.server?.message} />

        <div className="flex gap-2">
          {isEdit && (
            <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} aria-label="Supprimer le plan"><Trash2 size={18} /></Button>
          )}
          <Button type="submit" className="flex-1" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Programmer'}</Button>
        </div>
      </form>
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Supprimer ce plan ?"
        description="Les opérations déjà créées par le plan restent dans le portefeuille." loading={remove.isPending}
        onConfirm={() => initial && remove.mutate(initial.id, {
          onSuccess: () => { toast.success('Plan supprimé'); onClose(); },
          onError: e => toast.error(e.message),
        })} />
    </BottomSheet>
  );
}
