import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { portfolioKeys } from '@/features/portfolios/api/portfolio.api';
import type { TransactionCreateRequest, TransactionResponse, TransactionUpdateRequest, TransactionHistoryResponse } from '../model/transaction.types';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';

export const transactionKeys = {
  all: ['transactions'] as const,
  byPortfolio: (pid: string) => [...transactionKeys.all, pid] as const,
  bySymbol: (pid: string, symbol: string) => [...transactionKeys.byPortfolio(pid), 'symbol', symbol] as const,
  history: (pid: string, symbol: string, page: number) => [...transactionKeys.bySymbol(pid, symbol), 'history', page] as const,
  availableAssets: ['available-assets'] as const,
};

const base = (pid: string) => `/portfolios/${pid}/transactions`;

export const assetSearchKeys = {
  all: ['assets', 'search'] as const,
  byQuery: (q: string) => [...assetSearchKeys.all, q] as const,
};

export const useAssetSearch = (query: string, enabled = true) =>
  useQuery({
    queryKey: assetSearchKeys.byQuery(query),
    queryFn: () =>
      query.trim().length < 1
        ? Promise.resolve([])  // pas de requête si vide
        : api.get<AssetSearchResult[]>('/assets/search', { params: { query } }).then(r => r.data),
    enabled: enabled && query.trim().length >= 1,
    staleTime: 5 * 60_000, // 5 min, la liste Yahoo ne change pas souvent
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