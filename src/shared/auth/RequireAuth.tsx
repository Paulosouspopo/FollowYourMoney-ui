import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '@/app/layout/Logo';
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

/** Même rendu que l'écran de démarrage d'index.html : aucune transition visible. */
export function Splash() {
  return (
    <div className="min-h-dvh grid place-items-center bg-background" aria-busy="true" aria-label="Chargement">
      <Logo className="h-14 w-14 animate-pulse" />
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
