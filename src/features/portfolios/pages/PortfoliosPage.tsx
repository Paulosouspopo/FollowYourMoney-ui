import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { useDashboard } from '@/features/dashboard/api/dashboard.api';
import { PortfolioCard } from '@/features/dashboard/components/PortfolioCard';
import { PortfolioFormSheet } from '../components/PortfolioFormSheet';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { EmptyState } from '@/shared/ui/EmptyState'; 

export default function PortfoliosPage() {
  // Même clé de cache que la page Accueil (période par défaut) : pas de requête en plus
  const q = useDashboard('30d');
  const [sheet, setSheet] = useState<'create' | null>(null);
  return (
    <div className="space-y-4 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Portefeuilles</h1>
        <Button size="sm" onClick={() => setSheet('create')}><Plus size={16} /> Nouveau</Button>
      </header>
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={3} />}>
        {d => d.portfolios.length
          ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {d.portfolios.map(p => (
                <PortfolioCard key={p.portfolioId} valuation={p} trend={d.trends?.find(t => t.portfolioId === p.portfolioId)} />
              ))}
            </div>
          : <EmptyState title="Aucun portefeuille" description="Crée un PEA, un CTO, un wallet crypto…" />}
      </QueryBoundary>
      <PortfolioFormSheet open={sheet === 'create'} onClose={() => setSheet(null)} />
    </div>
  );
}