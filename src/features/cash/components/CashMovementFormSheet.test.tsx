import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ApiError } from '@/shared/api/types';
import { CashMovementFormSheet } from './CashMovementFormSheet';

type MutateOptions = { onSuccess?: () => void; onError?: (e: ApiError) => void };
const createMutate = vi.fn<(body: unknown, opts?: MutateOptions) => void>();
const mutation = (mutate: typeof createMutate) => ({ mutate, isPending: false, isError: false, error: null });

vi.mock('@/features/cash/api/cash.api', () => ({
  useCreateCashMovement: () => mutation(createMutate),
  useUpdateCashMovement: () => mutation(vi.fn()),
  useDeleteCashMovement: () => mutation(vi.fn()),
}));

function renderForm(props: Partial<Parameters<typeof CashMovementFormSheet>[0]> = {}) {
  const onClose = vi.fn();
  render(<CashMovementFormSheet portfolioId="p1" open onClose={onClose} {...props} />);
  return { onClose, user: userEvent.setup() };
}

describe('CashMovementFormSheet', () => {
  beforeEach(() => {
    createMutate.mockReset();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-15T00:30:00+01:00')); // veille en UTC
  });
  afterEach(() => vi.useRealTimers());

  it('envoie un versement daté du jour local, montant vide au départ', async () => {
    const { user } = renderForm();
    const amount = screen.getByLabelText('Montant (€)');
    expect(amount).toHaveValue(null);
    expect(screen.getByLabelText('Date')).toHaveValue('2026-03-15');

    await user.type(amount, '250');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(createMutate.mock.calls[0][0]).toEqual({
      type: 'DEPOSIT', amount: 250, movementDate: '2026-03-15', notes: undefined,
    });
  });

  it('bloque un montant nul', async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(await screen.findByText('Montant > 0 requis')).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('prévient avant un retrait supérieur au solde d\'un livret', async () => {
    const { user } = renderForm({ balance: 100, noOverdraft: true });
    await user.click(screen.getByRole('button', { name: 'Retrait' }));
    await user.type(screen.getByLabelText('Montant (€)'), '150');
    expect(screen.getByText(/ce débit sera refusé/)).toBeInTheDocument();
  });

  it("n'avertit pas sur un compte-titres (solde négatif autorisé)", async () => {
    const { user } = renderForm({ balance: 100, noOverdraft: false });
    await user.click(screen.getByRole('button', { name: 'Retrait' }));
    await user.type(screen.getByLabelText('Montant (€)'), '150');
    expect(screen.queryByText(/ce débit sera refusé/)).not.toBeInTheDocument();
  });

  it('affiche le refus du back (solde insuffisant) sans fermer', async () => {
    createMutate.mockImplementation((_b, opts) => opts?.onError?.({
      timestamp: '', status: 400, message: 'Solde insuffisant le 15/03/2026 : 100 € disponibles pour un débit de 150 €',
    }));
    const { user, onClose } = renderForm();
    await user.type(screen.getByLabelText('Montant (€)'), '150');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Solde insuffisant');
    expect(onClose).not.toHaveBeenCalled();
  });

  it("épargne salariale : un abondement pré-rempli part tel quel, sans devise", async () => {
    const { user } = renderForm({
      portfolioType: 'EPARGNE_SALARIALE',
      prefill: { type: 'ABONDEMENT', amount: 300, movementDate: '2026-03-01', notes: 'Abondement' },
    });
    expect(screen.getByLabelText('Montant (€)')).toHaveValue(300);
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(createMutate.mock.calls[0][0]).toEqual({
      type: 'ABONDEMENT', amount: 300, movementDate: '2026-03-01', notes: 'Abondement',
    });
  });

  it('compte multidevise : un change envoie les deux montants et leurs devises', async () => {
    const { user } = renderForm({ multiCurrency: true, prefill: { type: 'CONVERSION', amount: 900, movementDate: '2026-03-10' } });
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(await screen.findByText('Montant reçu requis')).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Montant reçu'), '1000');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(createMutate.mock.calls[0][0]).toEqual({
      type: 'CONVERSION', amount: 900, movementDate: '2026-03-10', notes: undefined,
      currency: 'EUR', counterAmount: 1000, counterCurrency: 'USD',
    });
  });
});
