import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type {
  AlertRule, AlertRuleRequest, NotificationItem, ReportPreview, ReportSettings,
} from '../model/notification.types';

export const notificationKeys = {
  all: ['notifications'] as const,
  inbox: () => [...notificationKeys.all, 'inbox'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  rules: () => [...notificationKeys.all, 'rules'] as const,
  report: () => [...notificationKeys.all, 'report'] as const,
  reportPreview: () => [...notificationKeys.all, 'report', 'preview'] as const,
};

/** Les alertes sont évaluées chaque heure : un rafraîchissement par minute suffit largement. */
const UNREAD_POLL_MS = 60_000;

export const useUnreadCount = () => useQuery({
  queryKey: notificationKeys.unread(),
  queryFn: () => api.get<{ count: number }>('/notifications/unread-count').then(r => r.data.count),
  refetchInterval: UNREAD_POLL_MS,
});

export const useInbox = () => useQuery({
  queryKey: notificationKeys.inbox(),
  queryFn: () => api.get<NotificationItem[]>('/notifications', { params: { limit: 100 } }).then(r => r.data),
});

const useInvalidateInbox = () => {
  const qc = useQueryClient();
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: notificationKeys.inbox() }),
    qc.invalidateQueries({ queryKey: notificationKeys.unread() }),
  ]);
};

export const useMarkRead = () => {
  const invalidate = useInvalidateInbox();
  return useMutation({ mutationFn: (id: string) => api.post(`/notifications/${id}/read`), onSuccess: invalidate });
};

export const useMarkAllRead = () => {
  const invalidate = useInvalidateInbox();
  return useMutation({ mutationFn: () => api.post('/notifications/read-all'), onSuccess: invalidate });
};

export const useAlertRules = () => useQuery({
  queryKey: notificationKeys.rules(),
  queryFn: () => api.get<AlertRule[]>('/alert-rules').then(r => r.data),
});

const useInvalidateRules = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: notificationKeys.rules() });
};

export const useSaveAlertRule = () => {
  const invalidate = useInvalidateRules();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: AlertRuleRequest }) => (id
      ? api.put<AlertRule>(`/alert-rules/${id}`, body)
      : api.post<AlertRule>('/alert-rules', body)).then(r => r.data),
    onSuccess: invalidate,
  });
};

export const useDeleteAlertRule = () => {
  const invalidate = useInvalidateRules();
  return useMutation({ mutationFn: (id: string) => api.delete(`/alert-rules/${id}`), onSuccess: invalidate });
};

export const useReportSettings = () => useQuery({
  queryKey: notificationKeys.report(),
  queryFn: () => api.get<ReportSettings>('/report-settings').then(r => r.data),
});

export const useSaveReportSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: ReportSettings) => api.put<ReportSettings>('/report-settings', b).then(r => r.data),
    onSuccess: s => {
      qc.setQueryData(notificationKeys.report(), s);
      return qc.invalidateQueries({ queryKey: notificationKeys.reportPreview() });
    },
  });
};

/** Chargé à la demande (bouton « Voir un exemple ») : calcule la valorisation. */
export const useReportPreview = (enabled: boolean) => useQuery({
  queryKey: notificationKeys.reportPreview(),
  queryFn: () => api.get<ReportPreview>('/report-settings/preview').then(r => r.data),
  enabled,
  staleTime: 0,
});
