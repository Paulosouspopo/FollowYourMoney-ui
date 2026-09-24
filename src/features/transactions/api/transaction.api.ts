import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { portfolioKeys } from '@/features/portfolios/api/portfolio.api';
import type { TransactionCreateRequest, TransactionResponse, TransactionUpdateRequest } from '../model/transaction.types';

export const transactionKeys = {
  all: ['transactions'] as const,
  byPortfolio: (pid: string) => [...transactionKeys.all, pid] as const,
  list: (pid: string) => [...transactionKeys.byPortfolio(pid), 'list'] as const,
  bySymbol: (pid: string, symbol: string) => [...transactionKeys.byPortfolio(pid), 'symbol', symbol] as const,
};

const base = (pid: string) => `/portfolios/${pid}/transactions`;

/**
 * Une mutation de transaction déclenche côté back, AVANT la réponse, le
 * téléchargement de l'historique Yahoo manquant + la reconstruction des
 * snapshots. Pour une opération ancienne, ça peut dépasser le timeout par
 * défaut du client (15 s).
 */
const MUTATION_TIMEOUT = 120_000;

/** Toutes les transactions du portefeuille, plus récentes d'abord. */
export const usePortfolioTransactions = (portfolioId: string) =>
  useQuery({
    queryKey: transactionKeys.list(portfolioId),
    queryFn: () => api.get<TransactionResponse[]>(base(portfolioId)).then(r => r.data),
    enabled: !!portfolioId,
  });

/** Transactions d'un actif du portefeuille (GET ?assetSymbol=). */
export const useTransactionsBySymbol = (portfolioId: string, symbol: string) =>
  useQuery({
    queryKey: transactionKeys.bySymbol(portfolioId, symbol),
    queryFn: () => api.get<TransactionResponse[]>(base(portfolioId), { params: { assetSymbol: symbol } }).then(r => r.data),
    enabled: !!portfolioId && !!symbol,
  });

/** Toute mutation transaction invalide : les transactions du portefeuille, le détail portefeuille (liste d'assets), et TOUT le dashboard. */
function useInvalidateAfterTransaction(portfolioId: string) {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: transactionKeys.byPortfolio(portfolioId) }),
    qc.invalidateQueries({ queryKey: portfolioKeys.detail(portfolioId) }),
    qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  ]);
}

export const useCreateTransaction = (portfolioId: string) => {
  const invalidate = useInvalidateAfterTransaction(portfolioId);
  return useMutation({
    mutationFn: (b: TransactionCreateRequest) =>
      api.post<TransactionResponse>(base(portfolioId), b, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};
export const useUpdateTransaction = (portfolioId: string) => {
  const invalidate = useInvalidateAfterTransaction(portfolioId);
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TransactionUpdateRequest }) =>
      api.put<TransactionResponse>(`${base(portfolioId)}/${id}`, body, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};
export const useDeleteTransaction = (portfolioId: string) => {
  const invalidate = useInvalidateAfterTransaction(portfolioId);
  return useMutation({
    mutationFn: (id: string) => api.delete(`${base(portfolioId)}/${id}`, { timeout: MUTATION_TIMEOUT }),
    onSuccess: invalidate,
  });
};
