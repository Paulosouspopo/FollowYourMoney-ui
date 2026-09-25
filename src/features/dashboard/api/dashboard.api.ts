import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { useEffectiveDisplayCurrency } from '@/shared/currency/displayRates.api';
import type { DashboardResponse, DashboardPeriod } from '@/features/dashboard/model/dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  global: (p: DashboardPeriod, currency = 'EUR') => [...dashboardKeys.all, 'global', p, currency] as const,
  portfolioAll: (id: string) => [...dashboardKeys.all, 'portfolio', id] as const,
  portfolio: (id: string, p: DashboardPeriod, currency = 'EUR') => [...dashboardKeys.portfolioAll(id), p, currency] as const,
};

/** La courbe arrive convertie par le back (taux historique de chaque jour) : `curveCurrency`. */
export const useDashboard = (period: DashboardPeriod) => {
  const { currency } = useEffectiveDisplayCurrency();
  return useQuery({
    queryKey: dashboardKeys.global(period, currency),
    queryFn: () => api.get<DashboardResponse>('/dashboard', { params: { period, currency } }).then(r => r.data),
    placeholderData: prev => prev,
  });
};

export const usePortfolioDashboard = (portfolioId: string, period: DashboardPeriod) => {
  const { currency } = useEffectiveDisplayCurrency();
  return useQuery({
    queryKey: dashboardKeys.portfolio(portfolioId, period, currency),
    queryFn: () => api.get<DashboardResponse>(`/dashboard/portfolios/${portfolioId}`, { params: { period, currency } })
      .then(r => r.data),
    placeholderData: prev => prev,
    enabled: !!portfolioId,
  });
};
/** Survol / appui d'un lien de portefeuille : ses données arrivent avant le clic. */
export const usePrefetchPortfolio = () => {
  const qc = useQueryClient();
  const { currency } = useEffectiveDisplayCurrency();
  return (portfolioId: string, period: DashboardPeriod = '30d') => qc.prefetchQuery({
    queryKey: dashboardKeys.portfolio(portfolioId, period, currency),
    queryFn: () => api.get<DashboardResponse>(`/dashboard/portfolios/${portfolioId}`, { params: { period, currency } })
      .then(r => r.data),
    staleTime: 30_000,
  });
};
