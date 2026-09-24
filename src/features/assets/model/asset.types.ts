import type { AssetType } from '@/shared/model/enums';

export interface AssetResponse {
  id: string; portfolioId: string; symbol: string; name: string;
  longName: string | null; exchangeName: string | null;
  assetType: AssetType; currency: string; createdAt: string; updatedAt: string;
}
/** Renvoyé par GET /portfolios/{id}/transactions/available-assets */
export interface AvailableAssetResponse { symbol: string; name: string; type: AssetType; currency: string; }
export interface AssetCreateRequest { portfolioId: string; symbol: string; name: string; assetType: AssetType; currency?: string; }

export interface AssetSearchResult {
  symbol: string;           // "BTC-EUR", "AAPL", "TOTAL.PA", etc.
  name: string;             // "Bitcoin", "Apple Inc.", "TotalEnergies SE"
  type: 'EQUITY' | 'CRYPTO' | 'ETF' | 'FUND' | 'FOREX' | 'UNKNOWN';
  currency: string;         // "EUR", "USD", etc.
  exchange: string;         // "CCC" (crypto), "Paris", "NasdaqGS", etc.
  shortName?: string;       // "BTC", "AAPL" (optionnel, pour affichage)
}