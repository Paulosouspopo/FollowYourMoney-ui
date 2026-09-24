import { useState } from 'react';
import { useDashboard } from '../api/dashboard.api';
import type { DashboardPeriod } from '../model/dashboard.types';
import { PeriodSelector } from '@/shared/components/data/PeriodSelector';
import { NetWorthHero } from '../components/NetWorthHero';
import { EvolutionChart } from '@/features/dashboard/components/EvolutionChart';
import { AllocationDonut } from '@/features/dashboard/components/AllocationDonut';
import { PortfoliosStrip } from '../components/PortfoliosStrip';
import { PerformanceBreakdown } from '@/features/dashboard/components/PerformanceBreakdown';
import { IncompletePricesBanner } from '../components/IncompletePricesBanner';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { UpcomingPlansCard } from '@/features/plans/components/UpcomingPlansCard';

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const query = useDashboard(period);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between pt-2">
        <h1 className="text-lg font-semibold">Patrimoine</h1>
        <PeriodSelector value={period} onChange={setPeriod} />
      </header>

      <QueryBoundary query={query} skeleton={<DashboardSkeleton />}>
        {(d) => (
          <>
            {d.hasIncompletePrices && <IncompletePricesBanner />}
            <NetWorthHero data={d} />
            <EvolutionChart points={d.curve} />
            <PerformanceBreakdown data={d} />
            <PortfoliosStrip portfolios={d.portfolios} />
            <UpcomingPlansCard />
            <AllocationDonut slices={d.allocation} />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}