import { Link } from 'react-router-dom';
import { PortfolioCard } from '@/features/dashboard/components/PortfolioCard';
import type { PortfolioValuation } from '@/features/dashboard/model/dashboard.types';
import { EmptyState } from '@/shared/ui/EmptyState';

export function PortfoliosStrip({ portfolios }: { portfolios: PortfolioValuation[] }) {
  if (!portfolios.length) return <EmptyState title="Aucun portefeuille" action={<Link to="/portfolios" className="text-primary">Créer le premier</Link>} />;
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium">Portefeuilles</h2>
        <Link to="/portfolios" className="text-xs text-primary">Tout voir</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 snap-x scrollbar-none">
        {portfolios.map(p => <PortfolioCard key={p.portfolioId} valuation={p} className="min-w-[70%] snap-start" />)}
      </div>
    </section>
  );
}