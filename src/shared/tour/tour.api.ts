import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { TutorialState } from './tour.types';

/** Hors dashboardKeys : ne dépend pas des opérations. */
export const tutorialKeys = {
  all: ['tutorials'] as const,
};

export const useTutorials = () => useQuery({
  queryKey: tutorialKeys.all,
  queryFn: () => api.get<TutorialState>('/tutorials').then(r => r.data),
  staleTime: Infinity,
});

/** Le serveur renvoie l'état complet : il remplace le cache. */
const useTutorialMutation = <V,>(call: (v: V) => Promise<{ data: TutorialState }>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: V) => call(v).then(r => r.data),
    onSuccess: state => qc.setQueryData(tutorialKeys.all, state),
  });
};

/** Visite terminée ou passée : ne se relance plus d'elle-même. Mise à jour immédiate du cache. */
export const useCompleteTutorial = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => api.post<TutorialState>(`/tutorials/${key}/complete`).then(r => r.data),
    onMutate: key => qc.setQueryData<TutorialState>(tutorialKeys.all, s =>
      s && !s.completed.includes(key) ? { ...s, completed: [...s.completed, key] } : s),
    onSuccess: state => qc.setQueryData(tutorialKeys.all, state),
  });
};

export const useTutorialAutoDisplay = () =>
  useTutorialMutation((autoEnabled: boolean) => api.put<TutorialState>('/tutorials/settings', { autoEnabled }));

export const useResetTutorials = () =>
  useTutorialMutation(() => api.delete<TutorialState>('/tutorials'));
