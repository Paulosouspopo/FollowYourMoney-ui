import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/auth.store';
import { useDisplayCurrencyStore, type DisplayCurrency } from './displayCurrency.store';

export const displayRateKeys = { all: ['display-rates'] as const };

/** Taux du jour 1 EUR = x devise (GET /exchange-rates/display). */
const useDisplayRates = (enabled: boolean) => useQuery({
  queryKey: displayRateKeys.all,
  queryFn: () => api.get<Record<DisplayCurrency, number>>('/exchange-rates/display').then(r => r.data),
  enabled,
  staleTime: 60 * 60_000,
});

/**
 * Devise réellement affichée et son taux : EUR tant que le taux n'est pas
 * connu (déconnecté, erreur) — jamais un montant en euros avec un signe $.
 */
export function useEffectiveDisplayCurrency(): { currency: DisplayCurrency; rate: number } {
  const wanted = useDisplayCurrencyStore(s => s.currency);
  const authenticated = useAuthStore(s => s.status === 'authenticated');
  const rates = useDisplayRates(authenticated && wanted !== 'EUR');
  const rate = wanted === 'EUR' ? 1 : rates.data?.[wanted];
  return rate ? { currency: wanted, rate } : { currency: 'EUR', rate: 1 };
}
