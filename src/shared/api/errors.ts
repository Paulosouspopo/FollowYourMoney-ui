import axios from 'axios';
import type { ApiError } from './types';

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? (error.response ? `Erreur ${error.response.status}` : 'Serveur injoignable');
  }
  return error instanceof Error ? error.message : 'Erreur inconnue';
}