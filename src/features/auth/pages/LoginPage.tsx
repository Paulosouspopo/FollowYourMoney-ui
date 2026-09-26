import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { useDemo, useLogin, useVerifyTwoFactor } from '@/features/auth/api/auth.api';
import { useState } from 'react';
import { AuthLayout } from '@/features/auth/layout/AuthLayout';
import { ResendVerification } from '@/features/auth/components/ResendVerification';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import type { ApiError } from '@/shared/api/types';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type Form = z.infer<typeof schema>;

const loginErrorMessage = (e: ApiError) => e.status === 401 ? 'Email ou mot de passe incorrect' : e.message;

export default function LoginPage() {
  const { register, handleSubmit, control, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const email = useWatch({ control, name: 'email' }) ?? '';
  const from = (useLocation().state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
  const login = useLogin(from);
  const demo = useDemo();
  const notVerified = login.error?.code === 'EMAIL_NOT_VERIFIED';
  const challenge = login.data?.twoFactorToken;
  if (challenge) return <TwoFactorStep token={challenge} redirectTo={from} onBack={() => login.reset()} />;

  return (
    <AuthLayout title="Bon retour 👋" subtitle="Connecte-toi pour suivre ton patrimoine">
      <form onSubmit={handleSubmit(v => login.mutate(v))} className="space-y-4" noValidate>
        <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
        <Input label="Mot de passe" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-xs text-primary">Mot de passe oublié ?</Link>
        </div>
        {login.isError && <FormError message={loginErrorMessage(login.error)} />}
        <Button type="submit" className="w-full" loading={login.isPending}>Se connecter</Button>
      </form>
      {notVerified && <div className="mt-3"><ResendVerification email={email} /></div>}
      <p className="text-center text-sm text-muted-foreground mt-6">Pas de compte ? <Link to="/register" className="text-primary">Créer un compte</Link></p>
      <div className="mt-6 border-t border-border pt-6 text-center">
        <Button type="button" variant="outline" className="w-full" loading={demo.isPending} onClick={() => demo.mutate()}>
          Essayer sans compte
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          {demo.isPending
            ? 'Préparation d\'un portefeuille de démonstration aux vrais cours… quelques secondes.'
            : 'Un patrimoine fictif sur trois ans, à explorer librement. Effacé après 24 h.'}
        </p>
        {demo.isError && <FormError message={demo.error.message} />}
      </div>
    </AuthLayout>
  );
}

/** Deuxième étape : code de l'application d'authentification, ou code de secours. */
function TwoFactorStep({ token, redirectTo, onBack }: { token: string; redirectTo: string; onBack: () => void }) {
  const verify = useVerifyTwoFactor(redirectTo);
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState(false);
  return (
    <AuthLayout title="Vérification 🔐" subtitle={recovery ? 'Saisis un de tes codes de secours' : 'Saisis le code à 6 chiffres de ton application'}>
      <form className="space-y-4" noValidate onSubmit={e => { e.preventDefault(); verify.mutate({ token, code: code.trim() }); }}>
        <Input label={recovery ? 'Code de secours' : 'Code'} autoFocus autoComplete="one-time-code"
          inputMode={recovery ? 'text' : 'numeric'} placeholder={recovery ? 'abcde-fghij' : '123 456'}
          value={code} onChange={e => setCode(e.target.value)} />
        {verify.isError && <FormError message={verify.error.message} />}
        <Button type="submit" className="w-full" loading={verify.isPending} disabled={!code.trim()}>Valider</Button>
      </form>
      <div className="mt-4 flex justify-between text-xs">
        <button type="button" onClick={onBack} className="text-muted-foreground">Retour</button>
        <button type="button" onClick={() => { setRecovery(r => !r); setCode(''); }} className="text-primary">
          {recovery ? 'Utiliser le code de l\u2019application' : 'Téléphone perdu ? Code de secours'}
        </button>
      </div>
    </AuthLayout>
  );
}
