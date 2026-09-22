import type { AssetType } from '@/shared/model/enums';

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
    ACTION: 'Action',
    ETF: 'ETF',
    CRYPTO: 'Crypto',
    LIVRET: 'Livret',
    IMMOBILIER: 'Immobilier',
    AUTRE: 'Autre',
    // adapte selon les valeurs réelles de ton enum AssetType backend
};

export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
    ACTION: '#3b82f6',
    ETF: '#8b5cf6',
    CRYPTO: '#f59e0b',
    LIVRET: '#10b981',
    IMMOBILIER: '#6b7280',
    AUTRE: '#f97316',
};