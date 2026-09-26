import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PortfolioCard } from './PortfolioCard';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import type { PortfolioValuation, PositionValuation } from '../model/dashboard.types';
import type { TransactionResponse } from '@/features/transactions/model/transaction.types';

vi.mock('../api/dashboard.api', () => ({ usePrefetchPortfolio: () => vi.fn() }));

const position = (symbol: string, value: number, quantity = 1): PositionValuation => ({
  assetId: symbol, symbol, name: symbol, assetType: 'ACTION', quantity, averageCostEur: 1, investedEur: value,
  currentValueEur: value, unrealizedGainEur: 0, unrealizedGainPercentage: 0, realizedGainEur: 0, dividendsEur: 0,
  totalFeesEur: 0, lastPrice: 1, priceCurrency: 'EUR', priceAsOf: null, priceMissing: false,
});

const pea: PortfolioValuation = {
  portfolioId: 'p1', name: 'PEA', type: 'PEA', currentValueEur: 10000, investedEur: 8000, unrealizedGainEur: 2000,
  unrealizedGainPercentage: 25, realizedGainEur: 0, dividendsEur: 0, interestEur: 0, totalFeesEur: 0,
  cashTracking: false, cashEur: 0, netDepositsEur: 0, annualInterestRate: null, openPositionCount: 4,
  employerContributionsEur: 0, multiCurrencyCash: false, cashBalances: [],
  hasIncompletePrices: false,
  positions: [position('TTE.PA', 1000), position('CW8.PA', 6000), position('AI.PA', 2000), position('BNP.PA', 1000),
    position('OLD.PA', 5000, 0)],
};

describe('PortfolioCard', () => {
  it('à droite : gain sur 30 jours et 3 plus grosses lignes ouvertes (+ le reste)', () => {
    render(<MemoryRouter><PortfolioCard valuation={pea}
      trend={{ portfolioId: 'p1', values: [9000, 9500, 10000], changeEur: 450, changePct: 4.5 }} /></MemoryRouter>);

    const trendLine = screen.getByText(/30 j/).parentElement!;
    expect(trendLine.textContent!.replace(/\s/g, ' ')).toBe('+450,00 € · +4,50 % 30 j');
    // Ligne clôturée (quantité 0) ignorée ; triées par valeur
    expect(screen.getByLabelText('Principales lignes : CW8.PA, AI.PA, TTE.PA')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});

describe('modification', () => {
  const tx: TransactionResponse = {
    id: 't1', portfolioId: 'p1', symbol: 'CW8.PA', type: 'BUY', quantity: 2, pricePerUnit: 500, fees: 1,
    totalAmount: 1000, currency: 'EUR', totalAmountEur: 1000, feesEur: 1, transactionDate: '2026-09-01T10:00:00',
  } as TransactionResponse;

  it("une transaction modifiable l'annonce (crayon + libellé accessible)", async () => {
    const onClick = vi.fn();
    render(<TransactionRow tx={tx} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button', { name: /Modifier : Achat CW8.PA/ }));
    expect(onClick).toHaveBeenCalled();
  });

  it('la fenêtre propose un retour en arrière', async () => {
    const onBack = vi.fn();
    render(<BottomSheet open onClose={vi.fn()} onBack={onBack} title="Modifier la transaction"><p>…</p></BottomSheet>);
    await userEvent.click(screen.getByRole('button', { name: 'Retour' }));
    expect(onBack).toHaveBeenCalled();
  });
});
