import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { PORTFOLIO_TYPE_LABEL, PORTFOLIO_TYPES, type PortfolioType } from '@/shared/model/enums';
import { forcesCashTracking, hasEuroFund } from '@/shared/model/portfolioRules';
import { Input } from '@/shared/ui/Input';
import { todayLocal } from '@/shared/lib/dates';
import { Switch } from '@/shared/ui/Switch';
import { z } from 'zod';
import type { PortfolioResponse } from '../model/portfolio.types';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePortfolio, useUpdatePortfolio } from '../api/portfolio.api';
import { FormSelect } from '@/shared/ui/form-select';
import { toast } from '@/shared/ui/toast.store';

const schema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(100, '100 caractères max'),
  type: z.enum(PORTFOLIO_TYPES),
  description: z.string().max(500, '500 caractères max').optional(),
  cashTracking: z.boolean(),
  multiCurrencyCash: z.boolean(),
  // Champ texte vide = pas de taux
  annualInterestRate: z.union([z.literal(''), z.coerce.number({ error: 'Taux invalide' }).min(0, 'Taux ≥ 0').max(100, 'Taux ≤ 100')]),
  openedAt: z.string().refine(d => !d || d <= todayLocal(), "La date d'ouverture ne peut pas être dans le futur"),
});
type FormInput = z.input<typeof schema>;

/** Une phrase par type : aide au choix. */
const TYPE_HINT: Record<PortfolioType, string> = {
  PEA: 'Actions européennes, gains exonérés d\'impôt après 5 ans.',
  CTO: 'Compte-titres ordinaire : actions du monde entier, ETF…',
  ASSURANCE_VIE: 'Fonds euros + unités de compte. Fiscalité douce après 8 ans.',
  PER: 'Épargne retraite : versements déductibles de tes revenus, bloqués jusqu\'à la retraite.',
  EPARGNE_SALARIALE: 'PEE, PERCO, PERECO : versements, intéressement et abondement de l\'employeur.',
  CRYPTO: 'Plateforme ou wallet crypto.',
  LIVRET: 'Livret A, LDDS, LEP… : un solde et un taux, pas de cours.',
  IMMOBILIER: 'Bientôt : valeur saisie à la main.',
  AUTRE: 'Tout le reste.',
};
type FormOutput = z.output<typeof schema>;

interface Props { open: boolean; onClose: () => void; initial?: PortfolioResponse; }

/** Monté uniquement quand la feuille est ouverte : chaque ouverture repart d'un état neuf. */
export function PortfolioFormSheet(props: Props) {
  if (!props.open) return null;
  return <PortfolioForm {...props} />;
}

function PortfolioForm({ onClose, initial }: Props) {
  const isEdit = !!initial;
  const { register, handleSubmit, setError, control, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name, type: initial.type, description: initial.description ?? '',
          cashTracking: initial.cashTracking, multiCurrencyCash: initial.multiCurrencyCash,
          annualInterestRate: initial.annualInterestRate ?? '', openedAt: initial.openedAt ?? '',
        }
      : { name: '', type: 'PEA', description: '', cashTracking: false, multiCurrencyCash: false, annualInterestRate: '', openedAt: '' },
  });
  const create = useCreatePortfolio();
  const update = useUpdatePortfolio(initial?.id ?? '');
  const mutation = isEdit ? update : create;
  const type = useWatch({ control, name: 'type' });
  const cashTracking = useWatch({ control, name: 'cashTracking' });
  const isLivret = type === 'LIVRET';
  const forced = forcesCashTracking(type);
  const withRate = isLivret || hasEuroFund(type);

  const onSubmit: SubmitHandler<FormOutput> = (v) => mutation.mutate({
    name: v.name,
    type: v.type,
    description: v.description || undefined,
    // Livret et enveloppes suivent toujours leurs liquidités (le back l'impose aussi)
    cashTracking: forced || v.cashTracking,
    multiCurrencyCash: !forced && v.cashTracking && v.multiCurrencyCash,
    annualInterestRate: withRate && v.annualInterestRate !== '' ? v.annualInterestRate : null,
    openedAt: v.openedAt || null,
  }, {
    onSuccess: () => { toast.success(isEdit ? 'Portefeuille modifié' : 'Portefeuille créé'); onClose(); },
    onError: (e) => e.fieldErrors?.forEach(f => setError(f.field as keyof FormInput, { message: f.message })),
  });

  return (
    <BottomSheet open onClose={onClose} title={isEdit ? 'Modifier le portefeuille' : 'Nouveau portefeuille'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Nom" placeholder={isLivret ? 'Livret A' : 'PEA Boursorama'} {...register('name')} error={errors.name?.message} />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Type"
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
              hint={TYPE_HINT[field.value]}
              options={PORTFOLIO_TYPES.filter(t => t !== 'IMMOBILIER' || field.value === 'IMMOBILIER')
                .map(t => ({ value: t, label: PORTFOLIO_TYPE_LABEL[t] }))}
            />
          )}
        />

        {withRate && (
          <Input label={isLivret ? 'Taux annuel (%, optionnel)' : 'Taux du fonds euros (%, optionnel)'} type="number"
            inputMode="decimal" step="any" min="0" placeholder={isLivret ? '1,7' : '2,5'}
            hint={isLivret
              ? "Sert à estimer les intérêts de l'année (règle des quinzaines) : tu les valides en un geste."
              : "Sert à estimer les intérêts de l'année ; corrige avec le taux réel publié par l'assureur."}
            {...register('annualInterestRate')} error={errors.annualInterestRate?.message} />
        )}
        {!forced && (
          <Controller name="cashTracking" control={control} render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Suivre les liquidités"
              description="Versements, retraits et solde espèces du compte, inclus dans sa valeur." />
          )} />
        )}
        {!forced && cashTracking && (
          <Controller name="multiCurrencyCash" control={control} render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Compte multidevise"
              description="Les opérations en dollars (ou autre) sont réglées dans cette devise : solde USD, GBP… et changes." />
          )} />
        )}

        <Input label="Date d'ouverture (optionnel)" type="date" max={todayLocal()} {...register('openedAt')}
          error={errors.openedAt?.message}
          hint={type === 'PEA' ? "Point de départ des 5 ans du PEA (fiscalité). À défaut : ta première opération."
            : type === 'ASSURANCE_VIE' ? 'Point de départ des 8 ans du contrat (fiscalité). À défaut : ta première opération.'
              : undefined} />

        <Input label="Description (optionnel)" {...register('description')} error={errors.description?.message} />
        {mutation.isError && !mutation.error.fieldErrors && <FormError message={mutation.error.message} />}
        <Button type="submit" className="w-full" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
      </form>
    </BottomSheet>
  );
}
