import type { CurvePointDTO } from './dashboard.types';

type Point = Pick<CurvePointDTO, 'totalValueEur' | 'totalInvestedEur' | 'gainLossEur'>;

/**
 * Gain entre deux points de la courbe, et son pourcentage.
 *
 * Gain = variation de la plus-value : un versement ou un achat n'est pas un gain.
 * % = gain / argent engagé sur la période, c'est-à-dire la valeur de départ
 * plus l'argent ajouté pendant la période (hausse de l'investi). Diviser par
 * la seule valeur de départ donne des pourcentages absurdes dès qu'on a versé
 * en cours de route (480 € au départ, 26 000 € ajoutés ensuite : +613 % au
 * lieu de +11 %). Sans versement, c'est la variation classique.
 */
export function periodChange(first: Point | undefined, last: Point | undefined) {
  if (!first || !last) return null;
  const gain = last.gainLossEur - first.gainLossEur;
  const added = Math.max(0, last.totalInvestedEur - first.totalInvestedEur);
  const engaged = Math.max(first.totalValueEur, 0) + added;
  return { gain, pct: engaged > 0 ? (gain / engaged) * 100 : null };
}
