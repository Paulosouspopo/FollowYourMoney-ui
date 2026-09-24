import { api } from '@/shared/api/client';
import { useAuthStore } from './auth.store';

export interface AuthResponse { accessToken: string; expiresIn: number; }

/**
 * Deux onglets peuvent renouveler en même temps avec le même cookie : le
 * second reçoit 401 juste après la rotation faite par le premier. Le cookie
 * du navigateur contient alors déjà le nouveau jeton : un second essai
 * différé suffit.
 */
const RETRY_DELAY_MS = 400;

let inFlight: Promise<boolean> | null = null;

const callRefresh = () =>
  api.post<AuthResponse>('/auth/refresh', undefined, { skipAuthRefresh: true }).then(r => r.data);

/**
 * Obtient un nouveau jeton d'accès via le cookie de renouvellement.
 * Un seul appel à la fois : les requêtes qui reçoivent 401 en même temps
 * attendent toutes le même renouvellement.
 *
 * @returns true si la session est (re)ouverte, false sinon (session vidée)
 */
export function refreshSession(): Promise<boolean> {
  inFlight ??= (async () => {
    try {
      let data: AuthResponse;
      try {
        data = await callRefresh();
      } catch {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        data = await callRefresh();
      }
      useAuthStore.getState().setSession(data.accessToken);
      return true;
    } catch {
      useAuthStore.getState().clearSession();
      return false;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
