import type { AllocationCategory, AssetType, PortfolioType } from '@/shared/model/enums';

export const DASHBOARD_PERIODS = ['7d', '30d', '90d', '1y', 'all'] as const;
export type DashboardPeriod = typeof DASHBOARD_PERIODS[number];
export const PERIOD_LABEL: Record<DashboardPeriod, string> = { '7d': '1S', '30d': '1M', '90d': '3M', '1y': '1A', all: 'Max' };
/** Pour une phrase : « +120 € sur 1 mois ». */
export const PERIOD_SENTENCE: Record<DashboardPeriod, string> = {
  '7d': 'sur 7 jours', '30d': 'sur 1 mois', '90d': 'sur 3 mois', '1y': 'sur 1 an', all: 'depuis le début',
};

export interface PositionValuation {
  assetId: string; symbol: string; name: string; assetType: AssetType;
  quantity: number; averageCostEur: number; investedEur: number; currentValueEur: number;
  unrealizedGainEur: number; unrealizedGainPercentage: number;
  realizedGainEur: number; dividendsEur: number; totalFeesEur: number;
  lastPrice: number | null; priceCurrency: string | null; priceAsOf: string | null;
  priceMissing: boolean;
}

/**
 * Avec le suivi des liquidités : valeur = positions + liquidités, investi =
 * prix de revient + liquidités ; le % latent est sur le seul prix de revient.
 */
export interface PortfolioValuation {
  portfolioId: string; name: string; type: PortfolioType;
  currentValueEur: number; investedEur: number;
  unrealizedGainEur: number; unrealizedGainPercentage: number;
  realizedGainEur: number; dividendsEur: number; interestEur: number; totalFeesEur: number;
  cashTracking: boolean; cashEur: number; netDepositsEur: number; annualInterestRate: number | null;
  positions: PositionValuation[];
  openPositionCount: number;
  hasIncompletePrices: boolean;
}

export interface AllocationSliceDTO { category: AllocationCategory; value: number; percentage: number; }

export interface CurvePointDTO {
  date: string; totalValueEur: number; totalInvestedEur: number; gainLossEur: number; gainLossPercentage: number;
}

export interface DashboardResponse {
  totalValueEur: number; totalInvestedEur: number;
  unrealizedGainEur: number; unrealizedGainPercentage: number;
  realizedGainEur: number; dividendsEur: number; totalFeesEur: number;
  interestEur: number; cashEur: number; netDepositsEur: number;
  hasIncompletePrices: boolean;
  portfolios: PortfolioValuation[];
  allocation: AllocationSliceDTO[];
  /** Montants de `curve` dans cette devise (taux historique de chaque jour), EUR par défaut. */
  curve: CurvePointDTO[];
  curveCurrency?: string;
}