import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { DashboardResponse, DashboardPeriod } from '@/features/dashboard/model/dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  global: (p: DashboardPeriod) => [...dashboardKeys.all, 'global', p] as const,
  portfolio: (id: string, p: DashboardPeriod) => [...dashboardKeys.all, 'portfolio', id, p] as const,
};

export const useDashboard = (period: DashboardPeriod) =>
  useQuery({
    queryKey: dashboardKeys.global(period),
    queryFn: () => api.get<DashboardResponse>('/dashboard', { params: { period } }).then(r => r.data),
    placeholderData: prev => prev,
  });

export const usePortfolioDashboard = (portfolioId: string, period: DashboardPeriod) =>
  useQuery({
    queryKey: dashboardKeys.portfolio(portfolioId, period),
    queryFn: () => api.get<DashboardResponse>(`/dashboard/portfolios/${portfolioId}`, { params: { period } }).then(r => r.data),
    placeholderData: prev => prev,
    enabled: !!portfolioId,
  });