import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { portfolioKeys } from '@/features/portfolios/api/portfolio.api';
import type { AvailableAssetResponse } from '@/features/assets/model/asset.types';
import type { TransactionCreateRequest, TransactionResponse, TransactionUpdateRequest, TransactionHistoryResponse } from '../model/transaction.types';

export const transactionKeys = {
  all: ['transactions'] as const,
  byPortfolio: (pid: string) => [...transactionKeys.all, pid] as const,
  bySymbol: (pid: string, symbol: string) => [...transactionKeys.byPortfolio(pid), 'symbol', symbol] as const,
  history: (pid: string, symbol: string, page: number) => [...transactionKeys.bySymbol(pid, symbol), 'history', page] as const,
  availableAssets: ['available-assets'] as const,
};

const base = (pid: string) => `/portfolios/${pid}/transactions`;

export const useAvailableAssets = (portfolioId: string) =>
  useQuery({
    queryKey: transactionKeys.availableAssets,
    queryFn: () => api.get<AvailableAssetResponse[]>(`${base(portfolioId)}/available-assets`).then(r => r.data),
    staleTime: 24 * 3600_000, // liste statique
  });

/** Endpoint existant : transactions d'un symbole. */
export const useTransactionsBySymbol = (portfolioId: string, symbol: string) =>
  useQuery({
    queryKey: transactionKeys.bySymbol(portfolioId, symbol),
    queryFn: () => api.get<TransactionResponse[]>(base(portfolioId), { params: { assetSymbol: symbol } }).then(r => r.data),
    enabled: !!portfolioId && !!symbol,
  });

/** Endpoint à ajouter (remarque back #2). Déjà branché ici. */
export const useTransactionHistory = (portfolioId: string, symbol: string, page = 0, size = 20) =>
  useQuery({
    queryKey: transactionKeys.history(portfolioId, symbol, page),
    queryFn: () => api.get<TransactionHistoryResponse>(`${base(portfolioId)}/history`, { params: { symbol, page, size } }).then(r => r.data),
    enabled: !!portfolioId && !!symbol,
    placeholderData: p => p,
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
    mutationFn: (b: Omit<TransactionCreateRequest, 'portfolioId'>) =>
      api.post<TransactionResponse>(base(portfolioId), { ...b, portfolioId }).then(r => r.data),
    onSuccess: invalidate,
  });
};
export const useUpdateTransaction = (portfolioId: string) => {
  const invalidate = useInvalidateAfterTransaction(portfolioId);
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TransactionUpdateRequest }) =>
      api.put<TransactionResponse>(`${base(portfolioId)}/${id}`, body).then(r => r.data),
    onSuccess: invalidate,
  });
};
export const useDeleteTransaction = (portfolioId: string) => {
  const invalidate = useInvalidateAfterTransaction(portfolioId);
  return useMutation({ mutationFn: (id: string) => api.delete(`${base(portfolioId)}/${id}`), onSuccess: invalidate });
};