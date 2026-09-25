import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toast.store';
import { formatDate } from '@/shared/lib/format';
import { useRevokeSession, useSessions } from '../api/account.api';
import { describeDevice, isMobileDevice } from '../model/device';

const PREVIEW = 5;
/** Adresse locale (développement) : sans intérêt à afficher. */
const LOCAL_IP = /^(127\.|::1$|0:0:0:0:0:0:0:1$)/;

/** Appareils connectés : navigateur, dernière activité ; déconnexion d'un appareil à distance. */
export function SessionsCard() {
  const sessions = useSessions().data ?? [];
  const revoke = useRevokeSession();
  const [all, setAll] = useState(false);
  if (sessions.length === 0) return null;
  const shown = all ? sessions : sessions.slice(0, PREVIEW);
  return (
    <Card className="p-0 gap-0">
      <p className="px-4 pt-3 text-sm font-semibold">Appareils connectés</p>
      <ul className="divide-y divide-border">
        {shown.map(s => {
          const Icon = isMobileDevice(s.userAgent) ? Smartphone : Monitor;
          return (
            <li key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><Icon size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {describeDevice(s.userAgent)}
                  {s.current && <span className="ml-2 rounded bg-primary/12 px-1.5 text-[10px] text-primary">cet appareil</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Actif le {formatDate(s.lastUsedAt)}{s.ip && !LOCAL_IP.test(s.ip) ? ` · ${s.ip}` : ''} · connecté depuis le {formatDate(s.startedAt)}
                </p>
              </div>
              {!s.current && (
                <Button type="button" size="sm" variant="ghost" loading={revoke.isPending && revoke.variables === s.id}
                  onClick={() => revoke.mutate(s.id, {
                    onSuccess: () => toast.success('Appareil déconnecté'), onError: e => toast.error(e.message),
                  })}>
                  Déconnecter
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      {sessions.length > PREVIEW && (
        <button type="button" onClick={() => setAll(a => !a)} className="px-4 pb-3 text-left text-xs text-primary">
          {all ? 'Afficher moins' : `Tout afficher (${sessions.length})`}
        </button>
      )}
    </Card>
  );
}
