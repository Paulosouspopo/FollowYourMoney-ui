import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

/** Tranche marginale d'imposition (avantage fiscal du PER). */
export const useSetMarginalTaxRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (marginalTaxRate: number) => api.put<TaxReport>('/tax/settings', { marginalTaxRate }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taxKeys.all }),
  });
};
