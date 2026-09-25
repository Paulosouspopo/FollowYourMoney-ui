import type { AssetType } from '@/shared/model/enums';
import type { AlertRule } from '@/features/notifications/model/notification.types';

/** Ligne de la liste « Marchés » (chiffres de la cotation horaire, lus en base). */
export interface WatchlistItem {
  id: string; symbol: string; name: string; assetType: AssetType | null;
  /** Dernier cours, devise de cotation. */
  price: number | null; currency: string | null; priceDate: string | null;
  /** Variation (%) vs clôture précédente. */
  dayChangePct: number | null;
  /** Clôtures des 30 derniers jours. */
  sparkline: number[];
  /** Quantité détenue, tous portefeuilles (0 = non détenu). */
  ownedQuantity: number;
  alertCount: number;
}

export interface MarketHolding {
  portfolioId: string; portfolioName: string; quantity: number;
  valueEur: number; investedEur: number; gainEur: number; gainPct: number;
}

/** Fiche d'un actif, détenu ou non. */
export interface MarketDetail {
  symbol: string; name: string; exchange: string | null; assetType: AssetType | null;
  price: number; currency: string; priceEur: number; asOf: string; marketDate: string;
  dayChangePct: number | null;
  /** Plus bas / plus haut des clôtures sur 1 an (devise de cotation). */
  low52w: number | null; high52w: number | null;
  /** null si l'actif n'est pas suivi. */
  watchlistId: string | null;
  holdings: MarketHolding[];
  alerts: AlertRule[];
}

export interface PricePoint { date: string; close: number; }

export type MarketRange = '1M' | '3M' | '6M' | '1Y' | '5Y';
export const MARKET_RANGES: { value: MarketRange; label: string }[] = [
  { value: '1M', label: '1M' }, { value: '3M', label: '3M' }, { value: '6M', label: '6M' },
  { value: '1Y', label: '1A' }, { value: '5Y', label: '5A' },
];

/** Chemin de la fiche : le symbole est encodé (« ^FCHI », « EURUSD=X »). */
export const marketPath = (symbol: string) => `/markets/${encodeURIComponent(symbol)}`;
