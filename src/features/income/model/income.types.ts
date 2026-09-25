/** Montants en EUR, pourcentages en « 3.45 » (= 3,45 %). */
export interface IncomeResponse {
  annualProjectedEur: number;
  monthlyProjectedEur: number;
  receivedLast12mEur: number;
  receivedThisYearEur: number;
  /** Revenu annuel projeté / prix de revient des lignes qui versent. */
  yieldOnCostPct: number | null;
  positions: PositionIncome[];
  /** Reçu par mois, 24 mois, du plus ancien au plus récent. */
  received: { month: string; dividendsEur: number; interestEur: number }[];
  /** Prochains versements estimés (12 mois). */
  upcoming: { date: string; symbol: string | null; name: string; amountEur: number; kind: IncomeKind; estimated: boolean }[];
}

export type IncomeKind = 'DIVIDEND' | 'INTEREST';

export interface PositionIncome {
  portfolioId: string; portfolioName: string; symbol: string | null; name: string;
  quantity: number | null;
  /** Dividendes des 12 derniers mois par action, devise de cotation. */
  perShare: number | null; currency: string;
  annualEur: number;
  yieldOnCostPct: number | null; currentYieldPct: number | null;
  /** Versements sur 12 mois (4 = trimestriel). */
  paymentsPerYear: number;
  lastExDate: string | null;
  kind: IncomeKind;
}

export const FREQUENCY_LABEL = (n: number) =>
  n >= 12 ? 'Mensuel' : n >= 4 ? 'Trimestriel' : n >= 2 ? 'Semestriel' : 'Annuel';
