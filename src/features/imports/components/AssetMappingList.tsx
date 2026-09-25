import { Check } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import { CONFIDENCE_LABEL } from '../model/import.presentation';
import type { AssetResolution, Confidence } from '../model/import.types';
import { initialChoice, type AssetChoice } from '../model/import.choices';

const BADGE: Record<Confidence, string> = {
  REMEMBERED: 'bg-muted text-muted-foreground', CERTAIN: 'bg-gain/15 text-gain',
  TO_CONFIRM: 'bg-warning/15 text-warning', NOT_FOUND: 'bg-loss/15 text-loss',
};

interface Props {
  assets: AssetResolution[];
  choices: Record<string, AssetChoice>;
  onChange: (reference: string, choice: AssetChoice) => void;
}

/**
 * Un actif par ligne : libellé du relevé → symbole Yahoo. L'utilisateur
 * confirme la proposition ou en choisit une autre dans la recherche ; il ne
 * saisit jamais de symbole à la main.
 */
export function AssetMappingList({ assets, choices, onChange }: Props) {
  if (!assets.length) return null;
  const pending = assets.filter(a => !choices[a.reference]?.confirmed).length;

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Actifs ({assets.length})</h2>
        {pending > 0 && <span className="text-xs text-warning">{pending} à valider</span>}
      </div>
      <Card className="divide-y divide-border p-0 gap-0">
        {assets.map(a => {
          const choice = choices[a.reference] ?? initialChoice(a);
          return (
            <div key={a.reference} className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" title={a.label}>{a.label}</p>
                  {a.isin && <p className="text-[11px] text-muted-foreground">{a.isin}</p>}
                </div>
                <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium', BADGE[a.confidence])}>
                  {choice.confirmed && a.confidence !== 'REMEMBERED' && a.confidence !== 'CERTAIN' ? 'Validé' : CONFIDENCE_LABEL[a.confidence]}
                </span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <AssetSearchCombobox value={choice.result} placeholder="Rechercher l'actif…"
                    onChange={r => onChange(a.reference, { result: r, confirmed: true })} />
                </div>
                {!choice.confirmed && choice.result && (
                  <Button type="button" variant="outline" aria-label={`Valider ${choice.result.symbol}`}
                    onClick={() => onChange(a.reference, { ...choice, confirmed: true })}>
                    <Check size={16} /> Valider
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}
