import { Bell, CandlestickChart, Coins, LayoutDashboard, Settings, Wallet } from 'lucide-react';

/** Navigation principale : dock mobile et barre latérale bureau partagent la même liste. */
export const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/portfolios', icon: Wallet, label: 'Portefeuilles' },
  { to: '/markets', icon: CandlestickChart, label: 'Marchés' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
] as const;

/** Pages secondaires : barre latérale (bureau) ; sur mobile, accès par les cartes de l'accueil. */
export const SECONDARY_NAV_ITEMS = [
  { to: '/income', icon: Coins, label: 'Revenus' },
] as const;

export const unreadLabel = (n: number) => `${n} notification${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''}`;
