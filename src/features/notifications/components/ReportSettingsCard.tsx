import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { FormSelect } from '@/shared/ui/form-select';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { toast } from '@/shared/ui/toast.store';
import { useReportPreview, useReportSettings, useSaveReportSettings } from '../api/notification.api';
import type { ReportFrequency, ReportSettings } from '../model/notification.types';

const FREQUENCIES: { value: ReportFrequency; label: string }[] = [
  { value: 'NONE', label: 'Désactivé' }, { value: 'DAILY', label: 'Chaque jour' }, { value: 'WEEKLY', label: 'Le lundi' },
];
const HOURS = Array.from({ length: 24 }, (_, h) => ({ value: String(h), label: `${String(h).padStart(2, '0')} h` }));

/** Rapport périodique : fréquence, heure, email, et aperçu du contenu. */
export function ReportSettingsCard() {
  const q = useReportSettings();
  return (
    <QueryBoundary query={q}>
      {settings => <ReportSettingsForm key={JSON.stringify(settings)} initial={settings} />}
    </QueryBoundary>
  );
}

function ReportSettingsForm({ initial }: { initial: ReportSettings }) {
  const [settings, setSettings] = useState(initial);
  const [showPreview, setShowPreview] = useState(false);
  const save = useSaveReportSettings();
  const preview = useReportPreview(showPreview);
  const dirty = JSON.stringify(settings) !== JSON.stringify(initial);

  return (
    <div className="space-y-3">
      <Card className="p-4 space-y-4">
        <div className="space-y-1.5">
          <span className="text-sm font-medium">Rapport de ton patrimoine</span>
          <SegmentedControl<ReportFrequency> fullWidth value={settings.frequency}
            onChange={frequency => setSettings(s => ({ ...s, frequency }))} options={FREQUENCIES} />
        </div>
        {settings.frequency !== 'NONE' && (
          <>
            <FormSelect label="Heure d'envoi" value={String(settings.sendHour)}
              onChange={v => setSettings(s => ({ ...s, sendHour: Number(v) }))} options={HOURS} />
            <Switch checked={settings.notifyEmail} onChange={notifyEmail => setSettings(s => ({ ...s, notifyEmail }))}
              label="Recevoir aussi par email" />
          </>
        )}
        <p className="text-xs text-muted-foreground">
          Valeur de ton patrimoine et de chaque portefeuille, variation depuis le rapport précédent, plus fortes hausses et
          baisses, investissements programmés exécutés.
        </p>
        <Button className="w-full" disabled={!dirty} loading={save.isPending}
          onClick={() => save.mutate(settings, { onSuccess: () => toast.success('Rapport enregistré'), onError: e => toast.error(e.message) })}>
          Enregistrer
        </Button>
      </Card>

      <Button variant="ghost" className="w-full" loading={preview.isFetching} onClick={() => { setShowPreview(true); void preview.refetch(); }}>
        Voir un exemple
      </Button>
      {showPreview && preview.data && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold">{preview.data.title}</p>
          <p className="text-xs whitespace-pre-line text-muted-foreground">{preview.data.body}</p>
        </Card>
      )}
    </div>
  );
}
