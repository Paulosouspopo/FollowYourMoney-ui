import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Wallet } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

const tabs = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/portfolios', icon: Wallet, label: 'Portefeuilles' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
];
export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-background/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg grid grid-cols-3">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px]', isActive ? 'text-primary' : 'text-muted-foreground')}>
            <t.icon size={22} strokeWidth={1.8} /><span>{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}