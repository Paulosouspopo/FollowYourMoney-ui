import { AssetSearchCombobox } from '@/features/transactions/components/AssetSearchCombobox';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';

interface Props {
  portfolioId: string; // non utilisé ici puisque la recherche est globale
  onSelect: (asset: Pick<AssetSearchResult, 'symbol' | 'name' | 'currency'>) => void;
}

export function AssetPicker({ onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Sélectionner un actif</h3>
      <AssetSearchCombobox
        onChange={(result) =>
          onSelect({
            symbol: result.symbol,
            name: result.name,
            currency: result.currency,
          })
        }
        placeholder="Bitcoin, Apple, TOTAL, EUR/USD..."
      />
      <p className="text-xs text-muted-foreground">
        La recherche est globale (tous les actifs Yahoo). Cherche par nom, symbole ou code ISIN.
      </p>
    </div>
  );
}