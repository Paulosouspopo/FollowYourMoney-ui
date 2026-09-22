import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/auth.store';
import type { AuthResponse, LoginRequest, UserCreateRequest, UserResponse } from '../model/auth.types';

export const useLogin = () => {
  const setToken = useAuthStore(s => s.setToken);
  const nav = useNavigate();
  return useMutation({
    mutationFn: (b: LoginRequest) => api.post<AuthResponse>('/auth/login', b).then(r => r.data),
    onSuccess: ({ token }) => { setToken(token); nav('/', { replace: true }); },
  });
};

/** Register = create user puis login automatique. */
export const useRegister = () => {
  const login = useLogin();
  return useMutation({
    mutationFn: async (b: UserCreateRequest) => {
      await api.post<UserResponse>('/users', b);
      return login.mutateAsync({ email: b.email, password: b.password });
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore(s => s.logout);
  const qc = useQueryClient();
  return () => { logout(); qc.clear(); };
};