/** Avertissement pendant une saisie (rien n'est bloqué). */
export interface DataWarning {
  code: 'PRICE_MISMATCH' | 'PEA_INELIGIBLE';
  message: string;
  /** Cours de clôture du jour, dans la devise saisie (PRICE_MISMATCH). */
  suggestedPrice: number | null;
  currency: string | null;
  marketDate: string | null;
}

/** Incohérence dans les données déjà saisies. */
export interface DataIssue {
  /** Clé stable, pour « c'est normal ». */
  key: string;
  code: 'PRICE_MISMATCH' | 'PEA_INELIGIBLE';
  portfolioId: string; portfolioName: string;
  transactionId: string | null;
  symbol: string; date: string | null;
  message: string;
  suggestedPrice: number | null; currency: string | null;
}
