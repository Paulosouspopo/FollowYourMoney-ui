import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/shared/auth/auth.store';
import { refreshSession } from '@/shared/auth/session';
import type { ApiError } from './types';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Ne pas tenter de renouveler la session sur 401 (endpoints /auth, requête déjà rejouée). */
    skipAuthRefresh?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15_000,
  // Envoie le cookie HttpOnly de renouvellement aux endpoints /auth
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const normalize = (error: AxiosError<ApiError>): ApiError => error.response?.data ?? {
  timestamp: new Date().toISOString(),
  status: error.response?.status ?? 0,
  message: error.code === 'ECONNABORTED' ? 'Le serveur ne répond pas' : 'Erreur réseau',
};

/**
 * 401 = jeton d'accès expiré (15 min) : on renouvelle la session une fois
 * puis on rejoue la requête, sans que l'utilisateur ne voie rien. Si le
 * renouvellement échoue, la session est vidée et RequireAuth redirige vers
 * la connexion.
 *
 * Toutes les erreurs sont ensuite normalisées en ApiError : les hooks n'ont
 * qu'un seul type d'erreur à gérer.
 */
api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError<ApiError>) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    if (error.response?.status === 401 && config && !config.skipAuthRefresh) {
      if (await refreshSession()) {
        return api.request({ ...config, skipAuthRefresh: true });
      }
    }
    return Promise.reject(normalize(error));
  },
);
