import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/auth.store';
import type { AuthResponse, ChangePasswordRequest, LoginRequest, ResetPasswordRequest } from '../model/auth.types';
import type { UserCreateRequest, UserResponse } from '@/features/settings/model/user.types';

// Les endpoints /auth gèrent eux-mêmes les 401 (identifiants faux, lien
// expiré) : pas de tentative de renouvellement de session.
const noRefresh = { skipAuthRefresh: true } as const;

export const useLogin = (redirectTo = '/') => {
  const setSession = useAuthStore(s => s.setSession);
  const nav = useNavigate();
  return useMutation({
    mutationFn: (b: LoginRequest) => api.post<AuthResponse>('/auth/login', b, noRefresh).then(r => r.data),
    onSuccess: ({ accessToken }) => { setSession(accessToken); nav(redirectTo, { replace: true }); },
  });
};

/** Crée le compte ; la connexion n'est possible qu'après confirmation de l'email. */
export const useRegister = () => useMutation({
  mutationFn: (b: UserCreateRequest) => api.post<UserResponse>('/auth/register', b, noRefresh).then(r => r.data),
});

export const useVerifyEmail = () => useMutation({
  mutationFn: (token: string) => api.post('/auth/verify-email', { token }, noRefresh),
});

export const useResendVerification = () => useMutation({
  mutationFn: (email: string) => api.post('/auth/resend-verification', { email }, noRefresh),
});

export const useForgotPassword = () => useMutation({
  mutationFn: (email: string) => api.post('/auth/forgot-password', { email }, noRefresh),
});

export const useResetPassword = () => useMutation({
  mutationFn: (b: ResetPasswordRequest) => api.post('/auth/reset-password', b, noRefresh),
});

/** Les autres appareils sont déconnectés ; celui-ci reçoit une nouvelle session. */
export const useChangePassword = () => {
  const setSession = useAuthStore(s => s.setSession);
  return useMutation({
    mutationFn: (b: ChangePasswordRequest) => api.post<AuthResponse>('/auth/change-password', b).then(r => r.data),
    onSuccess: ({ accessToken }) => setSession(accessToken),
  });
};

/** Vide la session locale et le cache (données de l'utilisateur précédent). */
const useClearLocalSession = () => {
  const clearSession = useAuthStore(s => s.clearSession);
  const qc = useQueryClient();
  return () => { clearSession(); qc.clear(); };
};

/** Déconnexion de cet appareil. La session locale est vidée même si le serveur ne répond pas. */
export const useLogout = () => {
  const clearLocal = useClearLocalSession();
  return () => api.post('/auth/logout', undefined, noRefresh).catch(() => undefined).finally(clearLocal);
};

export const useLogoutEverywhere = () => {
  const clearLocal = useClearLocalSession();
  return useMutation({
    mutationFn: () => api.post('/auth/logout-all'),
    onSuccess: clearLocal,
  });
};
