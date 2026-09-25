import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { IncomeResponse } from '../model/income.types';

/** Sous dashboardKeys.all : une opération saisie (dividende, achat) rafraîchit les revenus. */
export const incomeKeys = {
  all: [...dashboardKeys.all, 'income'] as const,
};

/** Premier affichage : le back récupère les dividendes de chaque ligne (puis cache 12 h). */
export const useIncome = () => useQuery({
  queryKey: incomeKeys.all,
  queryFn: () => api.get<IncomeResponse>('/income', { timeout: 60_000 }).then(r => r.data),
  staleTime: 10 * 60_000,
});
