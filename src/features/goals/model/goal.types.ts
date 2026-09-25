/** Objectif et où il en est (montants EUR). */
export interface Goal {
  id: string; name: string; targetAmount: number;
  /** Échéance (YYYY-MM-DD), facultative. */
  targetDate: string | null;
  /** null = tout le patrimoine. */
  portfolioId: string | null; portfolioName: string | null;
  currentValueEur: number;
  /** Investissements programmés actifs du périmètre, par mois. */
  monthlyContributionEur: number;
  progressPct: number;
}

export interface GoalRequest { name: string; targetAmount: number; targetDate: string | null; portfolioId: string | null; }
