import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { api } from '@/shared/api/client';
import { queryClient } from '@/shared/api/queryClient';
import { toast, type ToastAction } from '@/shared/ui/toast.store';
import type { TrashItem } from '../model/trash.types';

export const trashKeys = { all: ['trash'] as const };

/** Une restauration recrée opérations et portefeuilles : tout le cache est à rafraîchir. */
const RESTORE_TIMEOUT = 120_000;

export const useTrash = () => useQuery({
  queryKey: trashKeys.all,
  queryFn: () => api.get<TrashItem[]>('/trash').then(r => r.data),
});

const restore = (id: string) =>
  api.post<{ portfolioId: string }>(`/trash/${id}/restore`, null, { timeout: RESTORE_TIMEOUT }).then(r => r.data);

export const useRestoreTrashItem = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: restore, onSuccess: () => qc.invalidateQueries() });
};

export const useDeleteTrashItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/trash/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: trashKeys.all }),
  });
};

export const useEmptyTrash = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete('/trash'),
    onSuccess: () => qc.invalidateQueries({ queryKey: trashKeys.all }),
  });
};

/**
 * Bouton « Annuler » du toast de suppression : la réponse du back porte
 * l'identifiant de l'élément mis à la corbeille (en-tête X-Trash-Id).
 */
export function undoAction(response: AxiosResponse | undefined): ToastAction | undefined {
  const id = response?.headers?.['x-trash-id'] as string | undefined;
  if (!id) return undefined;
  return {
    label: 'Annuler',
    onClick: () => restore(id)
      .then(() => { toast.success('Restauré'); return queryClient.invalidateQueries(); })
      .catch((e: { message?: string }) => toast.error(e.message ?? 'Restauration impossible')),
  };
}
