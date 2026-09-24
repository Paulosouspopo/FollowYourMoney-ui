import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AuthLayout } from '@/features/auth/layout/AuthLayout';
import { useVerifyEmail } from '@/features/auth/api/auth.api';

/** Cible du lien envoyé par email : /verify-email?token=... */
export default function VerifyEmailPage() {
  const token = useSearchParams()[0].get('token') ?? '';
  const verify = useVerifyEmail();
  // Le lien est à usage unique : en StrictMode l'effet s'exécute deux fois en
  // dev, le second appel échouerait. On n'envoie donc qu'une fois.
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    verify.mutate(token);
  }, [token, verify]);

  const failed = !token || verify.isError;
  return (
    <AuthLayout title="Confirmation de l'email">
      <div className="space-y-5 text-center">
        {failed ? (
          <>
            <XCircle size={40} className="mx-auto text-loss" />
            <p className="text-sm text-muted-foreground">
              {verify.error?.message ?? 'Lien invalide.'} Connecte-toi pour recevoir un nouveau lien.
            </p>
          </>
        ) : verify.isSuccess ? (
          <>
            <CheckCircle2 size={40} className="mx-auto text-gain" />
            <p className="text-sm text-muted-foreground">Ton adresse est confirmée, tu peux te connecter.</p>
          </>
        ) : (
          <Loader2 size={32} className="mx-auto animate-spin text-muted-foreground" aria-label="Vérification en cours" />
        )}
        <Link to="/login" className="block text-sm text-primary">Aller à la connexion</Link>
      </div>
    </AuthLayout>
  );
}
