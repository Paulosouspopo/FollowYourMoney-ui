import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Devises d'affichage proposées (alignées sur DisplayCurrency côté back). */
export const DISPLAY_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'] as const;
export type DisplayCurrency = typeof DISPLAY_CURRENCIES[number];
export const DISPLAY_CURRENCY_LABEL: Record<DisplayCurrency, string> = {
  EUR: 'Euro (€)', USD: 'Dollar ($)', GBP: 'Livre (£)', CHF: 'Franc suisse',
};

interface State { currency: DisplayCurrency; setCurrency: (c: DisplayCurrency) => void; }

/** Préférence de l'appareil ; les calculs restent en EUR côté serveur. */
export const useDisplayCurrencyStore = create<State>()(persist(
  set => ({ currency: 'EUR', setCurrency: currency => set({ currency }) }),
  { name: 'fym-display-currency' },
));
