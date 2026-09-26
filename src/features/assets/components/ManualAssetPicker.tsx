import { useState } from 'react';
import { ChevronRight, PenLine } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { FormSelect } from '@/shared/ui/form-select';
import { FormError } from '@/shared/ui/FormError';
import { ASSET_TYPE_LABEL, type AssetType } from '@/shared/model/enums';
import { CASH_CURRENCIES } from '@/shared/model/portfolioRules';
import { useCreateManualAsset, useManualAssets } from '../api/manualAsset.api';
import type { AssetResponse } from '../model/asset.types';

const MANUAL_TYPES: AssetType[] = ['FONDS', 'ACTION', 'ETF', 'AUTRE'];

interface Props {
  portfolioId: string;
  onSelect: (asset: AssetResponse) => void;
}

/**
 * Sous la recherche Yahoo : les actifs non cotés déjà créés dans ce
 * portefeuille, et la création d'un nouveau (fonds absent de Yahoo, FCPE…).
 * L'utilisateur donne un nom, jamais un symbole.
 */
export function ManualAssetPicker({ portfolioId, onSelect }: Props) {
  const existing = useManualAssets(portfolioId).data ?? [];
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('FONDS');
  const [currency, setCurrency] = useState('EUR');
  const create = useCreateManualAsset(portfolioId);

  const submit = () => {
    if (!name.trim()) return;
    create.mutate({ name: name.trim(), assetType: type, currency }, { onSuccess: onSelect });
  };

  return (
    <div className="space-y-3">
      {existing.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Tes actifs non cotés</p>
          <ul className="divide-y divide-border rounded-xl ring-1 ring-border">
            {existing.map(a => (
              <li key={a.id}>
                <button type="button" onClick={() => onSelect(a)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/50">
                  <span className="min-w-0 flex-1 truncate font-medium">{a.name}</span>
                  <span className="text-[11px] text-muted-foreground">{ASSET_TYPE_LABEL[a.assetType]} · {a.currency}</span>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!creating ? (
        <button type="button" onClick={() => setCreating(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border px-3 py-3 text-left hover:border-primary/60">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary"><PenLine size={15} /></span>
          <span className="text-sm">
            <span className="block font-medium">Actif introuvable ? Saisis sa valeur toi-même</span>
            <span className="block text-xs text-muted-foreground">Fonds d'assurance-vie, FCPE d'entreprise, titre non coté…</span>
          </span>
        </button>
      ) : (
        <div className="space-y-3 rounded-xl bg-muted/40 p-3">
          <Input label="Nom de l'actif" placeholder="Amundi Label Actions Euro ES-F" value={name}
            onChange={e => setName(e.target.value)} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <FormSelect label="Type" value={type} onChange={v => setType(v as AssetType)}
              options={MANUAL_TYPES.map(t => ({ value: t, label: ASSET_TYPE_LABEL[t] }))} />
            <FormSelect label="Devise" value={currency} onChange={setCurrency}
              options={CASH_CURRENCIES.map(c => ({ value: c, label: c }))} />
          </div>
          <p className="text-xs text-muted-foreground">
            Sa valeur suivra le prix de tes opérations, puis les valeurs liquidatives que tu saisiras depuis sa fiche (relevé trimestriel…).
          </p>
          {create.isError && <FormError message={create.error.message} />}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>Annuler</Button>
            <Button type="button" className="flex-1" disabled={!name.trim()} loading={create.isPending} onClick={submit}>
              Continuer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
