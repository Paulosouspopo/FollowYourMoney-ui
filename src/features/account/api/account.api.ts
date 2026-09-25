import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { SessionInfo, TwoFactorSetup, TwoFactorStatus } from '../model/account.types';

export const accountKeys = {
  twoFactor: ['account', '2fa'] as const,
  sessions: ['account', 'sessions'] as const,
};

export const useTwoFactorStatus = () => useQuery({
  queryKey: accountKeys.twoFactor,
  queryFn: () => api.get<TwoFactorStatus>('/account/2fa').then(r => r.data),
});

export const useSetupTwoFactor = () => useMutation({
  mutationFn: () => api.post<TwoFactorSetup>('/account/2fa/setup').then(r => r.data),
});

const useTwoFactorMutation = <V,>(call: (v: V) => Promise<string[]>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: call, onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.twoFactor }) });
};

/** @returns les codes de secours (affichés une seule fois) */
export const useEnableTwoFactor = () => useTwoFactorMutation((code: string) =>
  api.post<{ recoveryCodes: string[] }>('/account/2fa/enable', { code }).then(r => r.data.recoveryCodes));

export const useRegenerateRecoveryCodes = () => useTwoFactorMutation((code: string) =>
  api.post<{ recoveryCodes: string[] }>('/account/2fa/recovery-codes', { code }).then(r => r.data.recoveryCodes));

export const useDisableTwoFactor = () => useTwoFactorMutation((b: { password: string; code: string }) =>
  api.post('/account/2fa/disable', b).then(() => []));

export const useSessions = () => useQuery({
  queryKey: accountKeys.sessions,
  queryFn: () => api.get<SessionInfo[]>('/auth/sessions').then(r => r.data),
});

export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/auth/sessions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: accountKeys.sessions }),
  });
};

/** Télécharge un fichier protégé (jeton en en-tête : pas de simple lien). */
export async function download(path: string, fallbackName: string) {
  const r = await api.get<Blob>(path, { responseType: 'blob', timeout: 120_000 });
  const name = /filename="([^"]+)"/.exec(String(r.headers['content-disposition'] ?? ''))?.[1] ?? fallbackName;
  const url = URL.createObjectURL(r.data);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}
