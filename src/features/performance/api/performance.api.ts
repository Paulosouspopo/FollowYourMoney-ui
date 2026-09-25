import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { PerformancePeriod, PerformanceResponse } from '../model/performance.types';

/** Sous dashboardKeys.all : toute mutation qui invalide le dashboard rafraîchit aussi la performance. */
export const performanceKeys = {
  all: [...dashboardKeys.all, 'performance'] as const,
  global: (period: PerformancePeriod, benchmark: string | null) =>
    [...performanceKeys.all, 'global', period, benchmark] as const,
  portfolio: (id: string, period: PerformancePeriod, benchmark: string | null) =>
    [...performanceKeys.all, 'portfolio', id, period, benchmark] as const,
};

/** Premier affichage d'un indice : le back télécharge son historique. */
const PERFORMANCE_TIMEOUT = 60_000;

/** @param portfolioId null = tout le patrimoine */
export const usePerformance = (portfolioId: string | null, period: PerformancePeriod, benchmark: string | null) =>
  useQuery({
    queryKey: portfolioId
      ? performanceKeys.portfolio(portfolioId, period, benchmark)
      : performanceKeys.global(period, benchmark),
    queryFn: () => api.get<PerformanceResponse>(
      portfolioId ? `/performance/portfolios/${portfolioId}` : '/performance',
      { params: { period, benchmark: benchmark ?? undefined }, timeout: PERFORMANCE_TIMEOUT },
    ).then(r => r.data),
    placeholderData: prev => prev,
  });
