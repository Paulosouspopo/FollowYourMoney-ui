import type { TransactionType } from '@/shared/model/enums';

export interface TransactionResponse {
  id: string; assetId: string; portfolioId: string; symbol: string; assetName: string;
  type: TransactionType; quantity: number; pricePerUnit: number; fees: number;
  totalAmount: number; currency: string;
  exchangeRateToEur: number; totalAmountEur: number; feesEur: number;
  transactionDate: string; notes: string | null; createdAt: string; updatedAt: string;
}
export interface TransactionHistoryResponse {
  assetId: string; symbol: string; assetName: string;
  totalQuantityHeld: number; averageCostPerUnitEur: number; totalInvestedEur: number;
  totalFeesEur: number; totalDividendsReceivedEur: number; realizedGainLossEur: number;
  transactions: TransactionResponse[]; page: number; size: number; totalElements: number; totalPages: number;
}
export interface TransactionCreateRequest {
  portfolioId: string; symbol: string; type: TransactionType;
  quantity: number; pricePerUnit: number; fees?: number; currency?: string;
  transactionDate?: string; notes?: string;
}
export type TransactionUpdateRequest = Omit<TransactionCreateRequest, 'portfolioId' | 'symbol'>;