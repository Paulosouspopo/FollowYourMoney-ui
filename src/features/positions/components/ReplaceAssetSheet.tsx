import { displaySymbol } from '@/shared/model/portfolioRules';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/button';
import { FormError } from '@/shared/ui/FormError';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';
import { useReplaceAsset } from '../api/position.api';

interface Props {
  open: boolean; onClose: () => void;
  portfolioId: string; assetId: string; symbol: string; name: string;
  /** Appelé avec le nouveau symbole (pour naviguer vers la nouvelle fiche). */
  onReplaced: (symbol: string) => void;
}

/**
 * Mauvais actif choisi (autre cotation, homonyme) : le remplacer sans
 * ressaisir les opérations. Quantités, prix, dates et devise sont conservés ;
 * seuls les cours de référence changent.
 */
export function ReplaceAssetSheet({ open, onClose, portfolioId, assetId, symbol, name, onReplaced }: Props) {
  const [choice, setChoice] = useState<AssetSearchResult | null>(null);
  const replace = useReplaceAsset(portfolioId);
  const close = () => { setChoice(null); replace.reset(); onClose(); };

  return (
    <BottomSheet open={open} onClose={close} onBack={close} title="Changer d'actif">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Toutes les opérations de <strong className="text-foreground">{name}</strong> ({displaySymbol(symbol)}) seront rattachées au
          nouvel actif : quantités, prix, dates et devise ne changent pas, seuls les cours de référence changent.
          Si l'actif choisi est déjà dans ce portefeuille, les deux lignes sont fusionnées.
        </p>
        <AssetSearchCombobox value={choice} onChange={setChoice} placeholder="Rechercher le bon actif (ex. Ferrari Milan)…" />
        {choice && (
          <p className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm">
            <span className="font-medium">{displaySymbol(symbol)}</span><ArrowRight size={14} className="text-muted-foreground" />
            <span className="font-medium">{choice.symbol}</span>
            <span className="truncate text-muted-foreground">{choice.name}{choice.exchange && ` · ${choice.exchange}`}</span>
          </p>
        )}
        {replace.isPending && (
          <p className="text-xs text-muted-foreground">Téléchargement des cours du nouvel actif et recalcul de l'historique…</p>
        )}
        <FormError message={replace.error?.message} />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={close}>Annuler</Button>
          <Button className="flex-1" disabled={!choice || choice.symbol === symbol} loading={replace.isPending}
            onClick={() => choice && replace.mutate({ assetId, symbol: choice.symbol }, {
              onSuccess: a => { onReplaced(a.symbol); close(); },
            })}>
            Remplacer l'actif
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
