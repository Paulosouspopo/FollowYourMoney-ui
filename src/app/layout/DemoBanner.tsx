import { useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useMe } from '@/features/settings/api/user.api';
import { useLogout } from '@/features/auth/api/auth.api';

/** Compte invité : rappel que les données sont fictives, et invitation à créer un vrai compte. */
export function DemoBanner() {
  const me = useMe().data;
  const logout = useLogout();
  const navigate = useNavigate();
  if (!me?.demo) return null;
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-10 mb-2 flex items-center gap-2 bg-primary/12 px-4 md:px-6 lg:px-10 py-2 text-xs">
      <FlaskConical size={14} className="shrink-0 text-primary" />
      <p className="flex-1">
        <span className="font-semibold">Mode démo</span> · données fictives, effacées sous 24 h. Modifie tout ce que tu veux !
      </p>
      <button type="button" onClick={() => logout().then(() => navigate('/register'))}
        className="shrink-0 rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">
        Créer mon compte
      </button>
    </div>
  );
}
