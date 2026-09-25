import type { AssetType } from '@/shared/model/enums';

/** Part d'une répartition : `key` = code pays ISO, clé de secteur, devise ou classe. */
export interface Slice { key: string; label: string; valueEur: number; pct: number; }

export interface RealExposure { name: string; symbol: string | null; valueEur: number; pct: number; viaFunds: boolean; }

export interface FeeLine {
  symbol: string; name: string; valueEur: number;
  /** Frais courants annuels (TER) en %, null si inconnus. */
  terPct: number | null;
  /** Saisis par l'utilisateur (sinon Yahoo). */
  userProvided: boolean;
  annualCostEur: number | null;
}

export interface Fees {
  /** Frais de courtage et de tenue de compte déjà payés. */
  brokerFeesPaidEur: number;
  fundsValueEur: number;
  annualFundFeesEur: number;
  weightedTerPct: number | null;
  /** Montant placé dans des fonds aux frais inconnus. */
  unknownValueEur: number;
  /** Coût des frais connus sur 20 ans (rendement supposé 5 %/an). */
  twentyYearCostEur: number;
  lines: FeeLine[];
}

/** Radiographie : où est réellement investi l'argent (`/api/analysis/exposure`). */
export interface Exposure {
  totalEur: number;
  /** Partie actions : base des pays et des secteurs. */
  equityEur: number;
  countryKnownPct: number;
  /** Part des actions dont le pays est estimé d'après l'indice d'un ETF. */
  countryEstimatedPct: number;
  classes: Slice[]; countries: Slice[]; sectors: Slice[]; currencies: Slice[];
  topExposures: RealExposure[];
  largestLineName: string | null; largestLinePct: number;
  fees: Fees;
}

export interface ContributionLine {
  assetId: string; portfolioId: string; portfolioName: string; symbol: string; name: string; assetType: AssetType;
  startValueEur: number; endValueEur: number; flowsEur: number;
  /** Ce que la ligne a rapporté sur la période (plus-value, dividendes, frais déduits). */
  gainEur: number;
  returnPct: number | null;
  /** Poids dans la valeur actuelle. */
  weightPct: number;
}

export interface ContributionReport {
  period: string; from: string; to: string; gainEur: number; endValueEur: number; lines: ContributionLine[];
}
