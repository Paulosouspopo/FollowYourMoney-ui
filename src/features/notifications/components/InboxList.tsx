import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BellRing, CalendarClock, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { cn } from '@/shared/lib/cn';
import { useInbox, useMarkAllRead, useMarkRead } from '../api/notification.api';
import type { NotificationItem, NotificationType } from '../model/notification.types';

const ICON: Record<NotificationType, typeof BellRing> = { ALERT: BellRing, REPORT: FileText, PLAN: CalendarClock };

const when = (iso: string) => new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso));

/** Libellé du bouton qui ouvre la page liée à la notification. */
const linkLabel = (link: string) =>
  link === '/' ? 'Voir mon patrimoine'
    : link.startsWith('/portfolios/') ? 'Voir le portefeuille'
      : link.startsWith('/markets/') ? "Voir la fiche de l'actif"
        : 'Ouvrir';

/** Notifications reçues ; un clic marque comme lu et affiche le détail (texte complet + lien). */
export function InboxList() {
  const q = useInbox();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const nav = useNavigate();
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const close = useCallback(() => setSelected(null), []);

  const open = (n: NotificationItem) => {
    if (!n.read) markRead.mutate(n.id);
    setSelected(n);
  };

  const Detail = selected ? ICON[selected.type] : null;

  return (
    <QueryBoundary query={q} skeleton={<ListSkeleton rows={3} />}>
      {items => items.length === 0 ? (
        <EmptyState title="Aucune notification" description="Crée une alerte ou active le rapport quotidien pour être prévenu." />
      ) : (
        <div className="space-y-2">
          {items.some(n => !n.read) && (
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" loading={markAll.isPending} onClick={() => markAll.mutate()}>Tout marquer comme lu</Button>
            </div>
          )}
          <ul className="divide-y divide-border">
            {items.map(n => {
              const Icon = ICON[n.type];
              return (
                <li key={n.id}>
                  <button type="button" onClick={() => open(n)} className="w-full flex gap-3 py-3 text-left -mx-2 px-2 rounded-xl active:bg-muted/60">
                    <span className={cn('h-9 w-9 rounded-full grid place-items-center shrink-0',
                      n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/15 text-primary')}><Icon size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className={cn('text-sm truncate', !n.read && 'font-semibold')}>{n.title}</p>
                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Non lue" />}
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-2">{n.body}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-0.5">{when(n.createdAt)}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <BottomSheet open={selected != null} onClose={close} title={selected?.title ?? ''}>
            {selected && Detail && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Detail size={14} /> {when(selected.createdAt)}
                </div>
                <p className="text-sm whitespace-pre-line leading-relaxed">{selected.body}</p>
                {selected.link && (
                  <Button className="w-full" onClick={() => { const link = selected.link!; close(); nav(link); }}>
                    {linkLabel(selected.link)} <ArrowRight size={16} />
                  </Button>
                )}
              </div>
            )}
          </BottomSheet>
        </div>
      )}
    </QueryBoundary>
  );
}
