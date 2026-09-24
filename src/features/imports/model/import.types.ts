import type { AssetSearchResult } from '@/features/assets/model/asset.types';

export type ImportFormat = 'FORTUNEO' | 'TRADE_REPUBLIC' | 'BINANCE' | 'GENERIC';
export type ImportKind = 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'FEE';
export type RowStatus = 'READY' | 'DUPLICATE' | 'IGNORED' | 'ERROR';
export type Confidence = 'REMEMBERED' | 'CERTAIN' | 'TO_CONFIRM' | 'NOT_FOUND';

export interface ImportInspection {
  detectedFormat: ImportFormat | null;
  encoding: string; delimiter: string;
  headers: string[]; sampleRows: string[][]; rowCount: number;
  /** Valeurs distinctes des colonnes à faible variété (types d'opération...). */
  columnValues: Record<string, string[]>;
}

/** Association des colonnes d'un relevé inconnu (null = colonne absente). */
export interface GenericMapping {
  dateColumn: string | null; typeColumn: string | null;
  typeValues: Record<string, ImportKind>;
  assetColumn: string | null; quantityColumn: string | null; priceColumn: string | null;
  amountColumn: string | null; feesColumn: string | null; currencyColumn: string | null;
  defaultCurrency: string;
}

export interface PreviewOptions { portfolioId: string; format: ImportFormat | null; mapping: GenericMapping | null; }

/** Ligne de l'aperçu, renvoyée telle quelle (lignes cochées) à la validation. */
export interface ImportRow {
  id: number; lines: number[]; dateTime: string; kind: ImportKind | null;
  assetReference: string | null; assetLabel: string | null;
  quantity: number | null; unitPrice: number | null; fees: number | null; currency: string | null;
  amount: number | null; notes: string | null; externalRef: string | null;
  status: RowStatus; message: string | null;
  priceEstimated: boolean; valuationReference: string | null; valuationQuantity: number | null;
}

export interface AssetResolution {
  reference: string; label: string; isin: string | null;
  suggestion: AssetSearchResult | null; confidence: Confidence;
}

export interface ImportPreview {
  format: ImportFormat; formatLabel: string; cashTrackingEnabled: boolean;
  rows: ImportRow[]; assets: AssetResolution[];
}

export interface ImportCommitRequest {
  portfolioId: string; enableCashTracking: boolean;
  /** référence d'actif → symbole Yahoo choisi */
  assets: Record<string, string>;
  rows: ImportRow[];
}
export interface ImportCommitResult { transactions: number; cashMovements: number; skipped: number; }

export const isTradeKind = (k: ImportKind | null) => k === 'BUY' || k === 'SELL' || k === 'DIVIDEND';
