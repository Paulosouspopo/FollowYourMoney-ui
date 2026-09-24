import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { AuthLayout } from '@/features/auth/layout/AuthLayout';
import { useForgotPassword } from '@/features/auth/api/auth.api';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';

const schema = z.object({ email: z.string().email('Email invalide') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const forgot = useForgotPassword();

  return (
    <AuthLayout title="Mot de passe oublié" subtitle="On t'envoie un lien pour en choisir un nouveau">
      {forgot.isSuccess ? (
        <div className="space-y-5 text-center">
          <MailCheck size={40} className="mx-auto text-primary" />
          {/* Même message que le compte existe ou non : le back ne le révèle pas */}
          <p className="text-sm text-muted-foreground">
            Si un compte existe pour <span className="text-foreground font-medium">{getValues('email')}</span>,
            un email avec un lien de réinitialisation vient d'être envoyé. Il est valable 1 heure.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(v => forgot.mutate(v.email))} className="space-y-4" noValidate>
          <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
          {forgot.isError && <FormError message={forgot.error.message} />}
          <Button type="submit" className="w-full" loading={forgot.isPending}>Envoyer le lien</Button>
        </form>
      )}
      <p className="text-center text-sm text-muted-foreground mt-6"><Link to="/login" className="text-primary">Retour à la connexion</Link></p>
    </AuthLayout>
  );
}
