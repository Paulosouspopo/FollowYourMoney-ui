import { NavLink } from 'react-router-dom';
import { Bell, CandlestickChart, LayoutDashboard, Settings, Wallet } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useUnreadCount } from '@/features/notifications/api/notification.api';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/portfolios', icon: Wallet, label: 'Portefeuilles' },
  { to: '/markets', icon: CandlestickChart, label: 'Marchés' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
];
export function BottomNav() {
  const unread = useUnreadCount().data ?? 0;
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-background/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg grid grid-cols-5">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => cn('relative flex flex-col items-center gap-1 py-2.5 text-[10px]', isActive ? 'text-primary' : 'text-muted-foreground')}>
            <t.icon size={22} strokeWidth={1.8} /><span>{t.label}</span>
            {t.to === '/alerts' && unread > 0 && (
              <span className="absolute top-1.5 left-1/2 ml-1.5 min-w-4 h-4 px-1 rounded-full bg-loss text-[10px] leading-4 text-white text-center"
                aria-label={`${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}`}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
