export type TrashKind = 'TRANSACTION' | 'CASH_MOVEMENT' | 'PORTFOLIO';

/** Élément supprimé, restaurable jusqu'à `expiresAt`. */
export interface TrashItem {
  id: string; kind: TrashKind; portfolioId: string | null;
  /** Portefeuille d'origine (opération, mouvement) ; null s'il n'existe plus. */
  portfolioName: string | null;
  label: string; deletedAt: string; expiresAt: string;
}
