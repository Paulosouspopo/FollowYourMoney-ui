export type NotificationType = 'ALERT' | 'REPORT' | 'PLAN';

export interface NotificationItem {
  id: string; type: NotificationType; title: string; body: string;
  /** Chemin de l'app à ouvrir (ex : /portfolios/<id>). */
  link: string | null; read: boolean; createdAt: string;
}

export type AlertScope = 'GLOBAL' | 'PORTFOLIO' | 'ASSET';
export type AlertCondition = 'RISES' | 'FALLS' | 'MOVES' | 'ABOVE' | 'BELOW';
export type AlertPeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface AlertRule {
  id: string; scope: AlertScope; portfolioId: string | null; portfolioName: string | null;
  symbol: string | null; assetName: string | null;
  condition: AlertCondition; threshold: number; period: AlertPeriod | null;
  notifyEmail: boolean; enabled: boolean; lastTriggeredAt: string | null;
  /** La règle en français, calculée par le back. */
  description: string;
}

export interface AlertRuleRequest {
  scope: AlertScope; portfolioId: string | null; symbol: string | null;
  condition: AlertCondition; threshold: number; period: AlertPeriod | null;
  notifyEmail: boolean; enabled: boolean;
}

export type ReportFrequency = 'NONE' | 'DAILY' | 'WEEKLY';
export interface ReportSettings { frequency: ReportFrequency; sendHour: number; notifyEmail: boolean; }
export interface ReportPreview { title: string; body: string; }

export const SCOPE_LABEL: Record<AlertScope, string> = {
  GLOBAL: 'Mon patrimoine total', PORTFOLIO: 'Un portefeuille', ASSET: 'Un actif',
};
export const CONDITION_LABEL: Record<AlertCondition, string> = {
  RISES: 'monte de', FALLS: 'baisse de', MOVES: 'varie de (hausse ou baisse)',
  ABOVE: 'passe au-dessus de', BELOW: 'passe en dessous de',
};
export const PERIOD_LABEL: Record<AlertPeriod, string> = { DAY: 'sur 1 jour', WEEK: 'sur 7 jours', MONTH: 'sur 30 jours' };
export const isPercentage = (c: AlertCondition) => c === 'RISES' || c === 'FALLS' || c === 'MOVES';
