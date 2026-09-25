import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PortfolioFormSheet } from './PortfolioFormSheet';
import type { PortfolioResponse } from '../model/portfolio.types';

const createMutate = vi.fn();
const updateMutate = vi.fn();

vi.mock('../api/portfolio.api', () => ({
  useCreatePortfolio: () => ({ mutate: createMutate, isPending: false, isError: false, error: null }),
  useUpdatePortfolio: () => ({ mutate: updateMutate, isPending: false, isError: false, error: null }),
}));

const LIVRET: PortfolioResponse = {
  id: 'l1', name: 'Livret A', description: null, type: 'LIVRET', cashTracking: true, annualInterestRate: 2.4,
  openedAt: null, userId: 'u', createdAt: '', updatedAt: '',
};

describe('PortfolioFormSheet', () => {
  beforeEach(() => { createMutate.mockReset(); updateMutate.mockReset(); });

  it('crée un compte avec suivi des liquidités activé par l\'interrupteur', async () => {
    const user = userEvent.setup();
    render(<PortfolioFormSheet open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Nom'), 'CTO Bourso');
    const toggle = screen.getByRole('switch', { name: 'Suivre les liquidités' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Créer' }));

    expect(createMutate.mock.calls[0][0]).toEqual({
      name: 'CTO Bourso', type: 'PEA', description: undefined, cashTracking: true, annualInterestRate: null, openedAt: null,
    });
  });

  it('livret : taux affiché à la place de l\'interrupteur, suivi toujours actif', async () => {
    const user = userEvent.setup();
    render(<PortfolioFormSheet open onClose={vi.fn()} initial={LIVRET} />);

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    const rate = screen.getByLabelText('Taux annuel (%, optionnel)');
    expect(rate).toHaveValue(2.4);

    await user.clear(rate);
    await user.type(rate, '3');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(updateMutate.mock.calls[0][0]).toMatchObject({ type: 'LIVRET', cashTracking: true, annualInterestRate: 3 });
  });

  it('livret sans taux : envoie null', async () => {
    const user = userEvent.setup();
    render(<PortfolioFormSheet open onClose={vi.fn()} initial={{ ...LIVRET, annualInterestRate: null }} />);
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(updateMutate.mock.calls[0][0]).toMatchObject({ annualInterestRate: null });
  });
});
