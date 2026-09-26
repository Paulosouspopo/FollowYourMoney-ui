import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
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
import { nowLocalDateTime } from '@/shared/lib/dates';
import type { ApiError } from '@/shared/api/types';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import { undoAction } from '@/features/trash/api/trash.api';
import { ManualAssetPicker } from '@/features/assets/components/ManualAssetPicker';
import { isManualSymbol } from '@/shared/model/portfolioRules';
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/features/transactions/api/transaction.api';
import type { TransactionResponse } from '../model/transaction.types';
import { TransactionCheckHint } from '@/features/quality/components/TransactionCheckHint';
import { useMarketDetail } from '@/features/markets/api/market.api';
import { useCreateCashMovement } from '@/features/cash/api/cash.api';
import { formatEur } from '@/shared/lib/format';

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
// LocalDateTime sans fuseau (voir shared/lib/dates).
const nowLocalInput = nowLocalDateTime;
// Borne du sélecteur : fin de la journée (le contrôle « pas dans le futur » est fait par le schéma,
// avec un message clair, plutôt que par la bulle du navigateur figée à l'heure d'ouverture)
const endOfTodayInput = () => `${nowLocalDateTime().slice(0, 10)}T23:59`;
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
  /**
   * Solde en euros d'un compte avec suivi des liquidités (hors multidevise) : un achat
   * qui le dépasse propose d'enregistrer le versement manquant le même jour.
   */
  cashBalanceEur?: number;
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

function TransactionForm({ portfolioId, onClose, initial, lockedAsset, heldQuantities, cashBalanceEur }: Props) {
  const isEdit = !!initial;
  const [asset, setAsset] = useState<SelectedAsset | null>(
    initial ? { symbol: initial.symbol, name: initial.assetName }
      : lockedAsset ? { symbol: lockedAsset.symbol, name: lockedAsset.name } : null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { register, handleSubmit, setError, clearErrors, setValue, getFieldState, control, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: initialValues(initial, lockedAsset?.currency),
  });

  const create = useCreateTransaction(portfolioId);
  const update = useUpdateTransaction(portfolioId);
  const remove = useDeleteTransaction(portfolioId);
  const deposit = useCreateCashMovement(portfolioId);
  const [addDeposit, setAddDeposit] = useState(true);
  const mutation = isEdit ? update : create;

  const [type, quantity, price, fees, currency, transactionDate] = useWatch({ control, name: ['type', 'quantity', 'pricePerUnit', 'fees', 'currency', 'transactionDate'] });
  const total = type === 'DIVIDEND' ? Number(price) || 0 : (Number(quantity) || 0) * (Number(price) || 0);
  const held = asset ? heldQuantities?.[asset.symbol] ?? 0 : 0;
  const oversell = !isEdit && type === 'SELL' && heldQuantities !== undefined && (Number(quantity) || 0) > held;
  const currencyOptions = [...new Set([...CURRENCIES, currency])].map(c => ({ value: c, label: c }));
  // Achat en euros non couvert par le solde : versement manquant (arrondi au centime)
  const shortfall = !isEdit && type === 'BUY' && currency === 'EUR' && cashBalanceEur !== undefined
    ? Math.max(0, Math.round((total + (Number(fees) || 0) - Math.max(cashBalanceEur, 0)) * 100) / 100)
    : 0;

  // Une erreur du serveur (vente refusée…) ne reste pas affichée une fois la saisie corrigée
  useEffect(() => { clearErrors('root.server'); }, [type, quantity, price, fees, currency, transactionDate, clearErrors]);

  // Nouvel actif coté : devise de cotation par défaut (AAPL en USD), tant que l'utilisateur n'y a pas touché
  const quoteSymbol = !isEdit && !lockedAsset?.currency && asset && !isManualSymbol(asset.symbol) ? asset.symbol : '';
  const quote = useMarketDetail(quoteSymbol);
  const appliedCurrencyFor = useRef<string | null>(null);
  useEffect(() => {
    const quoted = quote.data?.currency;
    if (!quoteSymbol || !quoted || appliedCurrencyFor.current === quoteSymbol) return;
    appliedCurrencyFor.current = quoteSymbol;
    if (!getFieldState('currency').isDirty) setValue('currency', quoted.toUpperCase());
  }, [quoteSymbol, quote.data, getFieldState, setValue]);

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
    if (isEdit) {
      update.mutate({ id: initial!.id, body: common }, { onSuccess, onError: applyServerErrors });
      return;
    }
    const withDeposit = addDeposit && shortfall > 0;
    create.mutate({ ...common, symbol: asset.symbol, currency: v.currency }, {
      onSuccess: () => {
        if (!withDeposit) return onSuccess();
        // Versement du même jour : le solde ne passe pas en négatif
        deposit.mutate({ type: 'DEPOSIT', amount: shortfall, movementDate: v.transactionDate.slice(0, 10),
          notes: `Versement pour l'achat de ${asset.name}` }, {
          onSuccess: () => { toast.success('Transaction et versement ajoutés'); onClose(); },
          onError: e => { toast.error(`Transaction ajoutée, mais pas le versement : ${e.message}`); onClose(); },
        });
      },
      onError: applyServerErrors,
    });
  };

  const onDelete = () => {
    if (!initial) return;
    remove.mutate(initial.id, {
      onSuccess: r => { toast.success('Transaction supprimée', undoAction(r)); onClose(); },
      onError: e => { setConfirmDelete(false); toast.error(e.message); },
    });
  };

  const title = isEdit ? 'Modifier la transaction' : asset ? asset.name : 'Choisir un actif';

  return (
    <BottomSheet open onClose={onClose} title={title}
      onBack={isEdit ? onClose : asset && !lockedAsset ? () => setAsset(null) : undefined}>
      {!asset ? (
        <div className="space-y-4">
          <AssetSearchCombobox onChange={r => setAsset({ symbol: r.symbol, name: r.name })} placeholder="Bitcoin, Apple, TotalEnergies..." />
          <p className="text-xs text-muted-foreground">Recherche parmi les actions, ETF, fonds et cryptos disponibles sur Yahoo Finance.</p>
          <ManualAssetPicker portfolioId={portfolioId} onSelect={a => {
            setAsset({ symbol: a.symbol, name: a.name });
            setValue('currency', a.currency);
          }} />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{isManualSymbol(asset.symbol) ? 'Non coté · valeur saisie' : asset.symbol}</span>
            {!isEdit && !lockedAsset && (
              <button type="button" onClick={() => setAsset(null)} className="text-primary">Changer d'actif</button>
            )}
          </div>

          <SegmentedControl<TransactionType> fullWidth value={type} onChange={v => setValue('type', v)}
            options={TRANSACTION_TYPES.map(t => ({ value: t, label: TRANSACTION_TYPE_LABEL[t] }))} />

          <div className="grid grid-cols-2 gap-3">
            {type !== 'DIVIDEND' && (
              <Input label="Quantité" type="number" inputMode="decimal" step="any" min="0" placeholder="0"
                {...register('quantity')}
                error={errors.quantity?.message ?? (oversell
                  ? `Tu ne détiens que ${formatQty(held)} ${isManualSymbol(asset.symbol) ? 'parts' : asset.symbol} : la vente sera refusée.`
                  : undefined)}
                hint={type === 'SELL' && heldQuantities !== undefined ? `Détenu : ${formatQty(held)}` : undefined} />
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

          <Input label="Date" type="datetime-local" max={endOfTodayInput()} {...register('transactionDate')} error={errors.transactionDate?.message} />
          <TransactionCheckHint portfolioId={portfolioId} symbol={asset.symbol} type={type} dateTime={transactionDate}
            price={String(price ?? '')} currency={currency} onUsePrice={p => setValue('pricePerUnit', String(p), { shouldValidate: true })} />
          <Input label="Notes (optionnel)" {...register('notes')} error={errors.notes?.message} />

          <div className="flex justify-between text-sm border-t border-border pt-3">
            <span className="text-muted-foreground">Total {type === 'BUY' ? 'à débourser' : 'perçu'}</span>
            <MoneyValue value={type === 'BUY' ? total + (Number(fees) || 0) : total - (Number(fees) || 0)} currency={currency} className="font-semibold" />
          </div>

          {shortfall > 0 && (
            <label className="flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-(--primary)" checked={addDeposit}
                onChange={e => setAddDeposit(e.target.checked)} />
              <span>
                Enregistrer aussi le versement de <strong>{formatEur(shortfall)}</strong> le même jour
                <span className="block text-muted-foreground">
                  Solde disponible : {formatEur(Math.max(cashBalanceEur ?? 0, 0))}. Sans versement, le solde deviendra négatif.
                </span>
              </span>
            </label>
          )}

          {mutation.isPending && (
            <p className="text-xs text-muted-foreground">Mise à jour de l'historique des cours… cela peut prendre quelques secondes pour une opération ancienne.</p>
          )}
          <FormError message={errors.root?.server?.message} />

          <div className="flex gap-2">
            {isEdit && (
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} aria-label="Supprimer"><Trash2 size={18} /></Button>
            )}
            {isEdit && <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>}
            <Button type="submit" className="flex-1" loading={mutation.isPending || deposit.isPending}>{isEdit ? 'Enregistrer' : 'Ajouter'}</Button>
          </div>
        </form>
      )}
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Supprimer cette transaction ?"
        description="La valorisation et l'historique du portefeuille seront recalculés." onConfirm={onDelete} loading={remove.isPending} />
    </BottomSheet>
  );
}
