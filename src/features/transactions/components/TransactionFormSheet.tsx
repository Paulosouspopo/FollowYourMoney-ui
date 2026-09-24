import { useEffect, useState } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { TRANSACTION_TYPES, TRANSACTION_TYPE_LABEL, type TransactionType } from '@/shared/model/enums';
import { AssetSearchCombobox } from './AssetSearchCombobox';
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/features/transactions/api/transaction.api';
import type { TransactionResponse } from '../model/transaction.types';

const num = (msg: string) => z.coerce.number({ error: msg }).min(0, msg);
const ISO_CURRENCY = /^[A-Z]{3}$/;

const schema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  quantity: num('Quantité invalide'),
  pricePerUnit: num('Prix invalide'),
  fees: num('Frais invalides').default(0),
  currency: z.string().regex(ISO_CURRENCY, 'Code ISO à 3 lettres'),
  transactionDate: z.string().min(1, 'Date requise')
    .refine(d => new Date(d) <= new Date(), 'La date ne peut pas être dans le futur'),
  notes: z.string().max(500, '500 caractères max').optional(),
}).superRefine((v, ctx) => {
  // Miroir de validateBusinessRules côté back
  if (v.type !== 'DIVIDEND' && v.quantity <= 0) ctx.addIssue({ path: ['quantity'], code: 'custom', message: 'Quantité > 0 requise' });
  if (v.type !== 'DIVIDEND' && v.pricePerUnit <= 0) ctx.addIssue({ path: ['pricePerUnit'], code: 'custom', message: 'Prix > 0 requis' });
  if (v.type === 'DIVIDEND' && v.pricePerUnit <= 0) ctx.addIssue({ path: ['pricePerUnit'], code: 'custom', message: 'Montant > 0 requis' });
});
type FormInput = z.input<typeof schema>;   // ce que react-hook-form manipule (avant coercion)
type FormOutput = z.output<typeof schema>; // ce que reçoit onSubmit (après coercion)

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
  initial?: TransactionResponse;                                       // mode édition
  lockedAsset?: SelectedAsset & { currency?: string | null };         // pré-sélection depuis une page position
}

export function TransactionFormSheet({ portfolioId, open, onClose, initial, lockedAsset }: Props) {
  const isEdit = !!initial;
  const [asset, setAsset] = useState<SelectedAsset | null>(null);

  const defaults = (): FormInput => ({
    type: 'BUY', quantity: 0, pricePerUnit: 0, fees: 0,
    currency: lockedAsset?.currency ?? 'EUR', transactionDate: nowLocalInput(), notes: '',
  });

  const form = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: defaults() });
  const { register, handleSubmit, setError, reset, setValue, control, formState: { errors } } = form;

  // (Re)initialisation à l'ouverture
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setAsset({ symbol: initial.symbol, name: initial.assetName });
      reset({
        type: initial.type,
        quantity: initial.quantity,
        pricePerUnit: initial.type === 'DIVIDEND' ? initial.totalAmount : initial.pricePerUnit,
        fees: initial.fees,
        currency: initial.currency,
        transactionDate: toLocalInput(initial.transactionDate),
        notes: initial.notes ?? '',
      });
    } else {
      setAsset(lockedAsset ? { symbol: lockedAsset.symbol, name: lockedAsset.name } : null);
      reset(defaults());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, lockedAsset?.symbol, reset]);

  const create = useCreateTransaction(portfolioId);
  const update = useUpdateTransaction(portfolioId);
  const remove = useDeleteTransaction(portfolioId);
  const mutation = isEdit ? update : create;

  const [type, quantity, price, fees, currency] = useWatch({ control, name: ['type', 'quantity', 'pricePerUnit', 'fees', 'currency'] });
  const total = type === 'DIVIDEND' ? Number(price) || 0 : (Number(quantity) || 0) * (Number(price) || 0);
  // Intl lève une RangeError sur un code devise incomplet pendant la saisie
  const displayCurrency = ISO_CURRENCY.test(currency ?? '') ? currency : 'EUR';

  const applyServerErrors = (e: { fieldErrors?: { field: string; message: string }[] }) =>
    e.fieldErrors?.forEach(f => setError(f.field as keyof FormInput, { message: f.message }));

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
    const opts = { onSuccess: onClose, onError: applyServerErrors };
    if (isEdit) update.mutate({ id: initial!.id, body: common }, opts);
    else create.mutate({ ...common, symbol: asset.symbol, currency: v.currency }, opts);
  };

  const onDelete = () => {
    if (initial && confirm('Supprimer cette transaction ?')) remove.mutate(initial.id, { onSuccess: onClose });
  };

  const title = isEdit ? 'Modifier la transaction' : asset ? asset.symbol : 'Choisir un actif';

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {!asset ? (
        <div className="space-y-4">
          <AssetSearchCombobox onChange={r => setAsset({ symbol: r.symbol, name: r.name })} placeholder="Bitcoin, Apple, TotalEnergies..." />
          <p className="text-xs text-muted-foreground">Recherche parmi les actions, ETF et cryptos disponibles sur Yahoo Finance.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && !lockedAsset && (
            <button type="button" onClick={() => setAsset(null)} className="text-xs text-primary">← Changer d'actif ({asset.name})</button>
          )}

          <SegmentedControl<TransactionType> value={type} onChange={v => setValue('type', v)}
            options={TRANSACTION_TYPES.map(t => ({ value: t, label: TRANSACTION_TYPE_LABEL[t] }))} />

          <div className="grid grid-cols-2 gap-3">
            {type !== 'DIVIDEND' && (
              <Input label="Quantité" type="number" inputMode="decimal" step="any" {...register('quantity')} error={errors.quantity?.message} />
            )}
            <Input label={type === 'DIVIDEND' ? 'Montant reçu' : 'Prix unitaire'} type="number" inputMode="decimal" step="any"
              {...register('pricePerUnit')} error={errors.pricePerUnit?.message} />
            <Input label="Frais" type="number" inputMode="decimal" step="any" {...register('fees')} error={errors.fees?.message} />
            <Input label="Devise" maxLength={3} className="uppercase" disabled={isEdit}
              hint={isEdit ? 'Non modifiable' : 'Devise de l\'opération'}
              {...register('currency', { setValueAs: v => String(v).toUpperCase() })} error={errors.currency?.message} />
          </div>

          <Input label="Date" type="datetime-local" max={nowLocalInput()} {...register('transactionDate')} error={errors.transactionDate?.message} />
          <Input label="Notes (optionnel)" {...register('notes')} error={errors.notes?.message} />

          <div className="flex justify-between text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">Total {type === 'BUY' ? 'à débourser' : 'perçu'}</span>
            <MoneyValue value={type === 'BUY' ? total + (Number(fees) || 0) : total - (Number(fees) || 0)} currency={displayCurrency} className="font-semibold" />
          </div>

          {mutation.isPending && (
            <p className="text-xs text-muted-foreground">Mise à jour de l'historique des cours… cela peut prendre quelques secondes pour une opération ancienne.</p>
          )}
          {mutation.isError && !mutation.error.fieldErrors && <FormError message={mutation.error.message} />}

          <div className="flex gap-2">
            {isEdit && <Button type="button" variant="ghost" onClick={onDelete} loading={remove.isPending} aria-label="Supprimer"><Trash2 size={18} /></Button>}
            <Button type="submit" className="flex-1" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      )}
    </BottomSheet>
  );
}
