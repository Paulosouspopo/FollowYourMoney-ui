import type { TransactionType } from '@/shared/model/enums';

export interface TransactionResponse {
  id: string; assetId: string; portfolioId: string; symbol: string; assetName: string;
  type: TransactionType; quantity: number; pricePerUnit: number; fees: number;
  totalAmount: number; currency: string;
  exchangeRateToEur: number; totalAmountEur: number; feesEur: number;
  transactionDate: string; notes: string | null; createdAt: string; updatedAt: string;
}
/** portfolioId est dans l'URL, pas dans le body. */
export interface TransactionCreateRequest {
  symbol: string; type: TransactionType;
  quantity: number; pricePerUnit: number; fees?: number; currency: string;
  transactionDate?: string; notes?: string;
}
/** La devise n'est pas modifiable côté back (taux historique figé) : supprimer puis recréer. */
export type TransactionUpdateRequest = Omit<TransactionCreateRequest, 'symbol' | 'currency'>;
