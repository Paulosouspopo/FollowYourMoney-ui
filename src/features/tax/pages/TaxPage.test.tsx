import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import TaxPage from './TaxPage';
import { salesCsv } from '../model/taxCsv';
import { fiveYearsProgress } from '../model/pea';
import type { TaxReport } from '../model/tax.types';

const report: TaxReport = {
  year: 2025, years: [2026, 2025],
  securities: {
    sales: [{ date: '2025-06-01', symbol: 'AI.PA', name: 'Air Liquide', quantity: 4, proceedsEur: 800, costEur: 600, gainEur: 200 }],
    gainsEur: 200, lossesEur: 0, netEur: 200, carriedLossesUsedEur: 0, taxableGainEur: 200, lossesCarryForwardEur: 0,
    dividendsEur: 30, foreignTaxCreditEur: 0, estimatedTaxEur: 69,
    boxes: [{ code: '3VG', label: 'Plus-value nette imposable', amountEur: 200, form: '2042 / 2074' },
      { code: '2DC', label: 'Dividendes (montant brut)', amountEur: 30, form: '2042' }],
  },
  crypto: {
    sales: [{ date: '2025-09-01', symbol: 'BTC-EUR', proceedsEur: 500, portfolioValueEur: 1000, acquisitionShareEur: 250, gainEur: 250 }],
    totalProceedsEur: 500, netGainEur: 250, exempt: false, estimatedTaxEur: 75,
    boxes: [{ code: '3AN', label: 'Plus-value sur actifs numériques', amountEur: 250, form: '2042 / 2086' }],
  },
  peas: [{ portfolioId: 'p1', name: 'PEA', openedAt: '2019-01-15', openedAtEstimated: false, fiveYearsDate: '2024-01-15',
    fiveYearsReached: true, depositsEur: 30000, depositsEstimated: false, ceilingEur: 150000, valueEur: 42000,
    socialChargesIfWithdrawnEur: 2064 }],
  marginalTaxRate: 30,
  retirementSavings: { depositsEur: 2000, estimatedSavingEur: 600,
    boxes: [{ code: '6NS', label: 'Versements sur un PER (déductibles)', amountEur: 2000, form: '2042' }] },
  lifeInsurances: [{ portfolioId: 'av1', name: 'Linxea Spirit', openedAt: '2016-03-01', openedAtEstimated: false,
    eightYearsDate: '2024-03-01', eightYearsReached: true, depositsEur: 20000, valueEur: 26000, gainEur: 6000,
    withdrawalsEur: 2600, withdrawalsGainEur: 600 }],
  employeeSavings: [{ portfolioId: 'es1', name: 'PEE Amundi', depositsEur: 3000, employerContributionsEur: 1000,
    valueEur: 3500, gainEur: 500, socialChargesIfWithdrawnEur: 86 }],
  reminders: ['Estimation établie d\'après tes opérations.'],
};

const setRate = vi.fn();
vi.mock('../api/tax.api', () => ({
  useTaxReport: () => ({ isPending: false, isError: false, data: report }),
  useSetMarginalTaxRate: () => ({ mutate: setRate, isPending: false }),
}));

describe('TaxPage', () => {
  it("impôt estimé, cases à reporter, cessions, PEA et année de déclaration", () => {
    render(<MemoryRouter><TaxPage /></MemoryRouter>);
    expect(screen.getByText(/Impôt estimé sur 2025 · à déclarer en 2026/)).toBeInTheDocument();
    expect(screen.getByText(/144,00/)).toBeInTheDocument(); // 69 + 75
    expect(screen.getByText('3VG')).toBeInTheDocument();
    expect(screen.getByText('3AN')).toBeInTheDocument();
    expect(screen.getByText('Air Liquide')).toBeInTheDocument();
    expect(screen.getByText(/5 ans atteints/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exporter les cessions 2025/ })).toBeInTheDocument();
  });

  it('PER (case 6NS, économie selon la tranche), assurance-vie (8 ans, rachats) et épargne salariale', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TaxPage /></MemoryRouter>);
    expect(screen.getByText('6NS')).toBeInTheDocument();
    expect(screen.getByText(/grâce à tes versements PER \(30 %/)).toBeInTheDocument();
    expect(screen.getByText(/8 ans atteints/)).toBeInTheDocument();
    expect(screen.getByText(/Rachats 2025/)).toBeInTheDocument();
    expect(screen.getByText('PEE Amundi')).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: '30 %' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('radio', { name: '41 %' }));
    expect(setRate.mock.calls[0][0]).toBe(41);
  });
});

describe('export CSV et PEA', () => {
  it('CSV français : séparateur « ; », virgule décimale, titres puis crypto', () => {
    const lines = salesCsv(report).split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('Titres;2025-06-01;AI.PA Air Liquide;4;800,00;600,00;;200,00');
    expect(lines[2]).toBe('Crypto (150 VH bis);2025-09-01;BTC-EUR;;500,00;250,00;1000,00;250,00');
  });

  it('avancement vers les 5 ans', () => {
    expect(fiveYearsProgress('2024-01-01', new Date('2026-07-01T12:00:00'))).toBeCloseTo(50, 0);
    expect(fiveYearsProgress('2015-01-01')).toBe(100);
    expect(fiveYearsProgress(null)).toBe(0);
  });
});
