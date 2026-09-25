import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MarketsPage from './MarketsPage';
import type { WatchlistItem } from '../model/market.types';

const addMutate = vi.fn();
const items: WatchlistItem[] = [
  {
    id: 'w1', symbol: 'BTC-EUR', name: 'Bitcoin EUR', assetType: 'CRYPTO', price: 61234.5, currency: 'EUR',
    priceDate: '2026-09-24', dayChangePct: -2.5, sparkline: [60000, 61000, 61234.5], ownedQuantity: 0.12, alertCount: 2,
  },
  {
    id: 'w2', symbol: 'AAPL', name: 'Apple Inc.', assetType: 'ACTION', price: 231.1, currency: 'USD',
    priceDate: '2026-09-23', dayChangePct: 1.2, sparkline: [], ownedQuantity: 0, alertCount: 0,
  },
];

vi.mock('../api/market.api', () => ({
  useWatchlist: () => ({ isPending: false, isError: false, data: items }),
  useAddToWatchlist: () => ({ mutate: addMutate, isPending: false }),
}));
vi.mock('@/features/assets/api/assetSearch.api', () => ({
  ASSET_SEARCH_MIN_LENGTH: 2,
  useAssetSearch: () => ({ data: [], isFetching: false }),
}));

describe('MarketsPage', () => {
  beforeEach(() => addMutate.mockReset());

  it('liste les actifs suivis : cours, variation, détenu, alertes, lien vers la fiche', () => {
    render(<MemoryRouter><MarketsPage /></MemoryRouter>);

    const btc = screen.getByText('Bitcoin EUR').closest('a')!;
    expect(btc).toHaveAttribute('href', '/markets/BTC-EUR');
    expect(btc).toHaveTextContent('détenu');
    expect(btc).toHaveTextContent('2,50 %');
    expect(screen.getByLabelText('2 alerte(s)')).toBeInTheDocument();

    const apple = screen.getByText('Apple Inc.').closest('a')!;
    expect(apple).not.toHaveTextContent('détenu');
    expect(apple).toHaveTextContent('$US');
  });

  it('suggestions : les actifs déjà suivis ne sont pas proposés, un clic les suit', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><MarketsPage /></MemoryRouter>);

    expect(screen.queryByRole('button', { name: 'Bitcoin' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'CAC 40' }));
    expect(addMutate.mock.calls[0][0]).toBe('^FCHI');
  });
});
