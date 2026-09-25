import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WrappedPage from './WrappedPage';
import { shareLines } from '../model/shareCard';
import { isWrappedSeason } from '../model/season';
import type { Wrapped } from '../model/wrapped.types';

const wrapped: Wrapped = {
  year: 2025, years: [2026, 2025], from: '2025-01-01', to: '2025-12-31', complete: true,
  startValueEur: 20000, endValueEur: 26000, gainEur: 3000, netDepositsEur: 3000, twrPct: 14.2,
  benchmarkName: 'MSCI World', benchmarkPct: 9.1,
  months: [1, 2, 7.4, -3.2, 1, 1, 1, 1, 1, 1, 1, 1], bestMonth: 3, worstMonth: 4,
  bestLine: { name: 'Amundi MSCI World', symbol: 'CW8.PA', portfolioId: 'p', gainEur: 1800, returnPct: 12 },
  worstLine: null, dividendsEur: 120, interestEur: 40, operations: 14, buys: 12, sells: 1, activeMonths: 11,
  investedEur: 3000, feesEur: 12, newAssets: 2,
  personality: { key: 'METRONOME', title: 'Le métronome', text: 'Tu as investi 11 mois sur 12.' },
};

vi.mock('../api/wrapped.api', () => ({ useWrapped: () => ({ isPending: false, isError: false, data: wrapped }) }));

describe('WrappedPage', () => {
  it('fait défiler les diapositives jusqu’au profil, puis propose le partage', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><WrappedPage /></MemoryRouter>);
    expect(screen.getByText('2025', { selector: 'p' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Diapositive suivante' }));
    expect(screen.getByText('+14,2 %')).toBeInTheDocument();
    expect(screen.getByText(/tu l'as battu de/)).toHaveTextContent('5,1 points');
    for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Diapositive suivante' }));
    expect(screen.getByText('Le métronome')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Partager/ })).toBeInTheDocument();
  });
});

describe('carte à partager', () => {
  it('seulement des pourcentages, jamais de montant', () => {
    const { big, lines } = shareLines(wrapped);
    expect(big).toBe('+14,2 %');
    expect(lines).toEqual([
      '+5,1 % de mieux que le MSCI World', 'Meilleur mois : mars (+7,4 %)', 'Ma star : Amundi MSCI World (+12 %)', 'Le métronome',
    ]);
    expect([big, ...lines].join(' ')).not.toMatch(/€/);
  });

  it('le bilan se met en avant du 15 décembre au 15 février', () => {
    expect(isWrappedSeason(new Date('2025-12-20T12:00:00'))).toBe(true);
    expect(isWrappedSeason(new Date('2026-02-10T12:00:00'))).toBe(true);
    expect(isWrappedSeason(new Date('2026-06-10T12:00:00'))).toBe(false);
  });
});
