import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { PORTFOLIO_TYPE_LABEL, PORTFOLIO_TYPES } from '@/shared/model/enums';
import { Input } from '@/shared/ui/Input';
import z from 'zod';
import type { PortfolioResponse } from '../model/portfolio.types';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePortfolio, useUpdatePortfolio } from '../api/portfolio.api';
import { FormSelect } from '@/shared/ui/form-select';

const schema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(100),
  type: z.enum(PORTFOLIO_TYPES),
  description: z.string().max(255).optional(),
});
type Form = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; initial?: PortfolioResponse; }

export function PortfolioFormSheet({ open, onClose, initial }: Props) {
  const isEdit = !!initial;
  const { register, handleSubmit, setError, control, formState: { errors }, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initial ? { name: initial.name, type: initial.type, description: initial.description ?? '' } : { type: 'PEA' },
  });
  const create = useCreatePortfolio();
  const update = useUpdatePortfolio(initial?.id ?? '');
  const mutation = isEdit ? update : create;

  const onSubmit = (v: Form) => mutation.mutate(v, {
    onSuccess: () => { reset(); onClose(); },
    onError: (e) => e.fieldErrors?.forEach(f => setError(f.field as keyof Form, { message: f.message })),
  });

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Modifier le portefeuille' : 'Nouveau portefeuille'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nom" placeholder="PEA Boursorama" {...register('name')} error={errors.name?.message} />

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

        <Input label="Description (optionnel)" {...register('description')} error={errors.description?.message} />
        {mutation.isError && !mutation.error.fieldErrors && <FormError message={mutation.error.message} />}
        <Button type="submit" className="w-full" loading={mutation.isPending}>{isEdit ? 'Enregistrer' : 'Créer'}</Button>
      </form>
    </BottomSheet>
  );
}