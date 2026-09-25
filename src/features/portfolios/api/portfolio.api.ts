import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { transactionKeys } from '@/features/transactions/api/transaction.api';
import { cashKeys } from '@/features/cash/api/cash.api';
import { planKeys } from '@/features/plans/api/plan.api';
import type { PortfolioResponse, PortfolioDetailResponse, PortfolioCreateRequest, PortfolioUpdateRequest } from '@/features/portfolios/model/portfolio.types';

export const portfolioKeys = {
  all: ['portfolios'] as const,
  detail: (id: string) => [...portfolioKeys.all, id] as const,
};

export const usePortfolios = () => useQuery({
  queryKey: portfolioKeys.all, queryFn: () => api.get<PortfolioResponse[]>('/portfolios').then(r => r.data),
});
export const usePortfolio = (id: string) => useQuery({
  queryKey: portfolioKeys.detail(id), queryFn: () => api.get<PortfolioDetailResponse>(`/portfolios/${id}`).then(r => r.data), enabled: !!id,
});

/** @param excludedId portefeuille supprimé : ses requêtes ne doivent pas être refetchées (404). */
const useInvalidatePortfolios = () => {
  const qc = useQueryClient();
  return (excludedId?: string) => {
    const predicate = (q: { queryKey: readonly unknown[] }) => !excludedId || !q.queryKey.includes(excludedId);
    return Promise.all([
      qc.invalidateQueries({ queryKey: portfolioKeys.all, predicate }),
      qc.invalidateQueries({ queryKey: dashboardKeys.all, predicate }),
    ]);
  };
};

export const useCreatePortfolio = () => {
  const inv = useInvalidatePortfolios();
  return useMutation({
    mutationFn: (b: PortfolioCreateRequest) => api.post<PortfolioResponse>('/portfolios', b).then(r => r.data),
    onSuccess: () => inv(),
  });
};
export const useUpdatePortfolio = (id: string) => {
  const inv = useInvalidatePortfolios();
  return useMutation({
    mutationFn: (b: PortfolioUpdateRequest) => api.put<PortfolioResponse>(`/portfolios/${id}`, b).then(r => r.data),
    onSuccess: () => inv(),
  });
};
export const useDeletePortfolio = () => {
  const qc = useQueryClient();
  const inv = useInvalidatePortfolios();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/portfolios/${id}`),
    onSuccess: async (_, id) => {
      // Les requêtes du portefeuille supprimé sont retirées du cache, pas
      // invalidées : un refetch renverrait 404 sur la page encore affichée.
      await inv(id);
      qc.removeQueries({ queryKey: portfolioKeys.detail(id) });
      qc.removeQueries({ queryKey: dashboardKeys.portfolioAll(id) });
      qc.removeQueries({ queryKey: transactionKeys.byPortfolio(id) });
      qc.removeQueries({ queryKey: cashKeys.byPortfolio(id) });
      // Ses plans sont supprimés avec lui (cascade)
      qc.invalidateQueries({ queryKey: planKeys.mine() });
    },
  });
};
