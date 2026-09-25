import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import IncomePage from './IncomePage';
import type { IncomeResponse } from '../model/income.types';

const data: IncomeResponse = {
  annualProjectedEur: 600, monthlyProjectedEur: 50, receivedLast12mEur: 480, receivedThisYearEur: 320, yieldOnCostPct: 4.2,
  positions: [
    { portfolioId: 'p1', portfolioName: 'PEA', symbol: 'TTE.PA', name: 'TotalEnergies', quantity: 100, perShare: 3.4,
      currency: 'EUR', annualEur: 340, yieldOnCostPct: 5.6, currentYieldPct: 5.1, paymentsPerYear: 4,
      lastExDate: '2026-06-30', kind: 'DIVIDEND' },
    { portfolioId: 'p2', portfolioName: 'Livret A', symbol: null, name: 'Livret A', quantity: null, perShare: null,
      currency: 'EUR', annualEur: 260, yieldOnCostPct: 2.4, currentYieldPct: 2.4, paymentsPerYear: 1, lastExDate: null,
      kind: 'INTEREST' },
  ],
  received: Array.from({ length: 24 }, (_, i) => ({ month: `2024-${String((i % 12) + 1).padStart(2, '0')}`, dividendsEur: i, interestEur: 0 })),
  upcoming: [{ date: '2026-10-01', symbol: 'TTE.PA', name: 'TotalEnergies', amountEur: 85, kind: 'DIVIDEND', estimated: true }],
};

vi.mock('../api/income.api', () => ({ useIncome: () => ({ isPending: false, isError: false, data }) }));

describe('IncomePage', () => {
  it('revenu mensuel attendu, détail par ligne (fréquence, par action) et prochains versements', () => {
    render(<MemoryRouter><IncomePage /></MemoryRouter>);

    expect(screen.getByText(/50,00/)).toHaveTextContent('/ mois');
    expect(screen.getByText(/Trimestriel/)).toHaveTextContent('PEA · Trimestriel · 3,40 € / action');
    expect(screen.getByText(/versé au 31 décembre/)).toBeInTheDocument();
    expect(screen.getByText('octobre 2026')).toBeInTheDocument();
    expect(screen.getAllByText('TotalEnergies')).toHaveLength(2); // ligne + calendrier
  });
});
