import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useUnreadCount } from '@/features/notifications/api/notification.api';
import { NAV_ITEMS, unreadLabel } from './nav';

/** Dock flottant (mobile et tablette) ; remplacé par la barre latérale sur grand écran. */
export function BottomNav() {
  const unread = useUnreadCount().data ?? 0;
  return (
    <nav aria-label="Navigation principale"
      className="lg:hidden fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.625rem)] z-40 mx-auto max-w-md rounded-2xl border border-border bg-background/80 shadow-[0_8px_30px_oklch(0_0_0/18%)] backdrop-blur-xl">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(t => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => cn('relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground')}>
            {({ isActive }) => (
              <>
                <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', isActive && 'bg-primary/12')}>
                  <t.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span>{t.label}</span>
                {t.to === '/alerts' && unread > 0 && (
                  <span className="absolute top-1 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-loss text-[10px] leading-4 text-white text-center"
                    aria-label={unreadLabel(unread)}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
