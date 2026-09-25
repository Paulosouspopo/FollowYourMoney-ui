import type { CashMovementType } from '@/shared/model/enums';

/** Montant en EUR, toujours positif : le type donne le sens du flux. */
export interface CashMovementResponse {
  id: string; portfolioId: string; type: CashMovementType; amount: number;
  movementDate: string; notes: string | null; createdAt: string; updatedAt: string;
}
/** Création comme modification (PUT complet). */
export interface CashMovementRequest {
  type: CashMovementType; amount: number; movementDate: string; notes?: string;
}
