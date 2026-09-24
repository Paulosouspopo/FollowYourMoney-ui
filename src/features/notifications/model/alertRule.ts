import type { AlertRule, AlertRuleRequest } from './notification.types';

/** Corps de requête reprenant une règle existante (bascule active/inactive, sourdine…). */
export const toRequest = (r: AlertRule, patch: Partial<AlertRuleRequest> = {}): AlertRuleRequest => ({
  scope: r.scope, portfolioId: r.portfolioId, symbol: r.symbol, condition: r.condition,
  threshold: r.threshold, period: r.period, notifyEmail: r.notifyEmail, notifyPush: r.notifyPush,
  enabled: r.enabled, label: r.label, mutedUntil: r.mutedUntil, ...patch,
});

export const isMuted = (r: AlertRule, now = new Date()) => r.mutedUntil != null && new Date(r.mutedUntil) > now;
