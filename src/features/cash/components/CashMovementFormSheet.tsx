import { useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { FormSelect } from '@/shared/ui/form-select';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/toast.store';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { CASH_MOVEMENT_LABEL, CASH_MOVEMENT_SIGN, CASH_MOVEMENT_TYPES, type CashMovementType, type PortfolioType } from '@/shared/model/enums';
import { CASH_CURRENCIES, movementTypes } from '@/shared/model/portfolioRules';
import { todayLocal } from '@/shared/lib/dates';
import type { ApiError } from '@/shared/api/types';
import { undoAction } from '@/features/trash/api/trash.api';
import { useCreateCashMovement, useDeleteCashMovement, useUpdateCashMovement } from '../api/cash.api';
import type { CashMovementPrefill, CashMovementRequest, CashMovementResponse } from '../model/cash.types';

const schema = z.object({
  type: z.enum(CASH_MOVEMENT_TYPES),
  amount: z.coerce.number({ error: 'Montant invalide' }).gt(0, 'Montant > 0 requis'),
  currency: z.string(),
  // Change seulement : montant reçu et sa devise
  counterAmount: z.union([z.literal(''), z.coerce.number({ error: 'Montant invalide' }).gt(0, 'Montant > 0 requis')]),
  counterCurrency: z.string(),
  movementDate: z.string().min(1, 'Date requise').refine(d => d <= todayLocal(), 'La date ne peut pas être dans le futur'),
  notes: z.string().max(500, '500 caractères max').optional(),
}).superRefine((v, ctx) => {
  if (v.type !== 'CONVERSION') return;
  if (v.counterAmount === '') ctx.addIssue({ code: 'custom', path: ['counterAmount'], message: 'Montant reçu requis' });
  if (v.counterCurrency === v.currency) ctx.addIssue({ code: 'custom', path: ['counterCurrency'], message: 'Choisis une autre devise' });
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;
const FORM_FIELDS = ['type', 'amount', 'currency', 'counterAmount', 'counterCurrency', 'movementDate', 'notes'] as const;

interface Props {
  portfolioId: string; open: boolean; onClose: () => void;
  initial?: CashMovementResponse;
  /** Nouveau mouvement pré-rempli (intérêts estimés à créditer). */
  prefill?: CashMovementPrefill;
  /** Solde actuel : sur un livret, un débit supérieur est refusé par le back (avertissement avant envoi). */
  balance?: number;
  /** Livret : le solde ne peut jamais être négatif. */
  noOverdraft?: boolean;
  /** Type du portefeuille : abondement proposé en épargne salariale et PER. */
  portfolioType?: PortfolioType;
  /** Compte multidevise : devise du montant et changes. */
  multiCurrency?: boolean;
}

/** Monté uniquement quand la feuille est ouverte : chaque ouverture repart d'un état neuf. */
export function CashMovementFormSheet(props: Props) {
  if (!props.open) return null;
  return <CashMovementForm key={props.initial?.id ?? 'new'} {...props} />;
}

const currencyOptions = CASH_CURRENCIES.map(c => ({ value: c, label: c }));

function CashMovementForm({ portfolioId, onClose, initial, prefill, balance, noOverdraft, portfolioType = 'CTO',
  multiCurrency = false }: Props) {
  const isEdit = !!initial;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const types = movementTypes(portfolioType, multiCurrency);
  const { register, handleSubmit, setValue, setError, control, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          type: initial.type, amount: initial.amount, currency: initial.currency,
          counterAmount: initial.counterAmount ?? '', counterCurrency: initial.counterCurrency ?? 'USD',
          movementDate: initial.movementDate, notes: initial.notes ?? '',
        }
      // Montant vide (placeholder "0") : taper "1" donne 1, pas "01"
      : {
          type: prefill?.type ?? 'DEPOSIT', amount: prefill?.amount ?? '', currency: 'EUR', counterAmount: '',
          counterCurrency: 'USD', movementDate: prefill?.movementDate ?? todayLocal(), notes: prefill?.notes ?? '',
        },
  });

  const create = useCreateCashMovement(portfolioId);
  const update = useUpdateCashMovement(portfolioId);
  const remove = useDeleteCashMovement(portfolioId);
  const mutation = isEdit ? update : create;

  const [type, amount, currency] = useWatch({ control, name: ['type', 'amount', 'currency'] });
  const conversion = type === 'CONVERSION';
  const debit = CASH_MOVEMENT_SIGN[type] < 0;
  const overdraft = !isEdit && noOverdraft && debit && balance !== undefined && (Number(amount) || 0) > balance;
  const symbol = currency === 'EUR' ? '€' : currency;

  const applyServerErrors = (e: ApiError) => {
    const unmapped: string[] = [];
    e.fieldErrors?.forEach(f => (FORM_FIELDS as readonly string[]).includes(f.field)
      ? setError(f.field as keyof FormInput, { message: f.message })
      : unmapped.push(f.message));
    if (!e.fieldErrors?.length || unmapped.length) setError('root.server', { message: unmapped.join(' · ') || e.message });
  };

  const onSubmit: SubmitHandler<FormOutput> = (v) => {
    const body: CashMovementRequest = {
      type: v.type, amount: v.amount, movementDate: v.movementDate, notes: v.notes || undefined,
      ...(multiCurrency && { currency: v.currency }),
      ...(v.type === 'CONVERSION' && v.counterAmount !== '' && { counterAmount: v.counterAmount, counterCurrency: v.counterCurrency }),
    };
    const onSuccess = () => { toast.success(isEdit ? 'Mouvement modifié' : `${CASH_MOVEMENT_LABEL[v.type]} enregistré`); onClose(); };
    if (isEdit) update.mutate({ id: initial!.id, body }, { onSuccess, onError: applyServerErrors });
    else create.mutate(body, { onSuccess, onError: applyServerErrors });
  };

  const onDelete = () => initial && remove.mutate(initial.id, {
    onSuccess: r => { toast.success('Mouvement supprimé', undoAction(r)); onClose(); },
    onError: e => { setConfirmDelete(false); toast.error(e.message); },
  });

  return (
    <BottomSheet open onClose={onClose} title={isEdit ? 'Modifier le mouvement' : 'Mouvement d\'argent'}
      onBack={isEdit ? onClose : undefined}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {types.length <= 4 ? (
          <SegmentedControl<CashMovementType> fullWidth value={type} onChange={v => setValue('type', v)}
            options={types.map(t => ({ value: t, label: CASH_MOVEMENT_LABEL[t] }))} />
        ) : (
          <FormSelect label="Type" value={type} onChange={v => setValue('type', v as CashMovementType)}
            hint={type === 'ABONDEMENT' ? "Versé par ton employeur : compté comme un apport, suivi à part."
              : conversion ? 'Change entre deux devises du compte : ni apport ni retrait.' : undefined}
            options={types.map(t => ({ value: t, label: CASH_MOVEMENT_LABEL[t] }))} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input label={conversion ? `Montant vendu (${symbol})` : `Montant (${symbol})`} type="number" inputMode="decimal"
            step="any" min="0" placeholder="0" {...register('amount')} error={errors.amount?.message} />
          {multiCurrency ? (
            <Controller name="currency" control={control} render={({ field }) => (
              <FormSelect label={conversion ? 'Devise vendue' : 'Devise'} value={field.value} onChange={field.onChange}
                options={currencyOptions} />
            )} />
          ) : (
            <Input label="Date" type="date" max={todayLocal()} {...register('movementDate')} error={errors.movementDate?.message} />
          )}
        </div>
        {conversion && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Montant reçu" type="number" inputMode="decimal" step="any" min="0" placeholder="0"
              {...register('counterAmount')} error={errors.counterAmount?.message} />
            <Controller name="counterCurrency" control={control} render={({ field }) => (
              <FormSelect label="Devise reçue" value={field.value} onChange={field.onChange} options={currencyOptions}
                error={errors.counterCurrency?.message} />
            )} />
          </div>
        )}
        {multiCurrency && (
          <Input label="Date" type="date" max={todayLocal()} {...register('movementDate')} error={errors.movementDate?.message} />
        )}
        <Input label="Notes (optionnel)" {...register('notes')} error={errors.notes?.message} />

        {overdraft && (
          <p className="flex items-start gap-1.5 text-xs text-warning">
            <AlertTriangle size={14} className="shrink-0 mt-px" />
            Solde disponible : <MoneyValue value={balance} /> — ce débit sera refusé.
          </p>
        )}

        {mutation.isPending && (
          <p className="text-xs text-muted-foreground">Mise à jour de l'historique… quelques secondes pour une date ancienne.</p>
        )}
        <FormError message={errors.root?.server?.message} />

        <div className="flex gap-2">
          {isEdit && (
            <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} aria-label="Supprimer"><Trash2 size={18} /></Button>
          )}
          {isEdit && <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>}
          <Button type="submit" className="flex-1" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Button>
        </div>
      </form>
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Supprimer ce mouvement ?"
        description="Le solde et l'historique du portefeuille seront recalculés." onConfirm={onDelete} loading={remove.isPending} />
    </BottomSheet>
  );
}
