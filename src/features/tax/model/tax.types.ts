/** Récapitulatif fiscal d'une année (montants EUR). Estimation, pas un conseil fiscal. */
export interface TaxReport {
  year: number;
  /** Années disponibles, de la plus récente à la plus ancienne. */
  years: number[];
  securities: {
    sales: TaxSale[];
    gainsEur: number; lossesEur: number; netEur: number;
    carriedLossesUsedEur: number; taxableGainEur: number; lossesCarryForwardEur: number;
    dividendsEur: number; estimatedTaxEur: number;
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
  reminders: string[];
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
