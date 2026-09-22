import type { AssetType } from '@/shared/model/enums';

export interface AssetResponse {
  id: string; portfolioId: string; symbol: string; name: string;
  longName: string | null; exchangeName: string | null;
  assetType: AssetType; currency: string; createdAt: string; updatedAt: string;
}
/** Renvoyé par GET /portfolios/{id}/transactions/available-assets */
export interface AvailableAssetResponse { symbol: string; name: string; type: AssetType; currency: string; }
export interface AssetCreateRequest { portfolioId: string; symbol: string; name: string; assetType: AssetType; currency?: string; }