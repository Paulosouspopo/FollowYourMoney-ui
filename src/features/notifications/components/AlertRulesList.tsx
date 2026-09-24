import { useState } from 'react';
import { BellPlus, Mail } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { toast } from '@/shared/ui/toast.store';
import { formatDate } from '@/shared/lib/format';
import { useAlertRules, useSaveAlertRule } from '../api/notification.api';
import { AlertRuleFormSheet } from './AlertRuleFormSheet';
import type { AlertRule } from '../model/notification.types';

/** Règles d'alerte : activation rapide, modification au clic, création. */
export function AlertRulesList() {
  const q = useAlertRules();
  const save = useSaveAlertRule();
  const [editing, setEditing] = useState<AlertRule | 'new' | null>(null);

  const toggle = (r: AlertRule, enabled: boolean) => save.mutate({
    id: r.id,
    body: {
      scope: r.scope, portfolioId: r.portfolioId, symbol: r.symbol, condition: r.condition,
      threshold: r.threshold, period: r.period, notifyEmail: r.notifyEmail, enabled,
    },
  }, { onError: e => toast.error(e.message) });

  return (
    <div className="space-y-3">
      <Button className="w-full" variant="outline" onClick={() => setEditing('new')}><BellPlus size={16} /> Nouvelle alerte</Button>
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={2} />}>
        {rules => rules.length === 0 ? (
          <EmptyState title="Aucune alerte" description="Par exemple : « quand mon CTO baisse de 3 % sur 1 jour » ou « quand BTC monte de 5 % »." />
        ) : (
          <ul className="divide-y divide-border">
            {rules.map(r => (
              <li key={r.id} className="py-3 flex items-center gap-3">
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditing(r)}>
                  <p className="text-sm font-medium">{r.description}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {r.notifyEmail && <><Mail size={11} /> email · </>}
                    {r.lastTriggeredAt ? `déclenchée le ${formatDate(r.lastTriggeredAt)}` : 'jamais déclenchée'}
                  </p>
                </button>
                <Switch checked={r.enabled} onChange={on => toggle(r, on)} label={`Activer : ${r.description}`} labelHidden />
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
      <AlertRuleFormSheet open={editing !== null} onClose={() => setEditing(null)}
        initial={editing === 'new' ? undefined : editing ?? undefined} />
      <p className="text-[11px] text-muted-foreground">Les alertes sont vérifiées chaque heure, après la mise à jour des cours.</p>
    </div>
  );
}
