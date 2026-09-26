import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AlertRuleFormSheet } from './AlertRuleFormSheet';
import { InboxList } from './InboxList';

const saveMutate = vi.fn();
const markReadMutate = vi.fn();
const navigate = vi.fn();

vi.mock('../api/notification.api', () => ({
  useSaveAlertRule: () => ({ mutate: saveMutate, isPending: false }),
  useDeleteAlertRule: () => ({ mutate: vi.fn(), isPending: false }),
  useInbox: () => ({
    isPending: false, isError: false,
    data: [
      { id: 'n1', type: 'ALERT', title: '📉 CTO −3,4 % aujourd\'hui', body: 'Valeur : 10 000 €', link: '/portfolios/pf1', read: false, createdAt: '2026-09-24T10:00:00' },
      { id: 'n2', type: 'REPORT', title: 'Ton bilan du jour', body: 'Patrimoine : 29 000 €', link: '/', read: true, createdAt: '2026-09-23T19:15:00' },
    ],
  }),
  useMarkRead: () => ({ mutate: markReadMutate }),
  useMarkAllRead: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('@/features/portfolios/api/portfolio.api', () => ({
  usePortfolios: () => ({ data: [{ id: 'pf1', name: 'CTO' }] }),
}));
vi.mock('@/features/assets/api/assetSearch.api', () => ({
  ASSET_SEARCH_MIN_LENGTH: 2,
  useAssetSearch: () => ({ data: [], isFetching: false }),
}));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig<typeof import('react-router-dom')>()), useNavigate: () => navigate }));

describe('AlertRuleFormSheet', () => {
  beforeEach(() => saveMutate.mockReset());

  it('patrimoine en baisse de 3 % sur 1 jour : phrase de résumé et requête envoyée', async () => {
    const user = userEvent.setup();
    render(<AlertRuleFormSheet open onClose={vi.fn()} />);

    await user.type(screen.getByLabelText('Seuil (%)'), '3');
    expect(screen.getByText('Quand mon patrimoine total baisse de 3 % sur 1 jour')).toBeInTheDocument();
    await user.click(screen.getByRole('switch', { name: 'Email' }));
    await user.click(screen.getByRole('button', { name: "Créer l'alerte" }));

    expect(saveMutate.mock.calls[0][0]).toEqual({
      id: undefined,
      body: {
        scope: 'GLOBAL', portfolioId: null, symbol: null, condition: 'FALLS', threshold: 3, period: 'DAY',
        notifyEmail: true, notifyPush: true, enabled: true, label: null, mutedUntil: null,
      },
    });
  });

  it("refuse un seuil vide et un seuil en % démesuré (saisie en € par erreur)", async () => {
    const user = userEvent.setup();
    render(<AlertRuleFormSheet open onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: "Créer l'alerte" }));
    expect(screen.getByRole('alert')).toHaveTextContent('seuil positif');

    await user.type(screen.getByLabelText('Seuil (%)'), '5000');
    await user.click(screen.getByRole('button', { name: "Créer l'alerte" }));
    expect(screen.getByRole('alert')).toHaveTextContent('1000 maximum');
    expect(saveMutate).not.toHaveBeenCalled();
  });

  it('modification : reprend la règle existante', () => {
    render(<AlertRuleFormSheet open onClose={vi.fn()} initial={{
      id: 'r1', scope: 'ASSET', portfolioId: null, portfolioName: null, symbol: 'BTC-EUR', assetName: 'Bitcoin EUR',
      condition: 'ABOVE', threshold: 70000, period: null, notifyEmail: false, notifyPush: true, enabled: true,
      label: 'Objectif BTC', mutedUntil: null, lastTriggeredAt: null,
      description: 'Bitcoin EUR (BTC-EUR) passe au-dessus de 70 000,00 €',
    }} />);
    expect(screen.getByLabelText('Seuil (€)')).toHaveValue(70000);
    expect(screen.getByText('Quand Bitcoin EUR passe au-dessus de 70 000 €')).toBeInTheDocument();
    expect(screen.getByLabelText('Nom (facultatif)')).toHaveValue('Objectif BTC');
  });

  it("depuis la fiche d'un actif : nouveau plus haut sur 1 an, sans seuil", async () => {
    const user = userEvent.setup();
    render(<AlertRuleFormSheet open onClose={vi.fn()} preset={{
      scope: 'ASSET', condition: 'NEW_HIGH', asset: { symbol: 'CW8.PA', name: 'MSCI World', exchange: 'Paris', assetType: 'ETF' },
    }} />);

    expect(screen.queryByLabelText(/Seuil/)).not.toBeInTheDocument();
    expect(screen.getByText('Quand MSCI World atteint un nouveau plus haut sur 1 an')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Nom (facultatif)'), 'Record MSCI');
    await user.click(screen.getByRole('button', { name: "Créer l'alerte" }));

    expect(saveMutate.mock.calls[0][0].body).toMatchObject({
      scope: 'ASSET', symbol: 'CW8.PA', condition: 'NEW_HIGH', threshold: null, period: 'YEAR', label: 'Record MSCI',
    });
  });
});

describe('InboxList', () => {
  beforeEach(() => { markReadMutate.mockReset(); navigate.mockReset(); });

  it('ouvre une notification non lue : la marque comme lue, affiche le détail puis la page liée', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><InboxList /></MemoryRouter>);

    expect(screen.getByLabelText('Non lue')).toBeInTheDocument();
    await user.click(screen.getByText("📉 CTO −3,4 % aujourd'hui"));
    expect(markReadMutate).toHaveBeenCalledWith('n1');
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Valeur : 10 000 €')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: /Voir le portefeuille/ }));
    expect(navigate).toHaveBeenCalledWith('/portfolios/pf1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('un rapport (lien « / ») s’ouvre aussi en détail, sans le re-marquer comme lu', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><InboxList /></MemoryRouter>);

    await user.click(screen.getByText('Ton bilan du jour'));
    expect(markReadMutate).not.toHaveBeenCalled(); // déjà lue
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Patrimoine : 29 000 €')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: /Voir mon patrimoine/ }));
    expect(navigate).toHaveBeenCalledWith('/');
  });
});
