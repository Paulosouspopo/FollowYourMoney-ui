import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ApiError } from '@/shared/api/types';
import { TransactionFormSheet } from './TransactionFormSheet';

// Les hooks de mutation sont remplacés : on vérifie le body envoyé au back
// et la gestion de ses réponses, sans réseau ni React Query.
type MutateOptions = { onSuccess?: () => void; onError?: (e: ApiError) => void };
const createMutate = vi.fn<(body: unknown, opts?: MutateOptions) => void>();
const mutation = (mutate: typeof createMutate) => ({ mutate, isPending: false, isError: false, error: null });

vi.mock('@/features/transactions/api/transaction.api', () => ({
  useCreateTransaction: () => mutation(createMutate),
  useUpdateTransaction: () => mutation(vi.fn()),
  useDeleteTransaction: () => mutation(vi.fn()),
}));

const AAPL = { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD' };

function renderForm(props: Partial<Parameters<typeof TransactionFormSheet>[0]> = {}) {
  const onClose = vi.fn();
  render(<TransactionFormSheet portfolioId="p1" open onClose={onClose} lockedAsset={AAPL} {...props} />);
  return { onClose, user: userEvent.setup() };
}

const submit = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole('button', { name: 'Ajouter' }));

describe('TransactionFormSheet', () => {
  beforeEach(() => {
    createMutate.mockReset();
    // Seule l'horloge est simulée (pas les timers, dont user-event a besoin).
    // 00:30 à Paris = veille en UTC : piège classique de toISOString().
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-15T00:30:00+01:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('laisse les champs numériques vides : taper 1 donne 1, pas 01', async () => {
    const { user } = renderForm();
    const quantity = screen.getByLabelText('Quantité');

    expect(quantity).toHaveValue(null);
    await user.type(quantity, '1');
    expect(quantity).toHaveValue(1);
  });

  it("propose la date du jour en heure locale, pas en UTC", () => {
    renderForm();
    expect(screen.getByLabelText('Date')).toHaveValue('2026-03-15T00:30');
  });

  it("envoie un achat avec la devise de l'actif et une date LocalDateTime", async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText('Quantité'), '2');
    await user.type(screen.getByLabelText('Prix unitaire'), '150.5');
    await submit(user);

    expect(createMutate).toHaveBeenCalledOnce();
    expect(createMutate.mock.calls[0][0]).toEqual({
      symbol: 'AAPL', type: 'BUY', quantity: 2, pricePerUnit: 150.5, fees: 0,
      currency: 'USD', transactionDate: '2026-03-15T00:30:00', notes: undefined,
    });
  });

  it('envoie un dividende avec quantity = 1 et le montant total en prix', async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Dividende' }));
    expect(screen.queryByLabelText('Quantité')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Montant reçu'), '42');
    await submit(user);

    expect(createMutate.mock.calls[0][0]).toMatchObject({ type: 'DIVIDEND', quantity: 1, pricePerUnit: 42 });
  });

  it("bloque l'envoi si la quantité ou le prix manquent (miroir du back)", async () => {
    const { user } = renderForm();
    await submit(user);

    expect(await screen.findByText('Quantité > 0 requise')).toBeInTheDocument();
    expect(screen.getByText('Prix > 0 requis')).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('affiche les erreurs du back sur les champs, et les autres en message global', async () => {
    createMutate.mockImplementation((_body, opts) => opts?.onError?.({
      timestamp: '', status: 400, message: 'Erreur de validation',
      fieldErrors: [
        { field: 'pricePerUnit', message: 'Le prix doit être strictement positif' },
        { field: 'symbol', message: 'Le symbole est obligatoire' },
      ],
    }));
    const { user } = renderForm();
    await user.type(screen.getByLabelText('Quantité'), '1');
    await user.type(screen.getByLabelText('Prix unitaire'), '1');
    await submit(user);

    expect(await screen.findByText('Le prix doit être strictement positif')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Le symbole est obligatoire');
  });

  it("affiche une erreur métier du back (vente à découvert) sans fermer le formulaire", async () => {
    createMutate.mockImplementation((_body, opts) => opts?.onError?.({
      timestamp: '', status: 400, message: 'Vente de 5 impossible le 14/03/2026 : seulement 2 détenu(s) à cette date',
    }));
    const { user, onClose } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Vente' }));
    await user.type(screen.getByLabelText('Quantité'), '5');
    await user.type(screen.getByLabelText('Prix unitaire'), '10');
    await submit(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('seulement 2 détenu(s)');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('prévient avant envoi quand la vente dépasse la quantité détenue', async () => {
    const { user } = renderForm({ heldQuantities: { AAPL: 3 } });
    await user.click(screen.getByRole('button', { name: 'Vente' }));
    await user.type(screen.getByLabelText('Quantité'), '4');

    expect(screen.getByText(/Tu ne détiens que 3 AAPL/)).toBeInTheDocument();
  });

  it('ferme le formulaire après un ajout réussi', async () => {
    createMutate.mockImplementation((_body, opts) => opts?.onSuccess?.());
    const { user, onClose } = renderForm();
    await user.type(screen.getByLabelText('Quantité'), '1');
    await user.type(screen.getByLabelText('Prix unitaire'), '1');
    await submit(user);

    expect(onClose).toHaveBeenCalledOnce();
  });
});
