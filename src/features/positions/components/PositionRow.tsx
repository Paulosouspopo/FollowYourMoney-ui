import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { AssetIcon } from '@/shared/components/data/AssetIcon';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { GainLine } from '@/shared/components/data/GainLine';
import { formatQty } from '@/shared/lib/format';
import type { PositionValuation } from '@/features/dashboard/model/dashboard.types';

interface Props { portfolioId: string; position: PositionValuation; }

export function PositionRow({ portfolioId, position: p }: Props) {
  return (
    <Link to={`/portfolios/${portfolioId}/positions/${encodeURIComponent(p.symbol)}`}
          className="flex items-center gap-3 py-3 active:bg-card/60 -mx-2 px-2 rounded-xl">
      <AssetIcon symbol={p.symbol} type={p.assetType} />
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{p.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {formatQty(p.quantity)} × <MoneyValue value={p.averageCostEur} /> · {p.symbol}
        </p>
      </div>
      <div className="text-right shrink-0">
        {p.priceMissing
          ? <span className="inline-flex items-center gap-1 text-xs text-warning"><AlertTriangle size={12} /> Prix indispo.</span>
          : <>
              <MoneyValue value={p.currentValueEur} className="block font-medium" />
              <GainLine amount={p.unrealizedGainEur} pct={p.unrealizedGainPercentage} size="xs" />
            </>}
      </div>
      <ChevronRight size={16} className="text-muted-foreground shrink-0" />
    </Link>
  );
}