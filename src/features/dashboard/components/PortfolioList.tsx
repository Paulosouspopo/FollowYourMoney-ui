import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatPercent, formatRate, gainTone } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { PORTFOLIO_TYPE_LABEL } from '@/shared/model/enums';
import type { PortfolioValuation } from '../model/dashboard.types';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { usePrefetchPortfolio } from '../api/dashboard.api';

/** Portefeuilles avec leur poids dans le patrimoine (barre), du plus gros au plus petit. */
export function PortfolioList({ portfolios }: { portfolios: PortfolioValuation[] }) {
  const prefetch = usePrefetchPortfolio();
  const total = portfolios.reduce((s, p) => s + Math.max(p.currentValueEur, 0), 0);
  const sorted = [...portfolios].sort((a, b) => b.currentValueEur - a.currentValueEur);
  return (
    <section data-tour="portfolios">
      <SectionHeader title="Portefeuilles" action={<Link to="/portfolios" className="text-xs font-medium text-primary">Tout voir</Link>} />
      <Card className="p-0 gap-0">
        <ul className="divide-y divide-border">
          {sorted.map(p => {
            const weight = total > 0 ? (Math.max(p.currentValueEur, 0) / total) * 100 : 0;
            const livret = p.type === 'LIVRET';
            return (
              <li key={p.portfolioId}>
                <Link to={`/portfolios/${p.portfolioId}`}
                  onPointerEnter={() => void prefetch(p.portfolioId)} onTouchStart={() => void prefetch(p.portfolioId)}
                  className="group flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      {p.hasIncompletePrices && <AlertTriangle size={12} className="text-warning shrink-0" aria-label="Cours incomplets" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {PORTFOLIO_TYPE_LABEL[p.type]}
                      {livret && p.annualInterestRate != null && ` · ${formatRate(p.annualInterestRate)}`}
                      {' · '}{formatPercent(weight)} du total
                    </p>
                    <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${weight}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <MoneyValue value={p.currentValueEur} className="block text-sm font-semibold" />
                    {!livret && (
                      <span className={cn('text-[11px] font-medium tabular-nums', gainTone(p.unrealizedGainPercentage))}
                        title="Plus-value latente (lignes détenues)">
                        {p.unrealizedGainPercentage >= 0 ? '+' : '−'}{formatPercent(Math.abs(p.unrealizedGainPercentage))}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </section>
  );
}
