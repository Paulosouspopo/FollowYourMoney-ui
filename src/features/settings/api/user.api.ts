import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { UserResponse, UserUpdateRequest } from '@/features/settings/model/user.types';

export const userKeys = { me: ['users', 'me'] as const };

export const useMe = () => useQuery({ queryKey: userKeys.me, queryFn: () => api.get<UserResponse>('/users/me').then(r => r.data), staleTime: Infinity });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: UserUpdateRequest) => api.put<UserResponse>('/users/me', b).then(r => r.data),
    onSuccess: (u) => qc.setQueryData(userKeys.me, u),
  });
};
export const useDeleteMe = () => useMutation({ mutationFn: () => api.delete('/users/me') });