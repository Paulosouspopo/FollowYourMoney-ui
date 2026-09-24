import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { MarketDetail, MarketRange, PricePoint, WatchlistItem } from '../model/market.types';

export const marketKeys = {
  all: ['markets'] as const,
  watchlist: () => [...marketKeys.all, 'watchlist'] as const,
  detail: (symbol: string) => [...marketKeys.all, 'detail', symbol] as const,
  history: (symbol: string, range: MarketRange) => [...marketKeys.all, 'history', symbol, range] as const,
};

/** Premier ajout : le back télécharge un an d'historique (sparkline, records). */
const ADD_TIMEOUT = 60_000;

export const useWatchlist = () => useQuery({
  queryKey: marketKeys.watchlist(),
  queryFn: () => api.get<WatchlistItem[]>('/watchlist').then(r => r.data),
});

export const useMarketDetail = (symbol: string) => useQuery({
  queryKey: marketKeys.detail(symbol),
  queryFn: () => api.get<MarketDetail>('/market/detail', { params: { symbol } }).then(r => r.data),
  enabled: !!symbol,
});

export const useMarketHistory = (symbol: string, range: MarketRange) => useQuery({
  queryKey: marketKeys.history(symbol, range),
  queryFn: () => api.get<PricePoint[]>('/market/history', { params: { symbol, range }, timeout: ADD_TIMEOUT })
    .then(r => r.data),
  enabled: !!symbol,
  staleTime: 10 * 60_000,
  placeholderData: prev => prev, // pas de clignotement en changeant de période
});

/** Suivre / ne plus suivre : la liste et la fiche (bouton « Suivre ») changent. */
const useInvalidateWatch = () => {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: marketKeys.watchlist() }),
    qc.invalidateQueries({ queryKey: [...marketKeys.all, 'detail'] }),
  ]);
};

export const useAddToWatchlist = () => {
  const invalidate = useInvalidateWatch();
  return useMutation({
    mutationFn: (symbol: string) =>
      api.post<WatchlistItem>('/watchlist', { symbol }, { timeout: ADD_TIMEOUT }).then(r => r.data),
    onSuccess: invalidate,
  });
};

export const useRemoveFromWatchlist = () => {
  const invalidate = useInvalidateWatch();
  return useMutation({ mutationFn: (id: string) => api.delete(`/watchlist/${id}`), onSuccess: invalidate });
};
