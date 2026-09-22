import type { AssetType } from '@/shared/model/enums';
import { ASSET_TYPE_COLOR, ASSET_TYPE_LABEL } from '@/features/assets/model/asset.presentation';
import { TypeBadge } from './TypeBadge';

export function AssetIcon({ symbol, type }: { symbol: string; type: AssetType }) {
  return (
    <div className="h-10 w-10 shrink-0 rounded-xl grid place-items-center text-xs font-bold text-white"
         style={{ background: ASSET_TYPE_COLOR[type] }}>
      {symbol.replace(/-.*$/, '').slice(0, 4)}
    </div>
  );
}
export function AssetTypeBadge({ type }: { type: AssetType }) {
  return <TypeBadge label={ASSET_TYPE_LABEL[type]} color={ASSET_TYPE_COLOR[type]} />;
}