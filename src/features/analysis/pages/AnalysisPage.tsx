import { useState } from 'react';
import { TopBar } from '@/app/layout/TopBar';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { FormSelect } from '@/shared/ui/form-select';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { Skeleton } from '@/shared/ui/skeleton';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { useDashboard } from '@/features/dashboard/api/dashboard.api';
import { usePerformance } from '@/features/performance/api/performance.api';
import {
  PERFORMANCE_PERIOD_LABEL, PERFORMANCE_PERIODS, type PerformancePeriod,
} from '@/features/performance/model/performance.types';
import { TOURS } from '@/features/guide/tours';
import { usePageTour } from '@/shared/tour/usePageTour';
import { TourButton } from '@/shared/tour/TourButton';
import { useContributions, useExposure } from '../api/analysis.api';
import type { Exposure } from '../model/analysis.types';
import { SECTOR_PHRASE, formatShare } from '../model/labels';
import { ExposureBreakdown } from '../components/ExposureBreakdown';
import { RealExposures } from '../components/RealExposures';
import { PositionsMap } from '../components/PositionsMap';
import { ContributionsCard } from '../components/ContributionsCard';
import { RiskCard } from '../components/RiskCard';
import { PerformanceCalendar } from '../components/PerformanceCalendar';
import { FeesCard } from '../components/FeesCard';

const PERIOD_SENTENCE: Record<PerformancePeriod, string> = {
  '1m': 'sur 1 mois', '3m': 'sur 3 mois', ytd: 'depuis janvier', '1y': 'sur 1 an', '3y': 'sur 3 ans', '5y': 'sur 5 ans',
  all: 'depuis le début',
};

/**
 * Radiographie : où est vraiment investi l'argent (pays, secteurs, devises,
 * fonds décomposés), ce qui a fait la performance, le risque, le calendrier
 * mensuel et les frais. Tout le patrimoine ou un portefeuille.
 */
export default function AnalysisPage() {
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [period, setPeriod] = useState<PerformancePeriod>('1y');
  const portfolios = useDashboard('30d').data?.portfolios ?? [];
  const exposure = useExposure(portfolioId);
  const contributions = useContributions(portfolioId, period);
  const performance = usePerformance(portfolioId, period, null);
  const history = usePerformance(portfolioId, 'all', null);
  usePageTour(TOURS.analysis, exposure.isSuccess);

  return (
    <div className="lg:max-w-6xl">
      <TopBar back title="Radiographie" right={<TourButton tour={TOURS.analysis} />} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <FormSelect className="w-60" value={portfolioId ?? 'all'} onChange={v => setPortfolioId(v === 'all' ? null : v)}
          options={[{ value: 'all', label: 'Tout le patrimoine' }, ...portfolios.map(p => ({ value: p.portfolioId, label: p.name }))]} />
      </div>

      <QueryBoundary query={exposure} skeleton={<AnalysisSkeleton />}>
        {e => (
          <div className="space-y-8">
            <Headline exposure={e} />
            <div className="space-y-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
              <div className="space-y-8 lg:col-span-7 min-w-0">
                <section>
                  <SectionHeader title="Où est ton argent" />
                  <ExposureBreakdown exposure={e} />
                </section>
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2" data-tour="analysis-period">
                    <h2 className="text-sm font-semibold tracking-tight">Qui a fait ta performance</h2>
                    <SegmentedControl<PerformancePeriod> value={period} onChange={setPeriod}
                      options={PERFORMANCE_PERIODS.map(p => ({ value: p, label: PERFORMANCE_PERIOD_LABEL[p] }))} />
                  </div>
                  {contributions.data && (
                    <>
                      <PositionsMap lines={contributions.data.lines} periodLabel={PERIOD_SENTENCE[period]} />
                      <ContributionsCard report={contributions.data} periodLabel={PERIOD_SENTENCE[period]} />
                    </>
                  )}
                </section>
              </div>
              <aside className="space-y-8 lg:col-span-5 min-w-0">
                <section>
                  <SectionHeader title="Concentration" />
                  <RealExposures exposure={e} />
                </section>
                <section>
                  <SectionHeader title="Risque" action={<span className="text-[11px] text-muted-foreground">{PERIOD_SENTENCE[period]}</span>} />
                  {performance.data ? <RiskCard risk={performance.data.risk} /> : <Skeleton className="h-40 w-full rounded-2xl" />}
                </section>
                <section>
                  <SectionHeader title="Ce que te coûtent tes placements" />
                  <FeesCard fees={e.fees} />
                </section>
              </aside>
            </div>
            {history.data && history.data.series.length > 31 && (
              <section>
                <SectionHeader title="Calendrier des performances" />
                <PerformanceCalendar series={history.data.series} />
              </section>
            )}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

/** La phrase qui résume tout : pays dominant, secteur dominant, frais. */
function Headline({ exposure: e }: { exposure: Exposure }) {
  const country = e.countries.find(c => c.key !== '??');
  const sector = e.sectors.find(s => s.key !== 'unknown');
  const equityPct = e.totalEur > 0 ? (e.equityEur / e.totalEur) * 100 : 0;
  return (
    <section className="glow -mx-4 px-4 md:mx-0 md:px-0 pt-1" data-tour="analysis-headline">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <MoneyValue value={e.totalEur} /> passés aux rayons X
      </p>
      <p className="mt-3 text-2xl md:text-3xl font-semibold leading-snug tracking-tight">
        <span className="text-primary">{formatShare(equityPct)}</span> en actions
        {country && <>, dont <span className="text-primary">{formatShare(country.pct)}</span> {countryPhrase(country.key, country.label)}</>}
        {sector && <> et <span className="text-primary">{formatShare(sector.pct)}</span> dans {SECTOR_PHRASE[sector.key] ?? sector.label.toLowerCase()}</>}.
      </p>
      {e.fees.annualFundFeesEur > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Tes fonds te coûtent <MoneyValue value={e.fees.annualFundFeesEur} className="font-medium text-foreground" /> par an, sans que tu le voies.
        </p>
      )}
    </section>
  );
}

/** « aux États-Unis », « au Japon », « en France »… */
const COUNTRY_PREPOSITION: Record<string, string> = { US: 'aux', NL: 'aux', JP: 'au', GB: 'au', CA: 'au', BR: 'au', MX: 'au' };
function countryPhrase(code: string, label: string) {
  if (code.startsWith('X')) return `: ${label.toLowerCase()}`;
  return `${COUNTRY_PREPOSITION[code] ?? 'en'} ${label}`;
}

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Analyse de tes lignes… La première fois, l'app récupère le profil de chaque actif : quelques secondes.</p>
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}
