import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MonitorSmartphone } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Input } from '@/shared/ui/Input';
import { FormError } from '@/shared/ui/FormError';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/toast.store';
import { useChangePassword, useLogoutEverywhere } from '@/features/auth/api/auth.api';
import { newPasswordFields, passwordsMatch, PASSWORDS_DIFFER } from '@/features/auth/model/password';

const schema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  ...newPasswordFields,
}).refine(passwordsMatch, PASSWORDS_DIFFER);
type Form = z.infer<typeof schema>;

function ChangePasswordForm() {
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const change = useChangePassword();

  const onSubmit = (v: Form) => change.mutate({ currentPassword: v.currentPassword, newPassword: v.password }, {
    onSuccess: () => { reset(); toast.success('Mot de passe modifié. Tes autres appareils ont été déconnectés.'); },
    onError: e => e.fieldErrors?.forEach(f =>
      setError(f.field === 'newPassword' ? 'password' : f.field as keyof Form, { message: f.message })),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <Input label="Mot de passe actuel" type="password" autoComplete="current-password" {...register('currentPassword')} error={errors.currentPassword?.message} />
      <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
      <Input label="Confirmation" type="password" autoComplete="new-password" {...register('confirm')} error={errors.confirm?.message} />
      {change.isError && !change.error.fieldErrors && <FormError message={change.error.message} />}
      <Button type="submit" variant="outline" className="w-full" loading={change.isPending}>Changer le mot de passe</Button>
    </form>
  );
}

export function SecuritySection() {
  const logoutEverywhere = useLogoutEverywhere();
  const [confirm, setConfirm] = useState(false);

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">Sécurité</h2>
      <Card className="p-4 space-y-4">
        <ChangePasswordForm />
        <div className="border-t border-border pt-4">
          <Button variant="ghost" className="w-full" onClick={() => setConfirm(true)}>
            <MonitorSmartphone size={16} /> Se déconnecter de tous les appareils
          </Button>
        </div>
      </Card>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title="Se déconnecter partout ?"
        description="Toutes tes sessions, y compris celle-ci, seront fermées." confirmLabel="Tout déconnecter"
        loading={logoutEverywhere.isPending}
        onConfirm={() => logoutEverywhere.mutate(undefined, { onError: e => toast.error(e.message) })} />
    </section>
  );
}
