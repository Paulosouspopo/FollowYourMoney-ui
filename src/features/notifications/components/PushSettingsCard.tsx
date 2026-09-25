import { useState } from 'react';
import { BellRing, Smartphone } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { FormSelect } from '@/shared/ui/form-select';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { toast } from '@/shared/ui/toast.store';
import { pushSupport } from '@/shared/pwa/push';
import {
  useDeviceSubscribed, useDisablePush, useEnablePush, useNotificationPreferences,
  useSaveNotificationPreferences, useTestPush,
} from '../api/notification.api';
import type { NotificationPreferences } from '../model/notification.types';

const HOURS = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: `${String(h).padStart(2, '0')} h` }));

/** Notifications push : cet appareil, tous les appareils, heures calmes. */
export function PushSettingsCard() {
  const prefs = useNotificationPreferences();
  return (
    <QueryBoundary query={prefs}>
      {p => (
        <Card className="p-4 space-y-4">
          <ThisDevice />
          <PreferencesForm key={JSON.stringify(p)} initial={p} />
        </Card>
      )}
    </QueryBoundary>
  );
}

function ThisDevice() {
  const support = pushSupport();
  const subscribed = useDeviceSubscribed();
  const enable = useEnablePush();
  const disable = useDisablePush();
  const test = useTestPush();

  if (support === 'ios-install-required') {
    return (
      <p className="text-xs text-muted-foreground flex gap-2">
        <Smartphone size={16} className="shrink-0" />
        Sur iPhone, ajoute d'abord l'app à l'écran d'accueil (Partager → « Sur l'écran d'accueil »), puis ouvre-la depuis
        l'icône pour activer les notifications.
      </p>
    );
  }
  if (support === 'unsupported') {
    return <p className="text-xs text-muted-foreground">Ce navigateur ne gère pas les notifications push.</p>;
  }

  const on = subscribed.data === true;
  return (
    <div className="space-y-3">
      <Switch checked={on} disabled={subscribed.isLoading || enable.isPending || disable.isPending}
        label="Notifications sur cet appareil"
        description={on ? 'Alertes et rapports arrivent même app fermée.' : 'Active-les pour être prévenu même app fermée.'}
        onChange={next => (next ? enable : disable).mutate(undefined, {
          onSuccess: () => toast.success(next ? 'Notifications activées sur cet appareil' : 'Notifications désactivées sur cet appareil'),
          onError: e => toast.error(e.message),
        })} />
      {on && (
        <Button variant="outline" size="sm" className="w-full" loading={test.isPending}
          onClick={() => test.mutate(undefined, {
            onSuccess: n => n > 0 ? toast.success('Notification de test envoyée') : toast.error("Aucun appareil n'a pu être joint"),
            onError: e => toast.error(e.message),
          })}>
          <BellRing size={16} /> Envoyer une notification de test
        </Button>
      )}
    </div>
  );
}

function PreferencesForm({ initial }: { initial: NotificationPreferences }) {
  const save = useSaveNotificationPreferences();
  const [pushEnabled, setPushEnabled] = useState(initial.pushEnabled);
  const [quiet, setQuiet] = useState(initial.quietStart != null);
  const [start, setStart] = useState(String(initial.quietStart ?? 22));
  const [end, setEnd] = useState(String(initial.quietEnd ?? 7));

  const body = {
    pushEnabled,
    quietStart: quiet ? Number(start) : null,
    quietEnd: quiet ? Number(end) : null,
  };
  const dirty = body.pushEnabled !== initial.pushEnabled || body.quietStart !== initial.quietStart
    || body.quietEnd !== initial.quietEnd;

  return (
    <div className="space-y-4 border-t border-border pt-4">
      <Switch checked={pushEnabled} onChange={setPushEnabled} label="Push sur tous mes appareils"
        description={`${initial.devices} appareil${initial.devices > 1 ? 's' : ''} abonné${initial.devices > 1 ? 's' : ''}. Désactivé : tout reste dans l'onglet Alertes.`} />
      <Switch checked={quiet} onChange={setQuiet} disabled={!pushEnabled} label="Heures calmes"
        description="Pas de push pendant cette plage : les notifications t'attendent dans l'app." />
      {quiet && pushEnabled && (
        <div className="grid grid-cols-2 gap-3">
          <FormSelect label="De" value={start} onChange={setStart} options={HOURS} />
          <FormSelect label="À" value={end} onChange={setEnd} options={HOURS} />
        </div>
      )}
      <Button className="w-full" disabled={!dirty || (quiet && start === end)} loading={save.isPending}
        onClick={() => save.mutate(body, {
          onSuccess: () => toast.success('Préférences enregistrées'),
          onError: e => toast.error(e.message),
        })}>
        Enregistrer
      </Button>
    </div>
  );
}
