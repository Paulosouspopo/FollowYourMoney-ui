export const ASSET_TYPES = ['ACTION', 'ETF', 'CRYPTO', 'LIVRET', 'IMMOBILIER', 'AUTRE'] as const;
export type AssetType = typeof ASSET_TYPES[number];

export const PORTFOLIO_TYPES = ['PEA', 'CTO', 'CRYPTO', 'LIVRET', 'IMMOBILIER', 'AUTRE'] as const;
export type PortfolioType = typeof PORTFOLIO_TYPES[number];

export const TRANSACTION_TYPES = ['BUY', 'SELL', 'DIVIDEND'] as const;
export type TransactionType = typeof TRANSACTION_TYPES[number];

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  ACTION: 'Action', ETF: 'ETF', CRYPTO: 'Crypto', LIVRET: 'Livret', IMMOBILIER: 'Immobilier', AUTRE: 'Autre',
};
export const PORTFOLIO_TYPE_LABEL: Record<PortfolioType, string> = {
  PEA: 'PEA', CTO: 'Compte-titres', CRYPTO: 'Crypto', LIVRET: 'Livret', IMMOBILIER: 'Immobilier', AUTRE: 'Autre',
};
export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  BUY: 'Achat', SELL: 'Vente', DIVIDEND: 'Dividende',
};

/** Couleur stable par type → utilisée par le donut, les badges, les icônes. Une seule source. */
export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
  ACTION: '#6366F1', ETF: '#10B981', CRYPTO: '#F59E0B', LIVRET: '#06B6D4', IMMOBILIER: '#EC4899', AUTRE: '#8B5CF6',
};
/** Catégories de la répartition : types d'actifs + liquidités des comptes suivis (LIVRET = solde des livrets). */
export type AllocationCategory = AssetType | 'LIQUIDITES';
export const ALLOCATION_LABEL: Record<AllocationCategory, string> = { ...ASSET_TYPE_LABEL, LIVRET: 'Livrets', LIQUIDITES: 'Liquidités' };
export const ALLOCATION_COLOR: Record<AllocationCategory, string> = { ...ASSET_TYPE_COLOR, LIQUIDITES: '#94A3B8' };

export const CASH_MOVEMENT_TYPES = ['DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'FEE'] as const;
export type CashMovementType = typeof CASH_MOVEMENT_TYPES[number];
export const CASH_MOVEMENT_LABEL: Record<CashMovementType, string> = {
  DEPOSIT: 'Versement', WITHDRAWAL: 'Retrait', INTEREST: 'Intérêts', FEE: 'Frais',
};
/** Sens du flux sur le solde. */
export const CASH_MOVEMENT_SIGN: Record<CashMovementType, 1 | -1> = { DEPOSIT: 1, WITHDRAWAL: -1, INTEREST: 1, FEE: -1 };
