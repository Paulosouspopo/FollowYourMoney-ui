import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { transactionKeys } from '@/features/transactions/api/transaction.api';
import { cashKeys } from '@/features/cash/api/cash.api';
import type { PlanRequest, PlanResponse } from '../model/plan.types';

export const planKeys = {
  all: ['plans'] as const,
  mine: () => [...planKeys.all, 'mine'] as const,
  byPortfolio: (pid: string) => [...planKeys.all, 'portfolio', pid] as const,
};

/** Un plan qui démarre dans le passé crée ses échéances aussitôt (cours historiques + recalcul). */
const MUTATION_TIMEOUT = 180_000;

export const useMyPlans = () => useQuery({
  queryKey: planKeys.mine(),
  queryFn: () => api.get<PlanResponse[]>('/plans').then(r => r.data),
});

export const usePortfolioPlans = (portfolioId: string) => useQuery({
  queryKey: planKeys.byPortfolio(portfolioId),
  queryFn: () => api.get<PlanResponse[]>(`/portfolios/${portfolioId}/plans`).then(r => r.data),
  enabled: !!portfolioId,
});

/** Une échéance exécutée crée une transaction ou un versement : tout le portefeuille est à rafraîchir. */
function useInvalidateAfterPlan(portfolioId: string) {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: planKeys.all }),
    qc.invalidateQueries({ queryKey: transactionKeys.byPortfolio(portfolioId) }),
    qc.invalidateQueries({ queryKey: cashKeys.byPortfolio(portfolioId) }),
    qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);
}

export const useCreatePlan = (portfolioId: string) => {
  const invalidate = useInvalidateAfterPlan(portfolioId);
  return useMutation({
    mutationFn: (b: PlanRequest) =>
      api.post<PlanResponse>(`/portfolios/${portfolioId}/plans`, b, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};

export const useUpdatePlan = (portfolioId: string) => {
  const invalidate = useInvalidateAfterPlan(portfolioId);
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PlanRequest }) =>
      api.put<PlanResponse>(`/plans/${id}`, body, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};

export const useDeletePlan = (portfolioId: string) => {
  const invalidate = useInvalidateAfterPlan(portfolioId);
  return useMutation({ mutationFn: (id: string) => api.delete(`/plans/${id}`), onSuccess: invalidate });
};
