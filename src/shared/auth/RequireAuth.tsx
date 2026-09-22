import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from './auth.store';

export function RequireAuth() {
  const token = useAuthStore(s => s.token);
  const loc = useLocation();
  return token ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc }} />;
}