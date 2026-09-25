import { Fragment, type ReactNode } from 'react';
import { setAmountsHidden, setDisplayCurrency } from '@/shared/lib/format';
import { usePrivacyStore } from '@/shared/privacy/privacy.store';
import { useEffectiveDisplayCurrency } from './displayRates.api';

/**
 * Applique la devise d'affichage (montants EUR convertis au taux du jour) et
 * le mode confidentialité aux fonctions de format, puis remonte l'arbre quand
 * l'un change : tous les montants se réaffichent. Changements rares : le
 * cache de requêtes est conservé.
 */
export function DisplayCurrencyScope({ children }: { children: ReactNode }) {
  const { currency, rate } = useEffectiveDisplayCurrency();
  const hidden = usePrivacyStore(s => s.hidden);
  setDisplayCurrency(currency, rate);
  setAmountsHidden(hidden);
  return <Fragment key={`${currency}:${rate}:${hidden}`}>{children}</Fragment>;
}
