import { api } from '@/shared/api/client';
import type { LoginRequest, AuthResponse } from '../model/auth.types';
import type { UserCreateRequest, UserResponse } from '@/features/settings/model/user.types';

export const authApi = {
  login: (body: LoginRequest) => api.post<AuthResponse>('/auth/login', body).then(r => r.data),
  register: (body: UserCreateRequest) => api.post<UserResponse>('/users', body).then(r => r.data),
};