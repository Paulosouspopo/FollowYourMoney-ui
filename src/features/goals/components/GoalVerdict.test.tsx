import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoalVerdict } from './GoalVerdict';
import { GoalFormSheet } from './GoalFormSheet';
import type { Goal } from '../model/goal.types';

const saveMutate = vi.fn();
vi.mock('../api/goal.api', () => ({
  useSaveGoal: () => ({ mutate: saveMutate, isPending: false }),
  useDeleteGoal: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/features/portfolios/api/portfolio.api', () => ({ usePortfolios: () => ({ data: [{ id: 'p1', name: 'PEA' }] }) }));

const inYears = (n: number) => {
  const d = new Date();
  return `${d.getFullYear() + n}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};
const goal = (patch: Partial<Goal>): Goal => ({
  id: 'g1', name: 'Apport', targetAmount: 50000, targetDate: null, portfolioId: null, portfolioName: null,
  currentValueEur: 10000, monthlyContributionEur: 500, progressPct: 20, ...patch,
});

describe('GoalVerdict', () => {
  it("dans les temps : date d'atteinte au rythme actuel", () => {
    render(<GoalVerdict goal={goal({ targetDate: inYears(10) })} ratePct={5} />);
    expect(screen.getByText(/Au rythme actuel : .* dans les temps/)).toBeInTheDocument();
  });

  it("échéance trop courte : après l'échéance, et versement mensuel nécessaire", () => {
    render(<GoalVerdict goal={goal({ targetDate: inYears(2) })} ratePct={5} />);
    expect(screen.getByText(/après ton échéance/)).toBeInTheDocument();
    expect(screen.getByText(/Pour tenir l'échéance/)).toHaveTextContent('par mois');
  });

  it('sans versement ni rendement : jamais atteint ; objectif dépassé : atteint', () => {
    const { unmount } = render(<GoalVerdict goal={goal({ monthlyContributionEur: 0 })} ratePct={0} />);
    expect(screen.getByText(/jamais atteint/)).toBeInTheDocument();
    unmount();
    render(<GoalVerdict goal={goal({ currentValueEur: 60000 })} ratePct={5} />);
    expect(screen.getByText(/Atteint/)).toBeInTheDocument();
  });
});

describe('GoalFormSheet', () => {
  it('envoie nom, montant, échéance et périmètre (tout le patrimoine = null)', async () => {
    const user = userEvent.setup();
    render(<GoalFormSheet open onClose={vi.fn()} />);
    await user.type(screen.getByLabelText('Nom'), 'Apport immobilier');
    await user.type(screen.getByLabelText('Montant à atteindre (€)'), '40000');
    await user.click(screen.getByRole('button', { name: "Créer l'objectif" }));
    expect(saveMutate.mock.calls[0][0]).toEqual({
      id: undefined, body: { name: 'Apport immobilier', targetAmount: 40000, targetDate: null, portfolioId: null },
    });
  });
});
