import { isApiError } from './types';

/** Les erreurs HTTP sont déjà normalisées en ApiError par l'intercepteur de `client.ts`. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message || `Erreur ${error.status}`;
  return error instanceof Error ? error.message : 'Erreur inconnue';
}
