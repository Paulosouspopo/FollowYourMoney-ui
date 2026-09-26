import type { CashMovementType, PortfolioType } from './enums';

/** Miroir de `PortfolioRules` côté back : pour adapter les formulaires (le back reste la source de vérité). */

/** Enveloppe à versements : assurance-vie, PER, épargne salariale (liquidités toujours suivies). */
export const isSavingsWrapper = (type: PortfolioType) =>
  type === 'ASSURANCE_VIE' || type === 'PER' || type === 'EPARGNE_SALARIALE';

/** Les liquidités du compte sont un fonds euros rémunéré (taux annuel). */
export const hasEuroFund = (type: PortfolioType) => type === 'ASSURANCE_VIE' || type === 'PER';

/** Liquidités toujours suivies (livret, enveloppe) : pas de réglage. */
export const forcesCashTracking = (type: PortfolioType) => type === 'LIVRET' || isSavingsWrapper(type);

/** Nom du solde de liquidités selon le compte. */
export function cashLabel(type: PortfolioType): string {
  if (type === 'LIVRET') return 'Solde';
  if (hasEuroFund(type)) return 'Fonds euros';
  if (type === 'EPARGNE_SALARIALE') return 'Sommes à investir';
  return 'Liquidités';
}

/** Types de mouvement proposés selon le compte. */
export function movementTypes(type: PortfolioType, multiCurrency: boolean): CashMovementType[] {
  const types: CashMovementType[] = ['DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'FEE'];
  if (type === 'EPARGNE_SALARIALE' || type === 'PER') types.splice(1, 0, 'ABONDEMENT');
  if (multiCurrency) types.push('CONVERSION');
  return types;
}

/** Devises proposées pour un compte multidevise. */
export const CASH_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'JPY'] as const;

/**
 * Symbole interne d'un actif non coté (attribué par le back, jamais saisi ni
 * reconstruit ici) : on s'en sert seulement pour ne pas ouvrir de fiche de marché.
 */
export const isManualSymbol = (symbol: string) => symbol.startsWith('~');

/** Symbole à afficher : celui de Yahoo, ou « non coté » pour un actif saisi à la main. */
export const displaySymbol = (symbol: string) => (isManualSymbol(symbol) ? 'non coté' : symbol);

/** Initiales d'une pastille : symbole Yahoo (sans « -EUR »), ou nom d'un actif non coté. */
export const iconLabel = (symbol: string, name?: string) =>
  isManualSymbol(symbol) ? (name ?? '?').replace(/[^\p{L}\p{N}]/gu, '').slice(0, 3).toUpperCase() : symbol.replace(/^\^/, '').replace(/-.*$/, '').slice(0, 4);
