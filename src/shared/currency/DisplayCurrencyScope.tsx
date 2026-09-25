import { Fragment, type ReactNode } from 'react';
import { setDisplayCurrency } from '@/shared/lib/format';
import { useEffectiveDisplayCurrency } from './displayRates.api';

/**
 * Applique la devise d'affichage à `formatEur` (montants EUR convertis au taux
 * du jour) et remonte l'arbre quand elle change : tous les montants se
 * réaffichent. Changement rare (Réglages) : le cache de requêtes est conservé.
 */
export function DisplayCurrencyScope({ children }: { children: ReactNode }) {
  const { currency, rate } = useEffectiveDisplayCurrency();
  setDisplayCurrency(currency, rate);
  return <Fragment key={`${currency}:${rate}`}>{children}</Fragment>;
}
