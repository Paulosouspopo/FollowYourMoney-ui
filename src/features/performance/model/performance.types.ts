import type { PortfolioType } from '@/shared/model/enums';

export const PERFORMANCE_PERIODS = ['1m', '3m', 'ytd', '1y', '3y', '5y', 'all'] as const;
export type PerformancePeriod = typeof PERFORMANCE_PERIODS[number];
export const PERFORMANCE_PERIOD_LABEL: Record<PerformancePeriod, string> = {
  '1m': '1M', '3m': '3M', ytd: 'YTD', '1y': '1A', '3y': '3A', '5y': '5A', all: 'Max',
};

/** Pourcentages en « 12.34 » (= 12,34 %), montants en EUR. */
export interface PerformanceResponse {
  period: PerformancePeriod; from: string; to: string;
  startValueEur: number; endValueEur: number; netFlowsEur: number; gainEur: number;
  /** Rendement des placements (TWR), cumulé sur la période. */
  twrPct: number;
  /** TWR annualisé : seulement si la période dépasse un an. */
  twrAnnualizedPct: number | null;
  /** Rendement de l'argent investi (pondéré par les montants), sur la période. */
  mwrPct: number;
  /** Le même annualisé (XIRR) : seulement si la période dépasse un an. */
  xirrPct: number | null;
  benchmark: { symbol: string; name: string; returnPct: number | null } | null;
  series: { date: string; valueEur: number; twrPct: number; benchmarkPct: number | null }[];
  /** Vue globale : détail par portefeuille sur la même période. */
  portfolios: PortfolioPerformance[];
  /** Volatilité, pire baisse, Sharpe… (null sous 20 jours ouvrés). */
  risk: RiskStats | null;
}

/** Indicateurs de risque sur la période, à partir de la performance (les versements n'y comptent pas). */
export interface RiskStats {
  volatilityPct: number;
  maxDrawdownPct: number; drawdownPeak: string | null; drawdownTrough: string | null;
  /** Seulement au-delà d'un an. */
  sharpe: number | null;
  bestDayPct: number; bestDay: string; worstDayPct: number; worstDay: string;
  positiveDaysPct: number;
}

export interface PortfolioPerformance {
  portfolioId: string; name: string; type: PortfolioType; valueEur: number;
  gainEur: number; twrPct: number; mwrPct: number; xirrPct: number | null;
}

/** Indice de comparaison (symbole Yahoo). */
export interface Benchmark { symbol: string; label: string; }

/** Indices courants proposés ; tout autre actif reste choisissable via la recherche. */
export const BENCHMARK_PRESETS: Benchmark[] = [
  { symbol: 'CW8.PA', label: 'MSCI World' },
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^FCHI', label: 'CAC 40' },
  { symbol: '^STOXX50E', label: 'Euro Stoxx 50' },
  { symbol: '^NDX', label: 'Nasdaq-100' },
  { symbol: 'BTC-EUR', label: 'Bitcoin' },
];
