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