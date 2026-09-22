import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useLogin } from '@/features/auth/api/auth.api';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const login = useLogin();

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Bon retour 👋</h1>
      <p className="text-muted-foreground text-sm mb-8">Connecte-toi pour suivre ton patrimoine.</p>
      <form onSubmit={handleSubmit(v => login.mutate(v))} className="space-y-4">
        <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <Input label="Mot de passe" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
        {login.isError && <FormError message={login.error.status === 401 ? 'Identifiants incorrects' : login.error.message} />}
        <Button type="submit" className="w-full" loading={login.isPending}>Se connecter</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-6">Pas de compte ? <Link to="/register" className="text-primary">Créer un compte</Link></p>
    </div>
  );
}