import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { toast } from '@/shared/ui/toast.store';
import { download } from '../api/account.api';

/** Mes données (RGPD) : tout le compte en JSON, ou les opérations en CSV réimportable. */
export function ExportCard() {
  const [busy, setBusy] = useState<'json' | 'csv' | null>(null);
  const run = (kind: 'json' | 'csv') => {
    setBusy(kind);
    (kind === 'json' ? download('/account/export', 'followyourmoney.json') : download('/account/export/transactions.csv', 'operations.csv'))
      .catch((e: { message?: string }) => toast.error(e.message ?? 'Export impossible'))
      .finally(() => setBusy(null));
  };
  return (
    <Card className="p-4 gap-3">
      <p className="flex items-center gap-2 text-sm font-semibold"><Download size={15} /> Exporter mes données</p>
      <p className="text-xs text-muted-foreground">
        Tes données t'appartiennent : récupère-les quand tu veux, pour les garder ou les emporter ailleurs.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" loading={busy === 'json'} onClick={() => run('json')}>
          <FileJson size={15} /> Tout mon compte (JSON)
        </Button>
        <Button type="button" variant="outline" loading={busy === 'csv'} onClick={() => run('csv')}>
          <FileSpreadsheet size={15} /> Mes opérations (CSV)
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Le CSV se réimporte tel quel (import → format « autre »).</p>
    </Card>
  );
}
