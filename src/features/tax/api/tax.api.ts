import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { TaxReport } from '../model/tax.types';

/** Sous dashboardKeys.all : toute modification d'opération recalcule le récapitulatif. */
export const taxKeys = {
  all: [...dashboardKeys.all, 'tax'] as const,
  year: (year: number | null) => [...taxKeys.all, year ?? 'default'] as const,
};

/** @param year null = année par défaut (l'année écoulée) */
export const useTaxReport = (year: number | null) => useQuery({
  queryKey: taxKeys.year(year),
  queryFn: () => api.get<TaxReport>('/tax', { params: { year: year ?? undefined } }).then(r => r.data),
  placeholderData: prev => prev,
});
