import type { PortfolioType } from '@/shared/model/enums';
import type { AssetResponse } from '@/features/assets/model/asset.types';

export interface PortfolioResponse {
  id: string; name: string; description: string | null; type: PortfolioType;
  userId: string; createdAt: string; updatedAt: string;
}
export interface PortfolioDetailResponse extends PortfolioResponse { assets: AssetResponse[]; }
export interface PortfolioCreateRequest { name: string; description?: string; type: PortfolioType; }
export type PortfolioUpdateRequest = PortfolioCreateRequest; // même shape côté back (PUT complet)