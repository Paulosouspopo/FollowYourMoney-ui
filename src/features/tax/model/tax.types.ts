/** Récapitulatif fiscal d'une année (montants EUR). Estimation, pas un conseil fiscal. */
export interface TaxReport {
  year: number;
  /** Années disponibles, de la plus récente à la plus ancienne. */
  years: number[];
  securities: {
    sales: TaxSale[];
    gainsEur: number; lossesEur: number; netEur: number;
    carriedLossesUsedEur: number; taxableGainEur: number; lossesCarryForwardEur: number;
    dividendsEur: number;
    /** Crédit d'impôt estimé sur les dividendes d'actions étrangères (case 2AB), déduit de l'impôt estimé. */
    foreignTaxCreditEur: number;
    estimatedTaxEur: number;
    boxes: TaxBox[];
  };
  crypto: {
    sales: CryptoSale[];
    totalProceedsEur: number; netGainEur: number;
    /** Cessions de l'année ≤ 305 € : exonérées. */
    exempt: boolean;
    estimatedTaxEur: number;
    boxes: TaxBox[];
  };
  peas: PeaStatus[];
  /** Tranche marginale d'imposition (%) de l'utilisateur. */
  marginalTaxRate: number;
  /** Versements PER de l'année : déductibles (case 6NS). */
  retirementSavings: { depositsEur: number; estimatedSavingEur: number; boxes: TaxBox[] };
  lifeInsurances: LifeInsuranceStatus[];
  employeeSavings: EmployeeSavingsStatus[];
  reminders: string[];
}

/** Tranches marginales d'imposition (barème de l'impôt sur le revenu). */
export const TAX_BRACKETS = [0, 11, 30, 41, 45] as const;

export interface LifeInsuranceStatus {
  portfolioId: string; name: string;
  openedAt: string | null; openedAtEstimated: boolean;
  eightYearsDate: string | null; eightYearsReached: boolean;
  depositsEur: number; valueEur: number; gainEur: number;
  /** Rachats de l'année et leur part de gains estimée (prorata gain / valeur). */
  withdrawalsEur: number; withdrawalsGainEur: number;
}

export interface EmployeeSavingsStatus {
  portfolioId: string; name: string;
  depositsEur: number; employerContributionsEur: number; valueEur: number; gainEur: number;
  /** Prélèvements sociaux (17,2 %) sur le gain au déblocage. */
  socialChargesIfWithdrawnEur: number;
}

export interface TaxBox { code: string; label: string; amountEur: number; form: string; }

export interface TaxSale {
  date: string; symbol: string; name: string; quantity: number;
  proceedsEur: number; costEur: number; gainEur: number;
}

/** Cession de crypto-actifs (150 VH bis) : gain = prix de cession - part du prix d'acquisition. */
export interface CryptoSale {
  date: string; symbol: string; proceedsEur: number;
  /** Valeur globale du portefeuille crypto juste avant la cession. */
  portfolioValueEur: number;
  acquisitionShareEur: number; gainEur: number;
}

export interface PeaStatus {
  portfolioId: string; name: string;
  openedAt: string | null; openedAtEstimated: boolean;
  fiveYearsDate: string | null; fiveYearsReached: boolean;
  depositsEur: number; depositsEstimated: boolean; ceilingEur: number;
  valueEur: number;
  /** Prélèvements sociaux (17,2 %) sur le gain en cas de retrait total aujourd'hui. */
  socialChargesIfWithdrawnEur: number;
}
