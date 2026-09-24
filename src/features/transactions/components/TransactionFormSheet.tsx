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
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABEL, type TransactionType } from '@/shared/model/enums';
import { CURRENCIES } from '@/shared/model/currencies';
import { formatQty } from '@/shared/lib/format';
import type { ApiError } from '@/shared/api/types';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/features/transactions/api/transaction.api';
import type { TransactionResponse } from '../model/transaction.types';

const num = (msg: string) => z.coerce.number({ error: msg }).min(0, msg);

const schema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  quantity: num('Quantité invalide'),
  pricePerUnit: num('Prix invalide'),
  fees: num('Frais invalides'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Code ISO à 3 lettres'),
  transactionDate: z.string().min(1, 'Date requise')
    .refine(d => new Date(d) <= new Date(), 'La date ne peut pas être dans le futur'),
  notes: z.string().max(500, '500 caractères max').optional(),
}).superRefine((v, ctx) => {
  // Miroir de validateBusinessRules côté back
  if (v.type !== 'DIVIDEND' && v.quantity <= 0) ctx.addIssue({ path: ['quantity'], code: 'custom', message: 'Quantité > 0 requise' });
  if (v.pricePerUnit <= 0) ctx.addIssue({ path: ['pricePerUnit'], code: 'custom', message: v.type === 'DIVIDEND' ? 'Montant > 0 requis' : 'Prix > 0 requis' });
});
type FormInput = z.input<typeof schema>;   // ce que react-hook-form manipule (avant coercion)
type FormOutput = z.output<typeof schema>; // ce que reçoit onSubmit (après coercion)
const FORM_FIELDS = ['type', 'quantity', 'pricePerUnit', 'fees', 'currency', 'transactionDate', 'notes'] as const;

// datetime-local attend "YYYY-MM-DDTHH:mm" en heure LOCALE ; le back attend un
// LocalDateTime sans fuseau. Surtout pas toISOString() (UTC → décalage de date).
const pad = (n: number) => String(n).padStart(2, '0');
const nowLocalInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const toLocalInput = (localDateTime: string) => localDateTime.slice(0, 16);
const toIso = (local: string) => `${local}:00`;

/**
 * Le back calcule totalAmount = quantity × pricePerUnit, y compris pour un
 * dividende. Le formulaire saisit le montant total reçu : on l'envoie avec
 * quantity = 1 pour que totalAmount = montant.
 */
const DIVIDEND_QUANTITY = 1;

interface SelectedAsset { symbol: string; name: string; }

interface Props {
  portfolioId: string; open: boolean; onClose: () => void;
  initial?: TransactionResponse;                                  // mode édition
  lockedAsset?: SelectedAsset & { currency?: string | null };    // pré-sélection depuis une page position
  /** Quantités détenues par symbole : avertit d'une vente supérieure (le back reste l'arbitre). */
  heldQuantities?: Record<string, number>;
}

/** Monté uniquement quand la feuille est ouverte : chaque ouverture repart d'un état neuf. */
export function TransactionFormSheet(props: Props) {
  if (!props.open) return null;
  return <TransactionForm key={props.initial?.id ?? 'new'} {...props} />;
}

function initialValues(initial?: TransactionResponse, currency?: string | null): FormInput {
  if (initial) {
    return {
      type: initial.type,
      quantity: initial.quantity,
      pricePerUnit: initial.type === 'DIVIDEND' ? initial.totalAmount : initial.pricePerUnit,
      fees: initial.fees,
      currency: initial.currency,
      transactionDate: toLocalInput(initial.transactionDate),
      notes: initial.notes ?? '',
    };
  }
  // Champs numériques vides (placeholder "0") : taper "1" donne 1, pas "01"
  return { type: 'BUY', quantity: '', pricePerUnit: '', fees: '', currency: currency ?? 'EUR', transactionDate: nowLocalInput(), notes: '' };
}

function TransactionForm({ portfolioId, onClose, initial, lockedAsset, heldQuantities }: Props) {
  const isEdit = !!initial;
  const [asset, setAsset] = useState<SelectedAsset | null>(
    initial ? { symbol: initial.symbol, name: initial.assetName }
      : lockedAsset ? { symbol: lockedAsset.symbol, name: lockedAsset.name } : null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, setError, setValue, control, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: initialValues(initial, lockedAsset?.currency),
  });

  const create = useCreateTransaction(portfolioId);
  const update = useUpdateTransaction(portfolioId);
  const remove = useDeleteTransaction(portfolioId);
  const mutation = isEdit ? update : create;

  const [type, quantity, price, fees, currency] = useWatch({ control, name: ['type', 'quantity', 'pricePerUnit', 'fees', 'currency'] });
  const total = type === 'DIVIDEND' ? Number(price) || 0 : (Number(quantity) || 0) * (Number(price) || 0);
  const held = asset ? heldQuantities?.[asset.symbol] ?? 0 : 0;
  const oversell = !isEdit && type === 'SELL' && heldQuantities !== undefined && (Number(quantity) || 0) > held;
  const currencyOptions = [...new Set([...CURRENCIES, currency])].map(c => ({ value: c, label: c }));

  const applyServerErrors = (e: ApiError) => {
    const unmapped: string[] = [];
    e.fieldErrors?.forEach(f => (FORM_FIELDS as readonly string[]).includes(f.field)
      ? setError(f.field as keyof FormInput, { message: f.message })
      : unmapped.push(f.message));
    if (!e.fieldErrors?.length || unmapped.length) setError('root.server', { message: unmapped.join(' · ') || e.message });
  };

  const onSubmit: SubmitHandler<FormOutput> = (v) => {
    if (!asset) return;
    const common = {
      type: v.type,
      quantity: v.type === 'DIVIDEND' ? DIVIDEND_QUANTITY : v.quantity,
      pricePerUnit: v.pricePerUnit,
      fees: v.fees,
      transactionDate: toIso(v.transactionDate),
      notes: v.notes || undefined,
    };
    const onSuccess = () => { toast.success(isEdit ? 'Transaction modifiée' : 'Transaction ajoutée'); onClose(); };
    if (isEdit) update.mutate({ id: initial!.id, body: common }, { onSuccess, onError: applyServerErrors });
    else create.mutate({ ...common, symbol: asset.symbol, currency: v.currency }, { onSuccess, onError: applyServerErrors });
  };

  const onDelete = () => {
    if (!initial) return;
    remove.mutate(initial.id, {
      onSuccess: () => { toast.success('Transaction supprimée'); onClose(); },
      onError: e => { setConfirmDelete(false); toast.error(e.message); },
    });
  };

  const title = isEdit ? 'Modifier la transaction' : asset ? asset.name : 'Choisir un actif';

  return (
    <BottomSheet open onClose={onClose} title={title}>
      {!asset ? (
        <div className="space-y-4">
          <AssetSearchCombobox onChange={r => setAsset({ symbol: r.symbol, name: r.name })} placeholder="Bitcoin, Apple, TotalEnergies..." />
          <p className="text-xs text-muted-foreground">Recherche parmi les actions, ETF et cryptos disponibles sur Yahoo Finance.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{asset.symbol}</span>
            {!isEdit && !lockedAsset && (
              <button type="button" onClick={() => setAsset(null)} className="text-primary">Changer d'actif</button>
            )}
          </div>

          <SegmentedControl<TransactionType> fullWidth value={type} onChange={v => setValue('type', v)}
            options={TRANSACTION_TYPES.map(t => ({ value: t, label: TRANSACTION_TYPE_LABEL[t] }))} />

          <div className="grid grid-cols-2 gap-3">
            {type !== 'DIVIDEND' && (
              <Input label="Quantité" type="number" inputMode="decimal" step="any" min="0" placeholder="0"
                {...register('quantity')} error={errors.quantity?.message} />
            )}
            <Input label={type === 'DIVIDEND' ? 'Montant reçu' : 'Prix unitaire'} type="number" inputMode="decimal" step="any" min="0" placeholder="0"
              {...register('pricePerUnit')} error={errors.pricePerUnit?.message} />
            <Input label="Frais" type="number" inputMode="decimal" step="any" min="0" placeholder="0"
              {...register('fees')} error={errors.fees?.message} />
            <Controller name="currency" control={control} render={({ field }) => (
              <FormSelect label="Devise" value={field.value} onChange={field.onChange} options={currencyOptions}
                disabled={isEdit} hint={isEdit ? 'Non modifiable' : undefined} error={errors.currency?.message} />
            )} />
          </div>

          {oversell && (
            <p className="flex items-start gap-1.5 text-xs text-warning">
              <AlertTriangle size={14} className="shrink-0 mt-px" />
              Tu ne détiens que {formatQty(held)} {asset.symbol} : la vente sera refusée.
            </p>
          )}

          <Input label="Date" type="datetime-local" max={nowLocalInput()} {...register('transactionDate')} error={errors.transactionDate?.message} />
          <Input label="Notes (optionnel)" {...register('notes')} error={errors.notes?.message} />

          <div className="flex justify-between text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">Total {type === 'BUY' ? 'à débourser' : 'perçu'}</span>
            <MoneyValue value={type === 'BUY' ? total + (Number(fees) || 0) : total - (Number(fees) || 0)} currency={currency} className="font-semibold" />
          </div>

          {mutation.isPending && (
            <p className="text-xs text-muted-foreground">Mise à jour de l'historique des cours… cela peut prendre quelques secondes pour une opération ancienne.</p>
          )}
          <FormError message={errors.root?.server?.message} />

          <div className="flex gap-2">
            {isEdit && (
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} aria-label="Supprimer"><Trash2 size={18} /></Button>
            )}
            <Button type="submit" className="flex-1" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      )}
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Supprimer cette transaction ?"
        description="La valorisation et l'historique du portefeuille seront recalculés." onConfirm={onDelete} loading={remove.isPending} />
    </BottomSheet>
  );
}
