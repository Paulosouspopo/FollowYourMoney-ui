export type NotificationType = 'ALERT' | 'REPORT' | 'PLAN';

export interface NotificationItem {
  id: string; type: NotificationType; title: string; body: string;
  /** Chemin de l'app à ouvrir (ex : /portfolios/<id>, /markets/BTC-EUR). */
  link: string | null; read: boolean; createdAt: string;
}

export type AlertScope = 'GLOBAL' | 'PORTFOLIO' | 'ASSET';
export type AlertCondition =
  | 'RISES' | 'FALLS' | 'MOVES' | 'ABOVE' | 'BELOW'
  | 'PROFIT_ABOVE' | 'LOSS_BELOW' | 'NEW_HIGH' | 'NEW_LOW' | 'WEIGHT_ABOVE';
export type AlertPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export interface AlertRule {
  id: string; scope: AlertScope; portfolioId: string | null; portfolioName: string | null;
  symbol: string | null; assetName: string | null;
  condition: AlertCondition; threshold: number; period: AlertPeriod | null;
  notifyEmail: boolean; notifyPush: boolean; enabled: boolean;
  /** Nom libre, sert de titre à la notification. */
  label: string | null;
  /** Sourdine jusqu'à cette date (heure locale), null = active. */
  mutedUntil: string | null;
  lastTriggeredAt: string | null;
  /** La règle en français, calculée par le back. */
  description: string;
}

export interface AlertRuleRequest {
  scope: AlertScope; portfolioId: string | null; symbol: string | null;
  condition: AlertCondition; threshold: number | null; period: AlertPeriod | null;
  notifyEmail: boolean; notifyPush: boolean; enabled: boolean;
  label: string | null; mutedUntil: string | null;
}

export type ReportFrequency = 'NONE' | 'DAILY' | 'WEEKLY';
export interface ReportSettings { frequency: ReportFrequency; sendHour: number; notifyEmail: boolean; }
export interface ReportPreview { title: string; body: string; }

export interface NotificationPreferences {
  pushEnabled: boolean;
  /** Heures calmes (0-23), toutes deux nulles = aucune. La plage peut passer minuit. */
  quietStart: number | null; quietEnd: number | null;
  /** Appareils abonnés au push (lecture seule). */
  devices: number;
}

export const SCOPE_LABEL: Record<AlertScope, string> = {
  GLOBAL: 'Mon patrimoine total', PORTFOLIO: 'Un portefeuille', ASSET: 'Un actif',
};
export const CONDITION_LABEL: Record<AlertCondition, string> = {
  RISES: 'monte de', FALLS: 'baisse de', MOVES: 'varie de (hausse ou baisse)',
  ABOVE: 'passe au-dessus de', BELOW: 'passe en dessous de',
  PROFIT_ABOVE: 'dépasse une plus-value de', LOSS_BELOW: 'dépasse une moins-value de',
  NEW_HIGH: 'atteint un nouveau plus haut', NEW_LOW: 'atteint un nouveau plus bas',
  WEIGHT_ABOVE: 'pèse plus de (part du patrimoine)',
};
export const PERIOD_LABEL: Record<AlertPeriod, string> = {
  DAY: 'sur 1 jour', WEEK: 'sur 7 jours', MONTH: 'sur 30 jours', YEAR: 'sur 1 an',
};

/** Conditions proposées selon le périmètre (le back refuse les autres combinaisons). */
export const CONDITIONS_BY_SCOPE: Record<AlertScope, AlertCondition[]> = {
  GLOBAL: ['FALLS', 'RISES', 'MOVES', 'ABOVE', 'BELOW', 'PROFIT_ABOVE', 'LOSS_BELOW'],
  PORTFOLIO: ['FALLS', 'RISES', 'MOVES', 'ABOVE', 'BELOW', 'PROFIT_ABOVE', 'LOSS_BELOW', 'WEIGHT_ABOVE'],
  ASSET: ['FALLS', 'RISES', 'MOVES', 'ABOVE', 'BELOW', 'NEW_HIGH', 'NEW_LOW', 'PROFIT_ABOVE', 'LOSS_BELOW', 'WEIGHT_ABOVE'],
};

export const isVariation = (c: AlertCondition) => c === 'RISES' || c === 'FALLS' || c === 'MOVES';
export const isExtreme = (c: AlertCondition) => c === 'NEW_HIGH' || c === 'NEW_LOW';
/** Seuil en % (sinon en €, ou pas de seuil pour un record). */
export const isPercentage = (c: AlertCondition) =>
  isVariation(c) || c === 'PROFIT_ABOVE' || c === 'LOSS_BELOW' || c === 'WEIGHT_ABOVE';
export const hasThreshold = (c: AlertCondition) => !isExtreme(c);
export const periodsFor = (c: AlertCondition): AlertPeriod[] =>
  isVariation(c) ? ['DAY', 'WEEK', 'MONTH'] : isExtreme(c) ? ['WEEK', 'MONTH', 'YEAR'] : [];
/** Conditions sur la plus-value ou le poids : l'actif doit être détenu. */
export const needsHolding = (c: AlertCondition) => c === 'PROFIT_ABOVE' || c === 'LOSS_BELOW' || c === 'WEIGHT_ABOVE';
