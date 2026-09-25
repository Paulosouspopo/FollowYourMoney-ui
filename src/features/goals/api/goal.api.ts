import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { dashboardKeys } from '@/features/dashboard/api/dashboard.api';
import type { Goal, GoalRequest } from '../model/goal.types';

/** Sous dashboardKeys.all : la progression dépend de la valorisation. */
export const goalKeys = {
  all: [...dashboardKeys.all, 'goals'] as const,
};

export const useGoals = () => useQuery({
  queryKey: goalKeys.all,
  queryFn: () => api.get<Goal[]>('/goals').then(r => r.data),
});

export const useSaveGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: GoalRequest }) =>
      (id ? api.put<Goal>(`/goals/${id}`, body) : api.post<Goal>('/goals', body)).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
};

export const useDeleteGoal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: goalKeys.all }),
  });
};
