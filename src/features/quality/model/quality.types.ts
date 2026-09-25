/**
 * PRICE_MISMATCH : prix loin de la clôture (erreur de saisie ?) ;
 * SPLIT_SUSPECTED : écart énorme (×5 et plus), division d'actions ou zéro en trop ;
 * PEA_INELIGIBLE : actif probablement non éligible au PEA.
 */
export type DataCheckCode = 'PRICE_MISMATCH' | 'SPLIT_SUSPECTED' | 'PEA_INELIGIBLE';

/** Avertissement pendant une saisie (rien n'est bloqué). */
export interface DataWarning {
  code: DataCheckCode;
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
  code: DataCheckCode;
  portfolioId: string; portfolioName: string;
  transactionId: string | null;
  symbol: string; date: string | null;
  message: string;
  suggestedPrice: number | null; currency: string | null;
}
