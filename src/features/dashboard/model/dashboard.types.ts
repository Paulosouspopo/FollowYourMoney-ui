import type { AssetType, PortfolioType } from '@/shared/model/enums';

export const DASHBOARD_PERIODS = ['7d', '30d', '90d', '1y', 'all'] as const;
export type DashboardPeriod = typeof DASHBOARD_PERIODS[number];
export const PERIOD_LABEL: Record<DashboardPeriod, string> = { '7d': '1S', '30d': '1M', '90d': '3M', '1y': '1A', all: 'Max' };

export interface PositionValuation {
  assetId: string; symbol: string; name: string; assetType: AssetType;
  quantity: number; averageCostEur: number; investedEur: number; currentValueEur: number;
  unrealizedGainEur: number; unrealizedGainPercentage: number;
  realizedGainEur: number; dividendsEur: number; totalFeesEur: number;
  lastPrice: number | null; priceCurrency: string | null; priceAsOf: string | null;
  priceMissing: boolean;
}

export interface PortfolioValuation {
  portfolioId: string; name: string; type: PortfolioType;
  currentValueEur: number; investedEur: number;
  unrealizedGainEur: number; unrealizedGainPercentage: number;
  realizedGainEur: number; dividendsEur: number; totalFeesEur: number;
  positions: PositionValuation[];
  openPositionCount: number;
  hasIncompletePrices: boolean;
}

export interface AllocationSliceDTO { assetType: AssetType; label: string; value: number; percentage: number; }

export interface CurvePointDTO {
  date: string; totalValueEur: number; totalInvestedEur: number; gainLossEur: number; gainLossPercentage: number;
}

export interface DashboardResponse {
  totalValueEur: number; totalInvestedEur: number;
  unrealizedGainEur: number; unrealizedGainPercentage: number;
  realizedGainEur: number; dividendsEur: number; totalFeesEur: number;
  hasIncompletePrices: boolean;
  portfolios: PortfolioValuation[];
  allocation: AllocationSliceDTO[];
  curve: CurvePointDTO[];
}