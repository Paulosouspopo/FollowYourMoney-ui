import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { PORTFOLIO_TYPE_LABEL, PORTFOLIO_TYPES } from '@/shared/model/enums';
import { Input } from '@/shared/ui/Input';
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
  // Champ texte vide = pas de taux
  annualInterestRate: z.union([z.literal(''), z.coerce.number({ error: 'Taux invalide' }).min(0, 'Taux ≥ 0').max(100, 'Taux ≤ 100')]),
});
type FormInput = z.input<typeof schema>;
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
          cashTracking: initial.cashTracking, annualInterestRate: initial.annualInterestRate ?? '',
        }
      : { name: '', type: 'PEA', description: '', cashTracking: false, annualInterestRate: '' },
  });
  const create = useCreatePortfolio();
  const update = useUpdatePortfolio(initial?.id ?? '');
  const mutation = isEdit ? update : create;
  const isLivret = useWatch({ control, name: 'type' }) === 'LIVRET';

  const onSubmit: SubmitHandler<FormOutput> = (v) => mutation.mutate({
    name: v.name,
    type: v.type,
    description: v.description || undefined,
    // Un livret suit toujours ses liquidités (le back l'impose aussi)
    cashTracking: isLivret || v.cashTracking,
    annualInterestRate: isLivret && v.annualInterestRate !== '' ? v.annualInterestRate : null,
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
              options={PORTFOLIO_TYPES.map(t => ({ value: t, label: PORTFOLIO_TYPE_LABEL[t] }))}
            />
          )}
        />

        {isLivret ? (
          <Input label="Taux annuel (%, optionnel)" type="number" inputMode="decimal" step="any" min="0" placeholder="1,7"
            hint="Affiché à titre indicatif : saisis les intérêts réellement versés comme mouvements."
            {...register('annualInterestRate')} error={errors.annualInterestRate?.message} />
        ) : (
          <Controller name="cashTracking" control={control} render={({ field }) => (
            <Switch checked={field.value} onChange={field.onChange} label="Suivre les liquidités"
              description="Versements, retraits et solde espèces du compte, inclus dans sa valeur." />
          )} />
        )}

        <Input label="Description (optionnel)" {...register('description')} error={errors.description?.message} />
        {mutation.isError && !mutation.error.fieldErrors && <FormError message={mutation.error.message} />}
        <Button type="submit" className="w-full" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
      </form>
    </BottomSheet>
  );
}
