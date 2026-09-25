import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useUnreadCount } from '@/features/notifications/api/notification.api';
import { NAV_ITEMS, unreadLabel } from './nav';
import { Logo } from './Logo';
import { PrivacyToggle } from '@/shared/privacy/PrivacyToggle';

/** Barre latérale sur grand écran (≥ lg). */
export function Sidebar() {
  const unread = useUnreadCount().data ?? 0;
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6">
      <div className="flex items-center gap-2.5 px-2">
        <Logo className="h-8 w-8" />
        <span className="font-semibold tracking-tight">FollowYourMoney</span>
      </div>
      <nav aria-label="Navigation principale" className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => cn('group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground')}>
            {({ isActive }) => (
              <>
                <t.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className={cn(isActive && 'text-primary')} />
                <span className="flex-1">{t.label}</span>
                {t.to === '/alerts' && unread > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-loss text-[11px] leading-5 text-white text-center"
                    aria-label={unreadLabel(unread)}>
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <PrivacyToggle withLabel className="mt-auto justify-start rounded-xl" />
      <p className="mt-3 px-3 text-[11px] leading-relaxed text-muted-foreground">
        Cours mis à jour chaque heure · Yahoo Finance
      </p>
    </aside>
  );
}
