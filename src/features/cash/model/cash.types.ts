import type { CashMovementType } from '@/shared/model/enums';

/**
 * Montant toujours positif (le type donne le sens), dans sa devise ;
 * `amountEur` au taux du jour du mouvement. Change (CONVERSION) : `amount` en
 * `currency` contre `counterAmount` en `counterCurrency`.
 */
export interface CashMovementResponse {
  id: string; portfolioId: string; type: CashMovementType; amount: number;
  currency: string; amountEur: number; counterAmount: number | null; counterCurrency: string | null;
  movementDate: string; notes: string | null; createdAt: string; updatedAt: string;
}
/** Création comme modification (PUT complet). Devise absente = EUR. */
export interface CashMovementRequest {
  type: CashMovementType; amount: number; movementDate: string; notes?: string;
  currency?: string; counterAmount?: number; counterCurrency?: string;
}

/** Intérêts estimés d'une année (livret : quinzaines, fonds euros : prorata journalier). */
export interface InterestEstimate {
  year: number; rate: number | null; method: 'QUINZAINE' | 'DAILY';
  /** Jusqu'à aujourd'hui pour l'année en cours. */
  estimatedEur: number;
  /** Année terminée : montant à créditer au 31/12. */
  fullYear: boolean;
  creditedEur: number;
}

/** Valeurs de départ d'un nouveau mouvement (ex. intérêts estimés à créditer). */
export interface CashMovementPrefill {
  type: CashMovementType; amount: number; movementDate: string; notes?: string;
}
