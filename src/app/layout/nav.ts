import { Bell, CandlestickChart, LayoutDashboard, Settings, Wallet } from 'lucide-react';

/** Navigation principale : dock mobile et barre latérale bureau partagent la même liste. */
export const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/portfolios', icon: Wallet, label: 'Portefeuilles' },
  { to: '/markets', icon: CandlestickChart, label: 'Marchés' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
] as const;

export const unreadLabel = (n: number) => `${n} notification${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''}`;
