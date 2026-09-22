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
import { AssetPicker } from './AssetPicker';
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/features/transactions/api/transaction.api';
import type { TransactionResponse } from '../model/transaction.types';
import type { AvailableAssetResponse } from '@/features/assets/model/asset.types';

const num = (msg: string) => z.coerce.number({ error: msg }).min(0, msg);

const schema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  quantity: num('Quantité invalide'),
  pricePerUnit: num('Prix invalide'),
  fees: num('Frais invalides').default(0),
  currency: z.string().regex(/^[A-Z]{3}$/, 'Code ISO à 3 lettres'),
  transactionDate: z.string().min(1, 'Date requise')
    .refine(d => new Date(d) <= new Date(), 'La date ne peut pas être dans le futur'),
  notes: z.string().max(500, '500 caractères max').optional(),
}).superRefine((v, ctx) => {
  // Miroir de validateBusinessRules côté back
  if (v.type !== 'DIVIDEND' && v.quantity <= 0) ctx.addIssue({ path: ['quantity'], code: 'custom', message: 'Quantité > 0 requise' });
  if (v.type !== 'DIVIDEND' && v.pricePerUnit <= 0) ctx.addIssue({ path: ['pricePerUnit'], code: 'custom', message: 'Prix > 0 requis' });
  if (v.type === 'DIVIDEND' && v.pricePerUnit <= 0) ctx.addIssue({ path: ['pricePerUnit'], code: 'custom', message: 'Montant > 0 requis' });
});
type Form = z.infer<typeof schema>;

// datetime-local attend "YYYY-MM-DDTHH:mm" ; le back attend un LocalDateTime ISO
const toLocalInput = (iso?: string) => (iso ? iso : new Date().toISOString()).slice(0, 16);
const toIso = (local: string) => `${local}:00`;

interface Props {
  portfolioId: string; open: boolean; onClose: () => void;
  initial?: TransactionResponse;          // mode édition
  lockedSymbol?: string;                  // pré-sélection depuis une page position
}

export function TransactionFormSheet({ portfolioId, open, onClose, initial, lockedSymbol }: Props) {
  const isEdit = !!initial;
  const [asset, setAsset] = useState<Pick<AvailableAssetResponse, 'symbol' | 'name' | 'currency'> | null>(null);

  type FormInput = z.input<typeof schema>;   // ce que react-hook-form manipule (avant coercion)
  type FormOutput = z.output<typeof schema>; // ce que tu reçois dans onSubmit (après coercion)

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'BUY', quantity: 0, pricePerUnit: 0, fees: 0, currency: 'EUR', transactionDate: toLocalInput() },
  });
  const { register, handleSubmit, setError, reset, setValue, control, formState: { errors } } = form;

  // (Re)initialisation à l'ouverture
  useEffect(() => {
    if (!open) return;
    if (initial) {
      setAsset({ symbol: initial.symbol, name: initial.assetName, currency: initial.currency });
      reset({
        type: initial.type, quantity: initial.quantity, pricePerUnit: initial.pricePerUnit, fees: initial.fees,
        currency: initial.currency, transactionDate: toLocalInput(initial.transactionDate), notes: initial.notes ?? ''
      });
    } else {
      setAsset(lockedSymbol ? { symbol: lockedSymbol, name: lockedSymbol, currency: 'EUR' } : null);
      reset({ type: 'BUY', quantity: 0, pricePerUnit: 0, fees: 0, currency: 'EUR', transactionDate: toLocalInput() });
    }
  }, [open, initial, lockedSymbol, reset]);

  const create = useCreateTransaction(portfolioId);
  const update = useUpdateTransaction(portfolioId);
  const remove = useDeleteTransaction(portfolioId);
  const mutation = isEdit ? update : create;

  const [type, quantity, price, fees] = useWatch({ control, name: ['type', 'quantity', 'pricePerUnit', 'fees'] });
  const total = type === 'DIVIDEND' ? Number(price) || 0 : (Number(quantity) || 0) * (Number(price) || 0);

  const applyServerErrors = (e: { fieldErrors?: { field: string; message: string }[] }) =>
    e.fieldErrors?.forEach(f => setError(f.field as keyof Form, { message: f.message }));

  const onSubmit: SubmitHandler<FormInput> = (raw) => {
    const v = schema.parse(raw) as FormOutput;
    if (!asset) return;
    const body = { ...v, transactionDate: toIso(v.transactionDate), notes: v.notes || undefined };
    const opts = { onSuccess: onClose, onError: applyServerErrors };
    isEdit
      ? update.mutate({ id: initial!.id, body }, opts)
      : create.mutate({ ...body, symbol: asset.symbol }, opts);
  };

  const onDelete = () => {
    if (initial && confirm('Supprimer cette transaction ?')) remove.mutate(initial.id, { onSuccess: onClose });
  };

  const title = isEdit ? 'Modifier la transaction' : asset ? asset.symbol : 'Choisir un actif';

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      {!asset ? (
        <AssetPicker portfolioId={portfolioId} onSelect={a => { setAsset(a); setValue('currency', a.currency); }} />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && !lockedSymbol && (
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
            <Input label="Devise" maxLength={3} className="uppercase" {...register('currency', { setValueAs: v => String(v).toUpperCase() })} error={errors.currency?.message} />
          </div>

          <Input label="Date" type="datetime-local" max={toLocalInput()} {...register('transactionDate')} error={errors.transactionDate?.message} />
          <Input label="Notes (optionnel)" {...register('notes')} error={errors.notes?.message} />

          <div className="flex justify-between text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">Total {type === 'BUY' ? 'à débourser' : 'perçu'}</span>
            <MoneyValue value={type === 'BUY' ? total + (Number(fees) || 0) : total - (Number(fees) || 0)} currency={asset.currency} className="font-semibold" />
          </div>

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