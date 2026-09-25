import type { AssetType } from '@/shared/model/enums';

export interface AssetResponse {
  id: string; portfolioId: string; symbol: string; name: string;
  longName: string | null; exchangeName: string | null;
  assetType: AssetType; currency: string;
  /** Actif non coté : valeurs saisies par l'utilisateur (symbole interne, jamais affiché). */
  manual: boolean;
  createdAt: string; updatedAt: string;
}
/** Actif non coté : le symbole est attribué par le serveur. */
export interface ManualAssetRequest { name: string; assetType: AssetType; currency?: string; }
/** Valeur d'une part saisie à une date (valeur liquidative d'un relevé). */
export interface Valuation { date: string; price: number; currency: string; }
export interface AssetCreateRequest { portfolioId: string; symbol: string; name: string; assetType: AssetType; currency?: string; }

/** Renvoyé par GET /assets/search (proxy Yahoo). Seuls les types supportés (ACTION, ETF, FONDS, CRYPTO) remontent. */
export interface AssetSearchResult {
  symbol: string;           // symbole Yahoo canonique : "BTC-EUR", "AAPL", "TTE.PA"…
  name: string;             // "Bitcoin EUR", "Apple Inc.", "TotalEnergies SE"
  exchange: string | null;  // "Paris", "NASDAQ", "CCC"…
  assetType: AssetType;
}
