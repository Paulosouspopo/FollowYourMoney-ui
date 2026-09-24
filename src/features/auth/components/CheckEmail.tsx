import { MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResendVerification } from './ResendVerification';

/** Après l'inscription : le compte s'active via le lien reçu par email. */
export function CheckEmail({ email }: { email: string }) {
  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center"><MailCheck size={24} /></div>
      <p className="text-sm text-muted-foreground">
        Un lien de confirmation a été envoyé à <span className="text-foreground font-medium">{email}</span>.
        Clique dessus pour activer ton compte, puis connecte-toi.
      </p>
      <ResendVerification email={email} />
      <Link to="/login" className="block text-sm text-primary">Aller à la connexion</Link>
    </div>
  );
}
