import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { useUnreadCount } from '@/features/notifications/api/notification.api';
import { MOBILE_NAV_ITEMS, isNavActive, unreadLabel } from './nav';

/** Barre du bas (mobile et tablette), collée au bord de l'écran ; remplacée par la barre latérale sur grand écran. */
export function BottomNav() {
  const unread = useUnreadCount().data ?? 0;
  const { pathname } = useLocation();
  return (
    <nav aria-label="Navigation principale"
      className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {MOBILE_NAV_ITEMS.map(t => {
          const active = isNavActive(pathname, t.matches);
          return (
            <Link key={t.to} to={t.to} aria-current={active ? 'page' : undefined}
              className={cn('relative flex flex-col items-center gap-0.5 pt-1.5 pb-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground active:text-foreground')}>
              <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', active && 'bg-primary/12')}>
                <t.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              </span>
              <span>{t.label}</span>
              {t.to === '/alerts' && unread > 0 && (
                <span className="absolute top-1 left-1/2 ml-2 min-w-4 h-4 px-1 rounded-full bg-loss text-[10px] leading-4 text-white text-center"
                  aria-label={unreadLabel(unread)}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
