import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toast.store';
import { useResendVerification } from '../api/auth.api';

/** Renvoi du lien de confirmation (réponse identique que le compte existe ou non). */
export function ResendVerification({ email }: { email: string }) {
  const resend = useResendVerification();
  return (
    <Button type="button" variant="outline" className="w-full" loading={resend.isPending} disabled={!email}
      onClick={() => resend.mutate(email, {
        onSuccess: () => toast.success('Email de confirmation renvoyé'),
        onError: e => toast.error(e.message),
      })}>
      Renvoyer l'email de confirmation
    </Button>
  );
}
