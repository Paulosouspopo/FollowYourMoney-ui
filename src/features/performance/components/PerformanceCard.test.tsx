import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PerformanceCard } from './PerformanceCard';
import { useBenchmarkStore } from '../model/benchmark.store';
import type { PerformanceResponse } from '../model/performance.types';

const usePerformance = vi.fn();
vi.mock('../api/performance.api', () => ({ usePerformance: (...args: unknown[]) => usePerformance(...args) }));
vi.mock('@/features/assets/api/assetSearch.api', () => ({
  ASSET_SEARCH_MIN_LENGTH: 2,
  useAssetSearch: () => ({ data: [], isFetching: false }),
}));

const data: PerformanceResponse = {
  period: '1y', from: '2025-09-25', to: '2026-09-24',
  startValueEur: 10000, endValueEur: 16000, netFlowsEur: 5000, gainEur: 1000,
  twrPct: 8.5, twrAnnualizedPct: 8.5, mwrPct: 7.2, xirrPct: 7.9,
  benchmark: { symbol: 'CW8.PA', name: 'Amundi MSCI World', returnPct: 6.5 },
  series: [
    { date: '2025-09-25', valueEur: 10000, twrPct: 0, benchmarkPct: 0 },
    { date: '2026-09-24', valueEur: 16000, twrPct: 8.5, benchmarkPct: 6.5 },
  ],
  portfolios: [
    { portfolioId: 'a', name: 'PEA', type: 'PEA', valueEur: 12000, gainEur: 900, twrPct: 4, mwrPct: 4, xirrPct: 4 },
    { portfolioId: 'b', name: 'Crypto', type: 'CRYPTO', valueEur: 4000, gainEur: 100, twrPct: 20, mwrPct: 3, xirrPct: null },
  ],
};

describe('PerformanceCard', () => {
  beforeEach(() => {
    usePerformance.mockReset();
    usePerformance.mockReturnValue({ isPending: false, isError: false, isFetching: false, data });
    useBenchmarkStore.setState({ benchmark: { symbol: 'CW8.PA', label: 'MSCI World' } });
  });

  it('performance, rendement de ton argent, écart avec l\'indice et classement des portefeuilles', () => {
    render(<MemoryRouter><PerformanceCard portfolioId={null} /></MemoryRouter>);

    expect(screen.getAllByText(/\+8,50/)[0]).toBeInTheDocument();
    expect(screen.getByText(/\+7,90/)).toBeInTheDocument();
    expect(screen.getByText('par an (XIRR)')).toBeInTheDocument();
    // Libellé court choisi, pas le nom Yahoo complet
    expect(screen.getByText(/Devant MSCI World de 2,00/)).toBeInTheDocument();

    const rows = screen.getAllByRole('link');
    expect(rows[0]).toHaveTextContent('Crypto'); // +20 % : premier malgré la plus petite valeur
    expect(rows[1]).toHaveTextContent('PEA');
    expect(usePerformance).toHaveBeenCalledWith(null, '1y', 'CW8.PA');
  });

  it("change de période et d'indice", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><PerformanceCard portfolioId="a" /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: '3A' }));
    await user.click(screen.getByRole('radio', { name: 'CAC 40' }));
    expect(usePerformance).toHaveBeenLastCalledWith('a', '3y', '^FCHI');

    await user.click(screen.getByRole('radio', { name: 'Aucun' }));
    expect(usePerformance).toHaveBeenLastCalledWith('a', '3y', null);
    expect(screen.queryByRole('link')).not.toBeInTheDocument(); // pas de classement sur un portefeuille
  });
});
