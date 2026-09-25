import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatPercent, gainTone } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { PORTFOLIO_TYPE_LABEL } from '@/shared/model/enums';
import type { PortfolioPerformance } from '../model/performance.types';

const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${formatPercent(Math.abs(v))}`;

/** Portefeuilles classés par performance (TWR) sur la même période : lequel travaille le mieux. */
export function PortfolioRanking({ portfolios }: { portfolios: PortfolioPerformance[] }) {
  const ranked = [...portfolios].sort((a, b) => b.twrPct - a.twrPct);
  return (
    <Card className="p-0 gap-0">
      <div className="flex justify-between px-4 pt-3 pb-2 text-[11px] text-muted-foreground border-b border-border">
        <span>Portefeuille</span><span>Performance · gain</span>
      </div>
      <ul className="divide-y divide-border">
        {ranked.map((p, i) => (
          <li key={p.portfolioId}>
            <Link to={`/portfolios/${p.portfolioId}`} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {PORTFOLIO_TYPE_LABEL[p.type]}{p.xirrPct != null && ` · argent ${signed(p.xirrPct)}/an`}
                </p>
              </div>
              <div className="text-right">
                <p className={cn('text-sm font-semibold tabular-nums', gainTone(p.twrPct))}>{signed(p.twrPct)}</p>
                <MoneyValue value={p.gainEur} signed colored className="text-[11px]" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
