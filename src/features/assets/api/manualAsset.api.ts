import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { AssetResponse, ManualAssetRequest, Valuation } from '../model/asset.types';

/** Sous dashboardKeys.all : une valeur saisie change la valorisation. */
export const manualAssetKeys = {
  all: [...dashboardKeys.all, 'manual-assets'] as const,
  byPortfolio: (pid: string) => [...manualAssetKeys.all, pid] as const,
  valuations: (pid: string, assetId: string) => [...manualAssetKeys.byPortfolio(pid), 'valuations', assetId] as const,
};

/** Recalcul de l'historique avant la réponse (comme une transaction). */
const MUTATION_TIMEOUT = 120_000;

export const useManualAssets = (portfolioId: string) => useQuery({
  queryKey: manualAssetKeys.byPortfolio(portfolioId),
  queryFn: () => api.get<AssetResponse[]>(`/portfolios/${portfolioId}/manual-assets`).then(r => r.data),
  enabled: !!portfolioId,
});

export const useCreateManualAsset = (portfolioId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ManualAssetRequest) =>
      api.post<AssetResponse>(`/portfolios/${portfolioId}/manual-assets`, body).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: manualAssetKeys.byPortfolio(portfolioId) }),
  });
};

export const useValuations = (portfolioId: string, assetId: string | undefined) => useQuery({
  queryKey: manualAssetKeys.valuations(portfolioId, assetId ?? ''),
  queryFn: () => api.get<Valuation[]>(`/portfolios/${portfolioId}/assets/${assetId}/valuations`).then(r => r.data),
  enabled: !!portfolioId && !!assetId,
});

/** Une valeur saisie change la valeur de la ligne et l'historique : tout le dashboard. */
export const useSaveValuation = (portfolioId: string, assetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { date: string; price: number }) =>
      api.put<Valuation>(`/portfolios/${portfolioId}/assets/${assetId}/valuations`, body, { timeout: MUTATION_TIMEOUT })
        .then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};

export const useDeleteValuation = (portfolioId: string, assetId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (date: string) =>
      api.delete(`/portfolios/${portfolioId}/assets/${assetId}/valuations/${date}`, { timeout: MUTATION_TIMEOUT }),
    onSuccess: () => qc.invalidateQueries({ queryKey: dashboardKeys.all }),
  });
};
