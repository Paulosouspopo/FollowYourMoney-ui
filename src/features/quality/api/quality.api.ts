import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { TransactionType } from '@/shared/model/enums';
import type { DataIssue, DataWarning } from '../model/quality.types';

/** Sous dashboardKeys.all : toute modification d'opération relance l'audit. */
export const qualityKeys = {
  all: [...dashboardKeys.all, 'quality'] as const,
  audit: () => [...qualityKeys.all, 'audit'] as const,
  check: (p: TransactionCheckParams) => [...qualityKeys.all, 'check', p] as const,
};

export interface TransactionCheckParams {
  portfolioId: string; symbol: string; type: TransactionType;
  /** YYYY-MM-DD */
  date: string; price: number | null; currency: string;
}

export const useDataIssues = () => useQuery({
  queryKey: qualityKeys.audit(),
  queryFn: () => api.get<DataIssue[]>('/data-checks').then(r => r.data),
  staleTime: 5 * 60_000,
});

/** Paramètres déjà « debouncés » par l'appelant ; null = pas de contrôle. */
export const useTransactionCheck = (params: TransactionCheckParams | null) => useQuery({
  queryKey: qualityKeys.check(params!),
  queryFn: () => api.get<DataWarning[]>('/data-checks/transaction', {
    params: { ...params, price: params!.price ?? undefined }, timeout: 30_000,
  }).then(r => r.data),
  enabled: params != null,
  staleTime: 10 * 60_000,
  placeholderData: prev => prev,
});

export const useDismissIssue = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => api.post('/data-checks/dismiss', { key }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qualityKeys.audit() }),
  });
};
