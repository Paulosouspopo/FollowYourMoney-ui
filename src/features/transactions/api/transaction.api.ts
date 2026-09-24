import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { portfolioKeys } from '@/features/portfolios/api/portfolio.api';
import type { TransactionCreateRequest, TransactionResponse, TransactionUpdateRequest } from '../model/transaction.types';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';

export const transactionKeys = {
  all: ['transactions'] as const,
  byPortfolio: (pid: string) => [...transactionKeys.all, pid] as const,
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

/** Longueur minimale acceptée par le back (AssetSearchService). */
export const ASSET_SEARCH_MIN_LENGTH = 2;

export const assetSearchKeys = {
  all: ['assets', 'search'] as const,
  byQuery: (q: string) => [...assetSearchKeys.all, q] as const,
};

/** `query` doit déjà être debouncée par l'appelant. */
export const useAssetSearch = (query: string, enabled = true) => {
  const q = query.trim();
  return useQuery({
    queryKey: assetSearchKeys.byQuery(q),
    queryFn: () => api.get<AssetSearchResult[]>('/assets/search', { params: { query: q } }).then(r => r.data),
    enabled: enabled && q.length >= ASSET_SEARCH_MIN_LENGTH,
    staleTime: 5 * 60_000, // 5 min, la liste Yahoo ne change pas souvent
  });
};

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
    // portfolioId est aussi exigé dans le body par TransactionCreateRequest (@NotNull)
    mutationFn: (b: Omit<TransactionCreateRequest, 'portfolioId'>) =>
      api.post<TransactionResponse>(base(portfolioId), { ...b, portfolioId }, { timeout: MUTATION_TIMEOUT }).then(r => r.data),
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
