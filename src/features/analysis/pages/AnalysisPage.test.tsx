import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AnalysisPage from './AnalysisPage';
import type { ContributionReport, Exposure } from '../model/analysis.types';

const exposure: Exposure = {
  totalEur: 20000, equityEur: 16000, countryKnownPct: 100, countryEstimatedPct: 80,
  classes: [{ key: 'ACTIONS', label: 'ACTIONS', valueEur: 16000, pct: 80 }, { key: 'FONDS_EUROS', label: 'FONDS_EUROS', valueEur: 4000, pct: 20 }],
  countries: [{ key: 'US', label: 'États-Unis', valueEur: 11520, pct: 72 }, { key: 'FR', label: 'France', valueEur: 2000, pct: 12.5 }],
  sectors: [{ key: 'technology', label: 'technology', valueEur: 4800, pct: 30 }],
  currencies: [{ key: 'USD', label: 'USD', valueEur: 11520, pct: 57.6 }],
  topExposures: [{ name: 'Apple Inc', symbol: 'AAPL', valueEur: 900, pct: 4.5, viaFunds: true }],
  largestLineName: 'Amundi MSCI World', largestLinePct: 70,
  fees: {
    brokerFeesPaidEur: 42, fundsValueEur: 14000, annualFundFeesEur: 53.2, weightedTerPct: 0.38, unknownValueEur: 1000,
    twentyYearCostEur: 1900,
    lines: [
      { symbol: 'CW8.PA', name: 'Amundi MSCI World', valueEur: 14000, terPct: 0.38, userProvided: false, annualCostEur: 53.2 },
      { symbol: 'ESE.PA', name: 'BNP S&P 500', valueEur: 1000, terPct: null, userProvided: false, annualCostEur: null },
    ],
  },
};
const contributions: ContributionReport = {
  period: '1y', from: '2025-09-26', to: '2026-09-25', gainEur: 1500, endValueEur: 16000,
  lines: [
    { assetId: 'a', portfolioId: 'p', portfolioName: 'PEA', symbol: 'CW8.PA', name: 'Amundi MSCI World', assetType: 'ETF',
      startValueEur: 12000, endValueEur: 14000, flowsEur: 500, gainEur: 1500, returnPct: 12, weightPct: 87, dataSuspect: false },
  ],
};
const setFee = vi.fn();

vi.mock('../api/analysis.api', () => ({
  useExposure: () => ({ isPending: false, isError: false, isSuccess: true, data: exposure }),
  useContributions: () => ({ data: contributions }),
  useSetFundFee: () => ({ mutate: setFee, isPending: false }),
}));
vi.mock('@/features/performance/api/performance.api', () => ({ usePerformance: () => ({ data: undefined }) }));
vi.mock('@/features/dashboard/api/dashboard.api', () => ({ useDashboard: () => ({ data: { portfolios: [] } }) }));

describe('AnalysisPage', () => {
  it('résume en une phrase, détaille les pays, la concentration et les frais', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AnalysisPage /></MemoryRouter>);
    expect(screen.getByText(/en actions/)).toHaveTextContent('80 % en actions, dont 72 % aux États-Unis et 30 % dans la tech.');
    expect(screen.getByText('États-Unis')).toBeInTheDocument();
    expect(screen.getByText(/pèse/)).toHaveTextContent('70 %');
    expect(screen.getByText('via tes fonds')).toBeInTheDocument();
    expect(screen.getByText('inconnus')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Secteurs' }));
    expect(screen.getByText('Technologie')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Renseigner les frais de BNP S&P 500' }));
    await user.type(screen.getByLabelText('Frais annuels de BNP S&P 500 (%)'), '0,15');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(setFee.mock.calls[0][0]).toEqual({ symbol: 'ESE.PA', annualFeePct: 0.15 });
  });
});
