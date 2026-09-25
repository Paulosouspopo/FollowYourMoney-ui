/** Libellés français des clés renvoyées par la radiographie. */

export const SECTOR_LABEL: Record<string, string> = {
  technology: 'Technologie',
  financial_services: 'Finance',
  healthcare: 'Santé',
  consumer_cyclical: 'Consommation cyclique',
  consumer_defensive: 'Consommation de base',
  industrials: 'Industrie',
  communication_services: 'Communication',
  energy: 'Énergie',
  basic_materials: 'Matériaux',
  utilities: 'Services publics',
  realestate: 'Immobilier',
  unknown: 'Non déterminé',
};

/** Pour une phrase : « 30 % dans la tech ». */
export const SECTOR_PHRASE: Record<string, string> = {
  technology: 'la tech', financial_services: 'la finance', healthcare: 'la santé',
  consumer_cyclical: 'la consommation cyclique', consumer_defensive: 'la consommation de base',
  industrials: "l'industrie", communication_services: 'la communication', energy: "l'énergie",
  basic_materials: 'les matériaux', utilities: 'les services publics', realestate: "l'immobilier",
};

export const CLASS_LABEL: Record<string, string> = {
  ACTIONS: 'Actions',
  OBLIGATIONS: 'Obligations',
  LIQUIDITES: 'Liquidités',
  FONDS_EUROS: 'Fonds euros',
  LIVRETS: 'Livrets',
  CRYPTO: 'Crypto',
  FONDS_NON_DETAILLE: 'Fonds (non détaillés)',
  AUTRES: 'Autres',
};

const CURRENCY_NAME: Record<string, string> = {
  EUR: 'Euro', USD: 'Dollar américain', GBP: 'Livre sterling', JPY: 'Yen', CHF: 'Franc suisse', CAD: 'Dollar canadien',
  AUD: 'Dollar australien', CNY: 'Yuan', HKD: 'Dollar de Hong Kong', TWD: 'Dollar taïwanais', KRW: 'Won', INR: 'Roupie',
  SEK: 'Couronne suédoise', DKK: 'Couronne danoise', NOK: 'Couronne norvégienne', BRL: 'Réal', CRYPTO: 'Crypto',
  AUTRES: 'Autres devises',
};
export const currencyLabel = (code: string) => CURRENCY_NAME[code] ?? code;

/** Drapeau emoji d'un code pays ISO (US → 🇺🇸) ; globe pour les regroupements. */
export function flag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code) || code.startsWith('X')) return '🌐';
  return String.fromCodePoint(...[...code].map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Libellé d'une part selon l'onglet (le back renvoie le nom français des pays). */
export function sliceLabel(tab: 'countries' | 'sectors' | 'currencies' | 'classes', key: string, label: string) {
  if (tab === 'sectors') return SECTOR_LABEL[key] ?? label;
  if (tab === 'classes') return CLASS_LABEL[key] ?? label;
  if (tab === 'currencies') return currencyLabel(key);
  return label;
}

/** Part arrondie pour la lecture : « 72 % », « 4,5 % » (une décimale sous 10 %). */
export function formatShare(pct: number): string {
  if (pct > 0 && pct < 0.1) return '< 0,1 %';
  const digits = Math.abs(pct) < 10 ? 1 : 0;
  return `${pct.toLocaleString('fr-FR', { maximumFractionDigits: digits })}\u00a0%`;
}
