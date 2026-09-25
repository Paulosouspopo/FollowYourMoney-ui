import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { transactionKeys } from '@/features/transactions/api/transaction.api';
import type { AssetResponse } from '@/features/assets/model/asset.types';

/** Délai large : le back télécharge l'historique du nouvel actif et recalcule le portefeuille. */
const REPLACE_TIMEOUT = 120_000;

/**
 * Remplacer l'actif d'une ligne (opérations conservées ; fusion si le nouvel
 * actif est déjà présent). Tout ce qui dépend des cours est rafraîchi.
 */
export const useReplaceAsset = (portfolioId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, symbol }: { assetId: string; symbol: string }) =>
      api.post<AssetResponse>(`/portfolios/${portfolioId}/assets/${assetId}/replace`, { symbol }, { timeout: REPLACE_TIMEOUT })
        .then(r => r.data),
    onSuccess: () => Promise.all([
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
      qc.invalidateQueries({ queryKey: transactionKeys.byPortfolio(portfolioId) }),
    ]),
  });
};
