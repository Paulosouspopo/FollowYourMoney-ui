import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/features/auth/layout/AuthLayout';
import { useResetPassword } from '@/features/auth/api/auth.api';
import { newPasswordFields, passwordsMatch, PASSWORDS_DIFFER } from '@/features/auth/model/password';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { toast } from '@/shared/ui/toast.store';

const schema = z.object(newPasswordFields).refine(passwordsMatch, PASSWORDS_DIFFER);
type Form = z.infer<typeof schema>;

/** Cible du lien envoyé par email : /reset-password?token=... */
export default function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token') ?? '';
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const reset = useResetPassword();
  const nav = useNavigate();

  const onSubmit = (v: Form) => reset.mutate({ token, newPassword: v.password }, {
    onSuccess: () => { toast.success('Mot de passe modifié, tu peux te connecter'); nav('/login', { replace: true }); },
    onError: e => e.fieldErrors?.forEach(f => f.field === 'newPassword' && setError('password', { message: f.message })),
  });

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Tous tes appareils seront déconnectés">
      {!token ? (
        <FormError message="Lien invalide : refais une demande de réinitialisation." />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
          <Input label="Confirmation" type="password" autoComplete="new-password" {...register('confirm')} error={errors.confirm?.message} />
          {reset.isError && !reset.error.fieldErrors && <FormError message={reset.error.message} />}
          <Button type="submit" className="w-full" loading={reset.isPending}>Enregistrer</Button>
        </form>
      )}
      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link to="/forgot-password" className="text-primary">Demander un nouveau lien</Link>
      </p>
    </AuthLayout>
  );
}
