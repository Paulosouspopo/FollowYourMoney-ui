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
import { livretKpis, performanceKpis } from "@/shared/components/data/kpis";
import { PositionsList } from "@/features/positions/components/PositionsList";
import { AllocationDonut } from "@/features/dashboard/components/AllocationDonut";
import { Fab } from "@/shared/ui/Fab";
import { TransactionFormSheet } from "@/features/transactions/components/TransactionFormSheet";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { CashSection } from "@/features/cash/components/CashSection";
import { CashMovementFormSheet } from "@/features/cash/components/CashMovementFormSheet";
import { LivretHero } from "@/features/cash/components/LivretHero";
import { PlansSection } from "@/features/plans/components/PlansSection";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PortfolioMenu } from "@/features/portfolios/components/PortfolioMenu";
import { AddEntrySheet, type EntryKind } from "@/features/portfolios/components/AddEntrySheet";
import type { DashboardPeriod } from "@/features/dashboard/model/dashboard.types";
import { PerformanceCard } from "@/features/performance/components/PerformanceCard";

type Sheet = EntryKind | 'choose' | null;

/**
 * Trois formes selon le portefeuille :
 * - livret : solde, intérêts, mouvements d'argent (pas d'actifs) ;
 * - compte avec suivi des liquidités : positions + liquidités, deux types de saisie ;
 * - compte sans suivi : positions et opérations uniquement.
 */
export default function PortfolioDetailPage() {
  const { portfolioId = '' } = useParams();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [sheet, setSheet] = useState<Sheet>(null);
  const q = usePortfolioDashboard(portfolioId, period);
  const p = q.data?.portfolios[0]; // getPortfolioDashboard renvoie 1 seul portefeuille
  const isLivret = p?.type === 'LIVRET';
  const heldQuantities = Object.fromEntries((p?.positions ?? []).map(pos => [pos.symbol, pos.quantity]));

  const onFab = () => setSheet(isLivret ? 'cash' : p?.cashTracking ? 'choose' : 'transaction');

  return (
    <div className="space-y-4">
      <TopBar back title={p?.name ?? 'Portefeuille'} right={<PortfolioMenu portfolioId={portfolioId} />} />
      <QueryBoundary query={q} skeleton={<DashboardSkeleton />}>
        {d => {
          const pf = d.portfolios[0];
          return pf.type === 'LIVRET' ? (
            <>
              <LivretHero portfolio={pf} />
              <div className="flex justify-end"><PeriodSelector value={period} onChange={setPeriod} /></div>
              <EvolutionChart points={d.curve} currency={d.curveCurrency} />
              <KpiGrid items={livretKpis(pf)} />
              <PlansSection portfolioId={portfolioId} portfolioType={pf.type} cashTracking />
              <CashSection portfolioId={portfolioId} balance={pf.cashEur} isLivret />
            </>
          ) : (
            <>
              {pf.hasIncompletePrices && <IncompletePricesBanner />}
              <NetWorthHero data={d} label={PORTFOLIO_TYPE_LABEL[pf.type]} />
              <div className="flex justify-end"><PeriodSelector value={period} onChange={setPeriod} /></div>
              <EvolutionChart points={d.curve} currency={d.curveCurrency} />
              <KpiGrid items={performanceKpis(pf)} />
              {d.curve.length > 0 && <PerformanceCard portfolioId={portfolioId} />}
              <PositionsList portfolioId={portfolioId} positions={pf.positions} />
              <PlansSection portfolioId={portfolioId} portfolioType={pf.type} cashTracking={pf.cashTracking} />
              {pf.cashTracking && <CashSection portfolioId={portfolioId} balance={pf.cashEur} />}
              <AllocationDonut slices={d.allocation} />
            </>
          );
        }}
      </QueryBoundary>
      {p && !isLivret && <RecentTransactions portfolioId={portfolioId} heldQuantities={heldQuantities} />}

      <Fab onClick={onFab} label={isLivret ? 'Ajouter un mouvement' : 'Ajouter'} />
      <AddEntrySheet open={sheet === 'choose'} onClose={() => setSheet(null)} onChoose={setSheet} />
      <TransactionFormSheet portfolioId={portfolioId} open={sheet === 'transaction'} onClose={() => setSheet(null)}
        heldQuantities={heldQuantities} />
      <CashMovementFormSheet portfolioId={portfolioId} open={sheet === 'cash'} onClose={() => setSheet(null)}
        balance={p?.cashEur} noOverdraft={isLivret} />
    </div>
  );
}
