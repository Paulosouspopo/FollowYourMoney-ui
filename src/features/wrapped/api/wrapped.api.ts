import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { Wrapped } from '../model/wrapped.types';

/** Sous dashboardKeys.all : une opération ancienne change le bilan. */
export const wrappedKeys = {
  all: [...dashboardKeys.all, 'wrapped'] as const,
  year: (year: number | null) => [...wrappedKeys.all, year ?? 'default'] as const,
};

/** Premier calcul : l'indice de comparaison peut être téléchargé. */
const WRAPPED_TIMEOUT = 60_000;

/** @param year null = année par défaut (écoulée, ou en cours à partir de décembre) */
export const useWrapped = (year: number | null) => useQuery({
  queryKey: wrappedKeys.year(year),
  queryFn: () => api.get<Wrapped>('/wrapped', { params: { year: year ?? undefined }, timeout: WRAPPED_TIMEOUT }).then(r => r.data),
  placeholderData: prev => prev,
  retry: false,
});
