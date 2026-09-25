import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { PerformancePeriod } from '@/features/performance/model/performance.types';
import type { ContributionReport, Exposure } from '../model/analysis.types';

/** Sous dashboardKeys.all : toute opération change l'exposition et les contributions. */
export const analysisKeys = {
  all: [...dashboardKeys.all, 'analysis'] as const,
  exposure: (portfolioId: string | null) => [...analysisKeys.all, 'exposure', portfolioId ?? 'all'] as const,
  contributions: (portfolioId: string | null, period: PerformancePeriod) =>
    [...analysisKeys.all, 'contributions', portfolioId ?? 'all', period] as const,
};

/** Première ouverture : le back télécharge le profil de chaque actif (quelques secondes). */
const ANALYSIS_TIMEOUT = 90_000;

/** @param portfolioId null = tout le patrimoine */
export const useExposure = (portfolioId: string | null) => useQuery({
  queryKey: analysisKeys.exposure(portfolioId),
  queryFn: () => api.get<Exposure>('/analysis/exposure', {
    params: { portfolioId: portfolioId ?? undefined }, timeout: ANALYSIS_TIMEOUT,
  }).then(r => r.data),
  placeholderData: prev => prev,
});

export const useContributions = (portfolioId: string | null, period: PerformancePeriod) => useQuery({
  queryKey: analysisKeys.contributions(portfolioId, period),
  queryFn: () => api.get<ContributionReport>('/analysis/contributions', {
    params: { portfolioId: portfolioId ?? undefined, period },
  }).then(r => r.data),
  placeholderData: prev => prev,
});

/** Frais courants d'un fonds saisis à la main (null = revenir à ceux de Yahoo). */
export const useSetFundFee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { symbol: string; annualFeePct: number | null }) => api.put('/analysis/fees', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...analysisKeys.all, 'exposure'] }),
  });
};
