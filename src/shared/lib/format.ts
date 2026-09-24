const pct = new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Devise d'affichage : les montants EUR du back sont convertis au taux du jour
 * (réglée par DisplayCurrencyScope). Les calculs restent en EUR.
 */
let display = { currency: 'EUR', rate: 1, format: moneyFormat('EUR') };
export function setDisplayCurrency(currency: string, rate: number) {
  if (display.currency !== currency || display.rate !== rate) {
    display = { currency, rate, format: moneyFormat(currency) };
  }
}

function moneyFormat(currency: string) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, maximumFractionDigits: 2 });
}

/** Montant EUR, affiché dans la devise d'affichage. */
export const formatEur = (v: number | null | undefined) => v == null ? '—' : display.format.format(v * display.rate);
export const formatMoney = (v: number | null | undefined, currency: string) =>
  v == null ? '—' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(v);
/** Ton back renvoie des pourcentages en "12.34" et pas "0.1234" → on divise */
export const formatPercent = (v: number | null | undefined) => v == null ? '—' : pct.format(v / 100);
export const formatDate = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
export const formatShortDate = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(iso));

/** Taux saisi en % (ex : 2.4 → « 2,4 % »), jusqu'à 3 décimales. */
export const formatRate = (v: number) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 }).format(v)} %`;

export const formatQty = (v: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 8 }).format(v);
export const gainTone = (v: number) => v > 0 ? 'text-gain' : v < 0 ? 'text-loss' : 'text-muted-foreground';