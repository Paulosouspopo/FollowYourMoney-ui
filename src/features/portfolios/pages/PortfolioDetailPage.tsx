import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePortfolioDashboard } from "@/features/dashboard/api/dashboard.api";
import { QueryBoundary } from "@/shared/ui/QueryBoundary";
import { TopBar } from "@/app/layout/TopBar";
import { IncompletePricesBanner } from "@/features/dashboard/components/IncompletePricesBanner";
import { ValueHero } from "@/features/dashboard/components/ValueHero";
import { PORTFOLIO_TYPE_LABEL } from "@/shared/model/enums";
import { PeriodSelector } from "@/shared/components/data/PeriodSelector";
import { KpiGrid } from "@/shared/components/data/KpiGrid";
import { MoneyValue } from "@/shared/components/data/MoneyValue";
import { livretKpis, performanceKpis } from "@/shared/components/data/kpis";
import { formatRate } from "@/shared/lib/format";
import { PositionsList } from "@/features/positions/components/PositionsList";
import { AllocationDonut } from "@/features/dashboard/components/AllocationDonut";
import { Fab } from "@/shared/ui/Fab";
import { TransactionFormSheet } from "@/features/transactions/components/TransactionFormSheet";
import { RecentTransactions } from "@/features/transactions/components/RecentTransactions";
import { CashSection } from "@/features/cash/components/CashSection";
import { CashMovementFormSheet } from "@/features/cash/components/CashMovementFormSheet";
import { PlansSection } from "@/features/plans/components/PlansSection";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PortfolioMenu } from "@/features/portfolios/components/PortfolioMenu";
import { AddEntrySheet, type EntryKind } from "@/features/portfolios/components/AddEntrySheet";
import { PERIOD_SENTENCE, type DashboardPeriod } from "@/features/dashboard/model/dashboard.types";
import { PerformanceCard } from "@/features/performance/components/PerformanceCard";
import { TOURS } from '@/features/guide/tours';
import { usePageTour } from '@/shared/tour/usePageTour';
import { TourButton } from '@/shared/tour/TourButton';

type Sheet = EntryKind | 'choose' | null;

/**
 * Trois formes selon le portefeuille :
 * - livret : solde, intérêts, mouvements d'argent (pas d'actifs) ;
 * - compte avec suivi des liquidités : positions + liquidités, deux types de saisie ;
 * - compte sans suivi : positions et opérations uniquement.
 * Grand écran : valeur, performance et positions à gauche ; argent, plans et répartition à droite.
 */
export default function PortfolioDetailPage() {
  const { portfolioId = '' } = useParams();
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [sheet, setSheet] = useState<Sheet>(null);
  const q = usePortfolioDashboard(portfolioId, period);
  const p = q.data?.portfolios[0]; // getPortfolioDashboard renvoie 1 seul portefeuille
  const isLivret = p?.type === 'LIVRET';
  const heldQuantities = Object.fromEntries((p?.positions ?? []).map(pos => [pos.symbol, pos.quantity]));

  usePageTour(TOURS.portfolio, q.isSuccess && sheet === null);

  const onFab = () => setSheet(isLivret ? 'cash' : p?.cashTracking ? 'choose' : 'transaction');

  return (
    <div>
      <TopBar back title={p?.name ?? 'Portefeuille'} right={<><TourButton tour={TOURS.portfolio} /><PortfolioMenu portfolioId={portfolioId} /></>} />
      <QueryBoundary query={q} skeleton={<DashboardSkeleton />}>
        {d => {
          const pf = d.portfolios[0];
          const livret = pf.type === 'LIVRET';
          const label = livret && pf.annualInterestRate != null
            ? `Livret · ${formatRate(pf.annualInterestRate)}`
            : PORTFOLIO_TYPE_LABEL[pf.type];
          return (
            <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
              <div className="space-y-6 lg:col-span-8 min-w-0">
                {pf.hasIncompletePrices && <IncompletePricesBanner />}
                <ValueHero label={label} valueEur={pf.currentValueEur} curve={d.curve} curveCurrency={d.curveCurrency}
                  periodLabel={PERIOD_SENTENCE[period]}
                  aside={livret
                    ? <><MoneyValue value={pf.interestEur} signed colored className="font-medium" /> d'intérêts</>
                    : <>Investi <MoneyValue value={pf.investedEur} className="text-foreground font-medium" /></>}
                  controls={<PeriodSelector value={period} onChange={setPeriod} />} />
                <KpiGrid items={livret ? livretKpis(pf) : performanceKpis(pf)} />
                {d.curve.length > 0 && <PerformanceCard portfolioId={portfolioId} />}
                {!livret && <PositionsList portfolioId={portfolioId} positions={pf.positions} />}
              </div>
              <aside className="space-y-6 lg:col-span-4 min-w-0">
                {(livret || pf.cashTracking) && <CashSection portfolioId={portfolioId} balance={pf.cashEur} isLivret={livret} />}
                <PlansSection portfolioId={portfolioId} portfolioType={pf.type} cashTracking={livret || pf.cashTracking} />
                {!livret && <AllocationDonut slices={d.allocation} />}
                {!livret && <RecentTransactions portfolioId={portfolioId} heldQuantities={heldQuantities} />}
              </aside>
            </div>
          );
        }}
      </QueryBoundary>

      <Fab onClick={onFab} label={isLivret ? 'Ajouter un mouvement' : 'Ajouter'} />
      <AddEntrySheet open={sheet === 'choose'} onClose={() => setSheet(null)} onChoose={setSheet} />
      <TransactionFormSheet portfolioId={portfolioId} open={sheet === 'transaction'} onClose={() => setSheet(null)}
        heldQuantities={heldQuantities} />
      <CashMovementFormSheet portfolioId={portfolioId} open={sheet === 'cash'} onClose={() => setSheet(null)}
        balance={p?.cashEur} noOverdraft={isLivret} />
    </div>
  );
}
