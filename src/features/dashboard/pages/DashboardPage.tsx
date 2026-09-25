import { useState } from 'react';
import { useDashboard } from '../api/dashboard.api';
import { PERIOD_SENTENCE, type DashboardPeriod } from '../model/dashboard.types';
import { PeriodSelector } from '@/shared/components/data/PeriodSelector';
import { ValueHero } from '../components/ValueHero';
import { StatStrip } from '../components/StatStrip';
import { AllocationDonut } from '../components/AllocationDonut';
import { PortfolioList } from '../components/PortfolioList';
import { IncompletePricesBanner } from '../components/IncompletePricesBanner';
import { Welcome } from '../components/Welcome';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { UpcomingPlansCard } from '@/features/plans/components/UpcomingPlansCard';
import { PerformanceCard } from '@/features/performance/components/PerformanceCard';
import { DataQualityBanner } from '@/features/quality/components/DataQualityBanner';
import { IncomeCard } from '@/features/income/components/IncomeCard';
import { GoalsCard } from '@/features/goals/components/GoalsCard';

/**
 * Accueil. Mobile : une colonne, l'essentiel en haut. Grand écran : le
 * patrimoine et sa performance à gauche, la composition à droite.
 */
export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const query = useDashboard(period);

  return (
    <QueryBoundary query={query} skeleton={<DashboardSkeleton />}>
      {d => d.portfolios.length === 0 ? <Welcome /> : (
        <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
          <div className="space-y-6 lg:col-span-8 min-w-0">
            {d.hasIncompletePrices && <IncompletePricesBanner />}
            <DataQualityBanner />
            <ValueHero label="Patrimoine" valueEur={d.totalValueEur} curve={d.curve} curveCurrency={d.curveCurrency}
              periodLabel={PERIOD_SENTENCE[period]}
              aside={<>Investi <MoneyValue value={d.totalInvestedEur} className="text-foreground font-medium" /></>}
              controls={<PeriodSelector value={period} onChange={setPeriod} />} />
            <StatStrip data={d} />
            <PerformanceCard portfolioId={null} />
          </div>
          <aside className="space-y-6 lg:col-span-4 min-w-0 lg:pt-4">
            <PortfolioList portfolios={d.portfolios} />
            <IncomeCard />
            <GoalsCard />
            <UpcomingPlansCard />
            <AllocationDonut slices={d.allocation} />
          </aside>
        </div>
      )}
    </QueryBoundary>
  );
}
