import type { AssetType } from '@/shared/model/enums';

export interface AssetResponse {
  id: string; portfolioId: string; symbol: string; name: string;
  longName: string | null; exchangeName: string | null;
  assetType: AssetType; currency: string; createdAt: string; updatedAt: string;
}
export interface AssetCreateRequest { portfolioId: string; symbol: string; name: string; assetType: AssetType; currency?: string; }

/** Renvoyé par GET /assets/search (proxy Yahoo). Seuls les types supportés (ACTION, ETF, CRYPTO) remontent. */
export interface AssetSearchResult {
  symbol: string;           // symbole Yahoo canonique : "BTC-EUR", "AAPL", "TTE.PA"…
  name: string;             // "Bitcoin EUR", "Apple Inc.", "TotalEnergies SE"
  exchange: string | null;  // "Paris", "NASDAQ", "CCC"…
  assetType: AssetType;
}
