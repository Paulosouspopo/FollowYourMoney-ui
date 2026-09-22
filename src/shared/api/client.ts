import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/shared/auth/auth.store';
import type { ApiError } from './types';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', timeout: 15_000 });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalise TOUTES les erreurs en ApiError → les hooks n'ont qu'un seul type d'erreur à gérer. */
api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) useAuthStore.getState().logout(); // RequireAuth redirige
    const normalized: ApiError = error.response?.data ?? {
      timestamp: new Date().toISOString(),
      status: error.response?.status ?? 0,
      message: error.code === 'ECONNABORTED' ? 'Le serveur ne répond pas' : 'Erreur réseau',
    };
    return Promise.reject(normalized);
  },
);