import { useState } from 'react';
import { BellOff, BellPlus, BellRing, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { toast } from '@/shared/ui/toast.store';
import { formatDate } from '@/shared/lib/format';
import { localDateTimeIn } from '@/shared/lib/dates';
import { useAlertRules, useMuteAlertRule, useSaveAlertRule } from '../api/notification.api';
import { AlertRuleFormSheet } from './AlertRuleFormSheet';
import { isMuted, toRequest } from '../model/alertRule';
import type { AlertRule } from '../model/notification.types';

const formatUntil = (iso: string) => new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(iso));

/** Règles d'alerte : activation rapide, sourdine, modification au clic, création. */
export function AlertRulesList() {
  const q = useAlertRules();
  const [editing, setEditing] = useState<AlertRule | 'new' | null>(null);

  return (
    <div className="space-y-3">
      <Button className="w-full" variant="outline" onClick={() => setEditing('new')}><BellPlus size={16} /> Nouvelle alerte</Button>
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={2} />}>
        {rules => rules.length === 0 ? (
          <EmptyState title="Aucune alerte" description="Par exemple : « quand mon CTO baisse de 3 % sur 1 jour », « quand BTC atteint un plus haut sur 1 an » ou « quand ma plus-value dépasse 20 % »." />
        ) : (
          <ul className="divide-y divide-border">
            {rules.map(r => <AlertRuleRow key={r.id} rule={r} onEdit={() => setEditing(r)} />)}
          </ul>
        )}
      </QueryBoundary>
      <AlertRuleFormSheet open={editing !== null} onClose={() => setEditing(null)}
        initial={editing === 'new' ? undefined : editing ?? undefined} />
      <p className="text-[11px] text-muted-foreground">Les alertes sont vérifiées chaque heure, après la mise à jour des cours.</p>
    </div>
  );
}

/** Une règle ; réutilisée sur la fiche d'un actif. */
export function AlertRuleRow({ rule: r, onEdit }: { rule: AlertRule; onEdit: () => void }) {
  const save = useSaveAlertRule();
  const mute = useMuteAlertRule();
  const muted = isMuted(r);

  const toggle = (enabled: boolean) => save.mutate({ id: r.id, body: toRequest(r, { enabled }) },
    { onError: e => toast.error(e.message) });
  const toggleMute = () => mute.mutate({ id: r.id, until: muted ? null : localDateTimeIn(24) }, {
    onSuccess: () => toast.success(muted ? 'Alerte réactivée' : 'Alerte en sourdine pour 24 h'),
    onError: e => toast.error(e.message),
  });

  return (
    <li className="py-3 flex items-center gap-3">
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onEdit}>
        {r.label && <p className="text-sm font-semibold">{r.label}</p>}
        <p className={r.label ? 'text-xs text-muted-foreground' : 'text-sm font-medium'}>{r.description}</p>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1 flex-wrap">
          {r.notifyPush && <Smartphone size={11} aria-label="push" />}
          {r.notifyEmail && <Mail size={11} aria-label="email" />}
          {muted
            ? <span className="text-warning">en sourdine jusqu'au {formatUntil(r.mutedUntil!)}</span>
            : r.lastTriggeredAt ? `déclenchée le ${formatDate(r.lastTriggeredAt)}` : 'jamais déclenchée'}
        </p>
      </button>
      {r.enabled && (
        <Button variant="ghost" size="icon" loading={mute.isPending} onClick={toggleMute}
          aria-label={muted ? `Réactiver : ${r.description}` : `Sourdine 24 h : ${r.description}`}>
          {muted ? <BellRing size={16} /> : <BellOff size={16} />}
        </Button>
      )}
      <Switch checked={r.enabled} onChange={toggle} label={`Activer : ${r.description}`} labelHidden />
    </li>
  );
}
