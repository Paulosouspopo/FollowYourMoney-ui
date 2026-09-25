import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import { transactionKeys } from '@/features/transactions/api/transaction.api';
import { cashKeys } from '@/features/cash/api/cash.api';
import { portfolioKeys } from '@/features/portfolios/api/portfolio.api';
import type {
  ImportCommitRequest, ImportCommitResult, ImportInspection, ImportPreview, PreviewOptions,
} from '../model/import.types';

/** L'aperçu interroge Yahoo pour chaque actif ; la validation recalcule tout l'historique. */
const PREVIEW_TIMEOUT = 120_000;
const COMMIT_TIMEOUT = 300_000;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const useInspectImport = () => useMutation({
  mutationFn: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ImportInspection>('/imports/inspect', form).then(r => r.data);
  },
});

export const usePreviewImport = () => useMutation({
  mutationFn: ({ file, options }: { file: File; options: PreviewOptions }) => {
    const form = new FormData();
    form.append('file', file);
    // Partie JSON typée : le back la lit comme un objet (@RequestPart)
    form.append('options', new Blob([JSON.stringify(options)], { type: 'application/json' }));
    return api.post<ImportPreview>('/imports/preview', form, { timeout: PREVIEW_TIMEOUT }).then(r => r.data);
  },
});

/** Un import touche tout le portefeuille : opérations, liquidités, détail et dashboard. */
export const useCommitImport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: ImportCommitRequest) =>
      api.post<ImportCommitResult>('/imports/commit', b, { timeout: COMMIT_TIMEOUT }).then(r => r.data),
    onSuccess: (_, b) => Promise.all([
      qc.invalidateQueries({ queryKey: transactionKeys.byPortfolio(b.portfolioId) }),
      qc.invalidateQueries({ queryKey: cashKeys.byPortfolio(b.portfolioId) }),
      qc.invalidateQueries({ queryKey: portfolioKeys.all }),
      qc.invalidateQueries({ queryKey: dashboardKeys.all }),
    ]),
  });
};
