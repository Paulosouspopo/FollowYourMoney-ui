import type { AssetSearchResult } from '@/features/assets/model/asset.types';
import { isTradeKind, type AssetResolution, type ImportRow } from './import.types';

/** Choix de l'utilisateur pour un actif du relevé. */
export interface AssetChoice { result: AssetSearchResult | null; confirmed: boolean; }

/** Les correspondances sûres sont acceptées d'office ; les autres doivent être validées. */
export const initialChoice = (a: AssetResolution): AssetChoice => ({
  result: a.suggestion,
  confirmed: a.suggestion !== null && (a.confidence === 'REMEMBERED' || a.confidence === 'CERTAIN'),
});

/** Actifs dont dépendent les lignes cochées (actif de l'opération + actif servant à estimer un prix). */
export const neededReferences = (rows: ImportRow[]): Set<string> => {
  const refs = new Set<string>();
  rows.filter(r => isTradeKind(r.kind)).forEach(r => {
    if (r.assetReference) refs.add(r.assetReference);
    if (r.valuationReference) refs.add(r.valuationReference);
  });
  return refs;
};
