import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualAssetPicker } from './ManualAssetPicker';
import type { AssetResponse } from '../model/asset.types';

const fund: AssetResponse = {
  id: 'a1', portfolioId: 'p1', symbol: '~ABCDEFGHJKLM', name: 'FCPE Actions Monde', longName: null, exchangeName: null,
  assetType: 'FONDS', currency: 'EUR', manual: true, createdAt: '', updatedAt: '',
};
const createMutate = vi.fn();
vi.mock('../api/manualAsset.api', () => ({
  useManualAssets: () => ({ data: [fund] }),
  useCreateManualAsset: () => ({ mutate: createMutate, isPending: false, isError: false, error: null }),
}));

describe('ManualAssetPicker', () => {
  it('propose les actifs non cotés existants, sans jamais afficher leur symbole interne', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ManualAssetPicker portfolioId="p1" onSelect={onSelect} />);
    expect(screen.queryByText(/~ABC/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /FCPE Actions Monde/ }));
    expect(onSelect).toHaveBeenCalledWith(fund);
  });

  it("crée un actif à partir d'un nom (type Fonds, en euros par défaut)", async () => {
    const user = userEvent.setup();
    render(<ManualAssetPicker portfolioId="p1" onSelect={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Saisis sa valeur toi-même/ }));
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeDisabled();
    await user.type(screen.getByLabelText("Nom de l'actif"), 'Amundi Label Actions');
    await user.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(createMutate.mock.calls[0][0]).toEqual({ name: 'Amundi Label Actions', assetType: 'FONDS', currency: 'EUR' });
  });
});
