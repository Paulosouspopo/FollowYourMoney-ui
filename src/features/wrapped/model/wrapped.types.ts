export interface WrappedLine { name: string; symbol: string; portfolioId: string; gainEur: number; returnPct: number | null; }

/** Bilan d'une année (`/api/wrapped`). Pourcentages en « 12.3 » (= 12,3 %). */
export interface Wrapped {
  year: number;
  /** Années disponibles, de la plus récente à la plus ancienne. */
  years: number[];
  from: string; to: string;
  /** Année terminée (sinon : bilan à date). */
  complete: boolean;
  startValueEur: number; endValueEur: number; gainEur: number; netDepositsEur: number;
  twrPct: number;
  benchmarkName: string; benchmarkPct: number | null;
  /** Rendement de chaque mois, null si non couvert. */
  months: (number | null)[];
  /** 1 à 12. */
  bestMonth: number | null; worstMonth: number | null;
  bestLine: WrappedLine | null; worstLine: WrappedLine | null;
  dividendsEur: number; interestEur: number;
  operations: number; buys: number; sells: number; activeMonths: number;
  investedEur: number; feesEur: number; newAssets: number;
  personality: { key: string; title: string; text: string };
}

export const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
  'octobre', 'novembre', 'décembre'];
