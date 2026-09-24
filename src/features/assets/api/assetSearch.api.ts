import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { AssetSearchResult } from '../model/asset.types';

/** Longueur minimale acceptée par le back (AssetSearchService). */
export const ASSET_SEARCH_MIN_LENGTH = 2;

export const assetSearchKeys = {
  all: ['assets', 'search'] as const,
  byQuery: (q: string) => [...assetSearchKeys.all, q] as const,
};

/** Recherche live Yahoo (GET /assets/search). `query` doit déjà être debouncée par l'appelant. */
export const useAssetSearch = (query: string, enabled = true) => {
  const q = query.trim();
  return useQuery({
    queryKey: assetSearchKeys.byQuery(q),
    queryFn: () => api.get<AssetSearchResult[]>('/assets/search', { params: { query: q } }).then(r => r.data),
    enabled: enabled && q.length >= ASSET_SEARCH_MIN_LENGTH,
    staleTime: 5 * 60_000, // 5 min, la liste Yahoo ne change pas souvent
  });
};
