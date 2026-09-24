import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './auth.store';
import { refreshSession } from './session';

/** Au premier rendu, restaure la session depuis le cookie de renouvellement. */
function useRestoreSession() {
  const status = useAuthStore(s => s.status);
  useEffect(() => {
    if (status === 'loading') void refreshSession();
  }, [status]);
  return status;
}

function Splash() {
  return (
    <div className="min-h-dvh grid place-items-center bg-background" aria-busy="true">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Chargement" />
    </div>
  );
}

/** Pages de l'app : connexion requise. */
export function RequireAuth() {
  const status = useRestoreSession();
  const loc = useLocation();
  if (status === 'loading') return <Splash />;
  return status === 'authenticated' ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc }} />;
}

/** Connexion / inscription : inutiles si déjà connecté. */
export function GuestOnly() {
  const status = useRestoreSession();
  const loc = useLocation();
  if (status === 'loading') return <Splash />;
  const from = (loc.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';
  return status === 'authenticated' ? <Navigate to={from} replace /> : <Outlet />;
}
