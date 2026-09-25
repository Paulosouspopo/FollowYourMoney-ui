import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { CashMovementRequest, CashMovementResponse, InterestEstimate } from '../model/cash.types';

export const cashKeys = {
  all: ['cash-movements'] as const,
  byPortfolio: (pid: string) => [...cashKeys.all, pid] as const,
  /** Sous dashboardKeys.all : un achat d'unités de compte change le fonds euros. */
  interest: (pid: string, year: number) => [...dashboardKeys.all, 'interest', pid, year] as const,
};

const base = (pid: string) => `/portfolios/${pid}/cash-movements`;

/** Comme une transaction : le back recalcule l'historique avant de répondre. */
const MUTATION_TIMEOUT = 120_000;

export const useCashMovements = (portfolioId: string, enabled = true) =>
  useQuery({
    queryKey: cashKeys.byPortfolio(portfolioId),
    queryFn: () => api.get<CashMovementResponse[]>(base(portfolioId)).then(r => r.data),
    enabled: enabled && !!portfolioId,
  });

/** Un mouvement change le solde, donc la valeur : mouvements du portefeuille + tout le dashboard. */
function useInvalidateAfterMovement(portfolioId: string) {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: cashKeys.byPortfolio(portfolioId) }),
    qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);
}

export const useCreateCashMovement = (portfolioId: string) => {
  const invalidate = useInvalidateAfterMovement(portfolioId);
  return useMutation({
    mutationFn: (b: CashMovementRequest) =>
      api.post<CashMovementResponse>(base(portfolioId), b, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};

export const useUpdateCashMovement = (portfolioId: string) => {
  const invalidate = useInvalidateAfterMovement(portfolioId);
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CashMovementRequest }) =>
      api.put<CashMovementResponse>(`${base(portfolioId)}/${id}`, body, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};

export const useDeleteCashMovement = (portfolioId: string) => {
  const invalidate = useInvalidateAfterMovement(portfolioId);
  return useMutation({
    mutationFn: (id: string) => api.delete(`${base(portfolioId)}/${id}`, { timeout: MUTATION_TIMEOUT }),
    onSuccess: invalidate,
  });
};

/** Intérêts estimés d'une année (livret, fonds euros). */
export const useInterestEstimate = (portfolioId: string, year: number, enabled = true) =>
  useQuery({
    queryKey: cashKeys.interest(portfolioId, year),
    queryFn: () => api.get<InterestEstimate>(`${base(portfolioId)}/interest-estimate`, { params: { year } }).then(r => r.data),
    enabled: enabled && !!portfolioId,
  });
