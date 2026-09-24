import type { PortfolioType } from '@/shared/model/enums';

export type PlanType = 'BUY' | 'DEPOSIT';
export const PLAN_FREQUENCIES = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
export type PlanFrequency = typeof PLAN_FREQUENCIES[number];

export const PLAN_FREQUENCY_LABEL: Record<PlanFrequency, string> = {
  DAILY: 'Chaque jour', WEEKLY: 'Chaque semaine', BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Chaque mois', QUARTERLY: 'Chaque trimestre', YEARLY: 'Chaque année',
};
export const PLAN_TYPE_LABEL: Record<PlanType, string> = { BUY: 'Achat', DEPOSIT: 'Versement' };

export interface PlanResponse {
  id: string; portfolioId: string; portfolioName: string; portfolioType: PortfolioType;
  type: PlanType; symbol: string | null; name: string;
  /** Montant de chaque échéance en EUR, frais compris. */
  amount: number; fees: number;
  frequency: PlanFrequency; startDate: string; endDate: string | null;
  /** false : parts entières uniquement. */
  fractional: boolean; active: boolean;
  /** Échéances déjà traitées : au-delà de 0, actif/fréquence/début sont figés. */
  occurrences: number;
  /** null : plan terminé. */
  nextExecutionDate: string | null; lastExecutionDate: string | null;
  lastError: string | null; monthlyAmount: number;
}

/** Création comme modification (PUT complet). */
export interface PlanRequest {
  type: PlanType; symbol: string | null; amount: number; fees: number;
  frequency: PlanFrequency; startDate: string; endDate: string | null;
  fractional: boolean; active: boolean;
}
