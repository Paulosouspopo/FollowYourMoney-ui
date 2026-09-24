import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PlanResponse } from '../model/plan.types';
import { PlanFormSheet } from './PlanFormSheet';

const createMutate = vi.fn();
const updateMutate = vi.fn();
const mutation = (mutate: typeof createMutate) => ({ mutate, isPending: false });

vi.mock('../api/plan.api', () => ({
  useCreatePlan: () => mutation(createMutate),
  useUpdatePlan: () => mutation(updateMutate),
  useDeletePlan: () => mutation(vi.fn()),
}));
vi.mock('@/features/assets/api/assetSearch.api', () => ({
  ASSET_SEARCH_MIN_LENGTH: 2,
  useAssetSearch: () => ({ data: [], isFetching: false }),
}));

const EXISTING: PlanResponse = {
  id: 'p1', portfolioId: 'pf', portfolioName: 'PEA', portfolioType: 'PEA', type: 'BUY', symbol: 'ESE.PA',
  name: 'BNP Easy S&P 500', amount: 100, fees: 0, frequency: 'MONTHLY', startDate: '2026-01-05', endDate: null,
  fractional: false, active: true, occurrences: 3, nextExecutionDate: '2026-04-05', lastExecutionDate: '2026-03-05',
  lastError: null, monthlyAmount: 100,
};

const renderForm = (props: Partial<Parameters<typeof PlanFormSheet>[0]> = {}) => {
  render(<PlanFormSheet portfolioId="pf" portfolioType="PEA" cashTracking={false} open onClose={vi.fn()} {...props} />);
  return userEvent.setup();
};

describe('PlanFormSheet', () => {
  beforeEach(() => {
    createMutate.mockReset();
    updateMutate.mockReset();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-24T10:00:00+02:00'));
  });
  afterEach(() => vi.useRealTimers());

  it("compte sans suivi des liquidités : achat uniquement, l'actif est obligatoire", async () => {
    const user = renderForm();
    expect(screen.queryByRole('button', { name: 'Versement' })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Montant par échéance (€)'), '100');
    await user.click(screen.getByRole('button', { name: 'Programmer' }));

    expect(screen.getByText("Choisis l'actif à acheter")).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('livret : versement uniquement, sans actif ni frais', async () => {
    const user = renderForm({ portfolioType: 'LIVRET', cashTracking: true });
    expect(screen.queryByText('Actif')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Frais par échéance (€)')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Montant par échéance (€)'), '50');
    await user.click(screen.getByRole('button', { name: 'Programmer' }));

    expect(createMutate.mock.calls[0][0]).toEqual({
      type: 'DEPOSIT', symbol: null, amount: 50, fees: 0, frequency: 'MONTHLY',
      startDate: '2026-09-24', endDate: null, fractional: true, active: true,
    });
  });

  it("annonce la création des échéances passées quand la première est dans le passé", async () => {
    const user = renderForm({ portfolioType: 'LIVRET', cashTracking: true });
    const start = screen.getByLabelText('Première échéance');
    await user.clear(start);
    await user.type(start, '2026-06-01');
    expect(screen.getByText(/Les échéances depuis le .* seront créées/)).toBeInTheDocument();
  });

  it('modification après des échéances : actif, fréquence et début figés, montant modifiable', async () => {
    const user = renderForm({ initial: EXISTING });
    expect(screen.getByLabelText('Première échéance')).toBeDisabled();
    // Recherche d'actif et fréquence
    screen.getAllByRole('combobox').forEach(c => expect(c).toBeDisabled());
    expect(screen.getByText(/figés après la première échéance/)).toBeInTheDocument();

    const amount = screen.getByLabelText('Montant par échéance (€)');
    await user.clear(amount);
    await user.type(amount, '150');
    await user.click(screen.getByRole('switch', { name: 'Plan actif' }));
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(updateMutate.mock.calls[0][0]).toMatchObject({
      id: 'p1', body: { symbol: 'ESE.PA', amount: 150, active: false, fractional: false },
    });
  });
});
