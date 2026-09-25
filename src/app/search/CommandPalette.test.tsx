import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CommandPalette } from './CommandPalette';

vi.mock('@/features/dashboard/api/dashboard.api', () => ({
  useDashboard: () => ({ data: { portfolios: [{
    portfolioId: 'p1', name: 'PEA Bourso', type: 'PEA',
    positions: [{ assetId: 'a1', symbol: 'AI.PA', name: 'Air Liquide', quantity: 3 }],
  }] } }),
}));
vi.mock('@/features/assets/api/assetSearch.api', () => ({
  ASSET_SEARCH_MIN_LENGTH: 2,
  useAssetSearch: () => ({ data: [] }),
}));

function renderApp() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/income" element={<p>Page revenus</p>} />
        <Route path="/portfolios/:pid/positions/:symbol" element={<p>Fiche de la ligne</p>} />
      </Routes>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('CommandPalette', () => {
  it('Ctrl+K ouvre la recherche, une page se trouve par son nom', async () => {
    const user = renderApp();
    await user.keyboard('{Control>}k{/Control}');
    await user.type(await screen.findByPlaceholderText(/Rechercher une page/), 'revenus');
    await user.keyboard('{Enter}');
    expect(await screen.findByText('Page revenus')).toBeInTheDocument();
  });

  it('retrouve une ligne détenue et ouvre sa fiche', async () => {
    const user = renderApp();
    await user.keyboard('/');
    await user.type(await screen.findByPlaceholderText(/Rechercher une page/), 'air liq');
    await user.click(await screen.findByText('Air Liquide'));
    expect(await screen.findByText('Fiche de la ligne')).toBeInTheDocument();
  });
});
