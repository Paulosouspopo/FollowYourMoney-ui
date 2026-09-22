import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolioDashboard } from "@/features/dashboard/api/dashboard.api";
import { QueryBoundary } from "@/shared/ui/QueryBoundary";
import { TopBar } from "@/app/layout/TopBar";
import { IncompletePricesBanner } from "@/features/dashboard/components/IncompletePricesBanner";
import { NetWorthHero } from "@/features/dashboard/components/NetWorthHero";
import { PORTFOLIO_TYPE_LABEL } from "@/shared/model/enums";
import { PeriodSelector } from "@/shared/components/data/PeriodSelector";
import { EvolutionChart } from "@/features/dashboard/components/EvolutionChart";
import { KpiGrid } from "@/shared/components/data/KpiGrid";
import { performanceKpis } from "@/shared/components/data/KpiGrid";
import { PositionsList } from "@/features/positions/components/PositionsList";
import { AllocationDonut } from "@/features/dashboard/components/AllocationDonut";
import { Fab } from "@/shared/ui/Fab";
import { TransactionFormSheet } from "@/features/transactions/components/TransactionFormSheet";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PortfolioMenu } from "@/features/portfolios/components/PortfolioMenu";
import type { DashboardPeriod } from "@/features/dashboard/model/dashboard.types";

export default function PortfolioDetailPage() {
  const { portfolioId = '' } = useParams();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [txOpen, setTxOpen] = useState(false);
  const q = usePortfolioDashboard(portfolioId, period);

  return (
    <div className="space-y-4">
      <TopBar back title={q.data?.portfolios[0]?.name ?? 'Portefeuille'} right={<PortfolioMenu portfolioId={portfolioId} />} />
      <QueryBoundary query={q} skeleton={<DashboardSkeleton />}>
        {d => {
          const p = d.portfolios[0]; // getPortfolioDashboard renvoie 1 seul portefeuille
          return (
            <>
              {p.hasIncompletePrices && <IncompletePricesBanner />}
              <NetWorthHero data={d} label={PORTFOLIO_TYPE_LABEL[p.type]} />
              <div className="flex justify-end"><PeriodSelector value={period} onChange={setPeriod} /></div>
              <EvolutionChart points={d.curve} />
              <KpiGrid items={performanceKpis(p)} />
              <PositionsList portfolioId={portfolioId} positions={p.positions} />
              <AllocationDonut slices={d.allocation} />
            </>
          );
        }}
      </QueryBoundary>
      <Fab onClick={() => setTxOpen(true)} label="Ajouter une transaction" />
      <TransactionFormSheet portfolioId={portfolioId} open={txOpen} onClose={() => setTxOpen(false)} />
    </div>
  );
}