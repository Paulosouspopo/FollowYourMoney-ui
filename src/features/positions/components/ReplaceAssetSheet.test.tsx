import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReplaceAssetSheet } from './ReplaceAssetSheet';

const mutate = vi.fn();
vi.mock('../api/position.api', () => ({
  useReplaceAsset: () => ({ mutate, isPending: false, error: null, reset: vi.fn() }),
}));
// Recherche simulée : un clic choisit Ferrari à Milan
vi.mock('@/features/assets/components/AssetSearchCombobox', () => ({
  AssetSearchCombobox: ({ onChange }: { onChange: (a: unknown) => void }) => (
    <button type="button" onClick={() => onChange({ symbol: 'RACE.MI', name: 'Ferrari N.V.', exchange: 'Milan', assetType: 'ACTION' })}>
      choisir
    </button>
  ),
}));

describe('ReplaceAssetSheet', () => {
  it("remplace l'actif de la ligne puis ouvre la fiche du nouvel actif", async () => {
    const user = userEvent.setup();
    const onReplaced = vi.fn();
    render(<ReplaceAssetSheet open onClose={vi.fn()} portfolioId="p1" assetId="a1" symbol="RACE" name="Ferrari N.V."
      onReplaced={onReplaced} />);

    expect(screen.getByRole('button', { name: "Remplacer l'actif" })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'choisir' }));
    expect(screen.getByText('RACE.MI')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: "Remplacer l'actif" }));

    expect(mutate.mock.calls[0][0]).toEqual({ assetId: 'a1', symbol: 'RACE.MI' });
    mutate.mock.calls[0][1].onSuccess({ symbol: 'RACE.MI' });
    expect(onReplaced).toHaveBeenCalledWith('RACE.MI');
  });
});
