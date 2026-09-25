export const ASSET_TYPES = ['ACTION', 'ETF', 'FONDS', 'CRYPTO', 'LIVRET', 'IMMOBILIER', 'AUTRE'] as const;
export type AssetType = typeof ASSET_TYPES[number];

export const PORTFOLIO_TYPES = [
  'PEA', 'CTO', 'ASSURANCE_VIE', 'PER', 'EPARGNE_SALARIALE', 'CRYPTO', 'LIVRET', 'IMMOBILIER', 'AUTRE',
] as const;
export type PortfolioType = typeof PORTFOLIO_TYPES[number];

export const TRANSACTION_TYPES = ['BUY', 'SELL', 'DIVIDEND'] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  ACTION: 'Action', ETF: 'ETF', FONDS: 'Fonds', CRYPTO: 'Crypto', LIVRET: 'Livret', IMMOBILIER: 'Immobilier', AUTRE: 'Autre',
};
export const PORTFOLIO_TYPE_LABEL: Record<PortfolioType, string> = {
  PEA: 'PEA', CTO: 'Compte-titres', ASSURANCE_VIE: 'Assurance-vie', PER: 'PER', EPARGNE_SALARIALE: 'Épargne salariale',
  CRYPTO: 'Crypto', LIVRET: 'Livret', IMMOBILIER: 'Immobilier', AUTRE: 'Autre',
};
export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  BUY: 'Achat', SELL: 'Vente', DIVIDEND: 'Dividende',
};

/** Couleur stable par type → utilisée par le donut, les badges, les icônes. Une seule source. */
export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
  ACTION: '#7C7FFF', ETF: '#2DD4A0', FONDS: '#FB923C', CRYPTO: '#F5B83D', LIVRET: '#38BDF8', IMMOBILIER: '#F472B6', AUTRE: '#A78BFA',
};
/**
 * Catégories de la répartition : types d'actifs + liquidités des comptes suivis
 * (LIVRET = solde des livrets, FONDS_EUROS = celui des assurances-vie et PER).
 */
export type AllocationCategory = AssetType | 'LIQUIDITES' | 'FONDS_EUROS';
export const ALLOCATION_LABEL: Record<AllocationCategory, string> = {
  ...ASSET_TYPE_LABEL, LIVRET: 'Livrets', LIQUIDITES: 'Liquidités', FONDS_EUROS: 'Fonds euros',
};
export const ALLOCATION_COLOR: Record<AllocationCategory, string> = { ...ASSET_TYPE_COLOR, LIQUIDITES: '#94A3B8', FONDS_EUROS: '#E879F9' };

export const CASH_MOVEMENT_TYPES = ['DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'FEE', 'ABONDEMENT', 'CONVERSION'] as const;
export type CashMovementType = typeof CASH_MOVEMENT_TYPES[number];
export const CASH_MOVEMENT_LABEL: Record<CashMovementType, string> = {
  DEPOSIT: 'Versement', WITHDRAWAL: 'Retrait', INTEREST: 'Intérêts', FEE: 'Frais', ABONDEMENT: 'Abondement', CONVERSION: 'Change',
};
/** Sens du flux sur le solde de sa devise (change : la devise d'origine diminue). */
export const CASH_MOVEMENT_SIGN: Record<CashMovementType, 1 | -1> = {
  DEPOSIT: 1, WITHDRAWAL: -1, INTEREST: 1, FEE: -1, ABONDEMENT: 1, CONVERSION: -1,
};
