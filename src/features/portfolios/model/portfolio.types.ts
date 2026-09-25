import type { PortfolioType } from '@/shared/model/enums';
import type { AssetResponse } from '@/features/assets/model/asset.types';

export interface PortfolioResponse {
  id: string; name: string; description: string | null; type: PortfolioType;
  /** Solde de liquidités inclus dans la valeur (toujours vrai pour un livret). */
  cashTracking: boolean; annualInterestRate: number | null;
  /** Date d'ouverture du compte (YYYY-MM-DD) : départ des 5 ans d'un PEA. */
  openedAt: string | null;
  userId: string; createdAt: string; updatedAt: string;
}
export interface PortfolioDetailResponse extends PortfolioResponse { assets: AssetResponse[]; }
export interface PortfolioCreateRequest {
  name: string; description?: string; type: PortfolioType;
  cashTracking?: boolean; annualInterestRate?: number | null;
  openedAt?: string | null;
}
export type PortfolioUpdateRequest = PortfolioCreateRequest; // même shape côté back (PUT complet)