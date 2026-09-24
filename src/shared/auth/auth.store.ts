import { create } from 'zustand';

/**
 * Session côté front.
 *
 * Le jeton d'accès (JWT de 15 min) vit UNIQUEMENT en mémoire : jamais dans le
 * localStorage, où une faille XSS pourrait le lire. Au rechargement de la page
 * il est perdu, et on en redemande un avec le cookie HttpOnly de
 * renouvellement (voir session.ts).
 *
 * status : 'loading' tant qu'on ne sait pas encore (appel /auth/refresh au
 * démarrage), puis 'authenticated' ou 'anonymous'.
 */
type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  accessToken: string | null;
  status: AuthStatus;
  setSession: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  status: 'loading',
  setSession: (accessToken) => set({ accessToken, status: 'authenticated' }),
  clearSession: () => set({ accessToken: null, status: 'anonymous' }),
}));

// Ancienne version : le jeton était persisté ici. On le supprime.
try { localStorage.removeItem('fym-auth'); } catch { /* stockage indisponible */ }
