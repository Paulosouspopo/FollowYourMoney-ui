import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileSpreadsheet } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { TOURS } from '@/features/guide/tours';
import { usePageTour } from '@/shared/tour/usePageTour';
import { TourButton } from '@/shared/tour/TourButton';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { FormError } from '@/shared/ui/FormError';
import { FormSelect } from '@/shared/ui/form-select';
import { toast } from '@/shared/ui/toast.store';
import type { ApiError } from '@/shared/api/types';
import { usePortfolio } from '@/features/portfolios/api/portfolio.api';
import { useCommitImport, useInspectImport, usePreviewImport } from '../api/import.api';
import { FileDrop } from '../components/FileDrop';
import { ColumnMappingForm } from '../components/ColumnMappingForm';
import { AssetMappingList } from '../components/AssetMappingList';
import { ImportRowsList } from '../components/ImportRowsList';
import { initialChoice, neededReferences, type AssetChoice } from '../model/import.choices';
import { FORMAT_OPTIONS } from '../model/import.presentation';
import {
  isTradeKind, type GenericMapping, type ImportFormat, type ImportInspection, type ImportPreview, type ImportRow, type RowStatus,
} from '../model/import.types';

type Step = 'upload' | 'mapping' | 'preview';

/**
 * Import d'un relevé en trois temps : fichier → (association des colonnes si
 * format inconnu) → aperçu à valider. Rien n'est enregistré avant « Importer ».
 */
export default function ImportPage() {
  const { portfolioId = '' } = useParams();
  const nav = useNavigate();
  const portfolio = usePortfolio(portfolioId);

  const inspect = useInspectImport();
  const previewMutation = usePreviewImport();
  const commit = useCommitImport();

  const [step, setStep] = useState<Step>('upload');
  usePageTour(TOURS.import, step === 'upload');
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<ImportInspection | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [choices, setChoices] = useState<Record<string, AssetChoice>>({});
  const [enableCash, setEnableCash] = useState(true);
  const [filter, setFilter] = useState<RowStatus>('READY');
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const runPreview = (f: File, format: ImportFormat | null, mapping: GenericMapping | null) =>
    previewMutation.mutate({ file: f, options: { portfolioId, format, mapping } }, {
      onSuccess: p => {
        setPreview(p);
        setSelected(new Set(p.rows.filter(r => r.status === 'READY').map(r => r.id)));
        setChoices(Object.fromEntries(p.assets.map(a => [a.reference, initialChoice(a)])));
        setRowErrors({});
        setFilter('READY');
        setStep('preview');
      },
    });

  const onFile = (f: File) => {
    setFile(f);
    inspect.mutate(f, {
      onSuccess: ins => {
        setInspection(ins);
        if (ins.detectedFormat) runPreview(f, ins.detectedFormat, null);
        else setStep('mapping');
      },
    });
  };

  // ------------------------------------------------------------- aperçu
  const rows = useMemo(() => preview?.rows ?? [], [preview]);
  const needsCashTracking = !!preview && !preview.cashTrackingEnabled
    && rows.some(r => !isTradeKind(r.kind) && (r.status === 'READY' || r.status === 'DUPLICATE'));
  const isSelectable = (r: ImportRow) =>
    (r.status === 'READY' || r.status === 'DUPLICATE') && (isTradeKind(r.kind) || !needsCashTracking || enableCash);

  const selectedRows = rows.filter(r => selected.has(r.id));
  const needed = neededReferences(selectedRows);
  const pendingAssets = [...needed].filter(ref => !choices[ref]?.confirmed || !choices[ref]?.result).length;
  const cashCount = selectedRows.filter(r => !isTradeKind(r.kind)).length;

  const toggle = (id: number) => setSelected(s => {
    const next = new Set(s);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const onEnableCash = (on: boolean) => {
    setEnableCash(on);
    if (!on) setSelected(s => new Set([...s].filter(id => isTradeKind(rows[id]?.kind ?? null))));
  };

  const onCommit = () => {
    const assets = Object.fromEntries([...needed].map(ref => [ref, choices[ref]?.result?.symbol ?? '']));
    commit.mutate({ portfolioId, enableCashTracking: enableCash, assets, rows: selectedRows }, {
      onSuccess: res => {
        const parts = [`${res.transactions} opération${res.transactions > 1 ? 's' : ''}`];
        if (res.cashMovements) parts.push(`${res.cashMovements} mouvement${res.cashMovements > 1 ? 's' : ''}`);
        toast.success(`Import terminé : ${parts.join(' et ')}${res.skipped ? ` (${res.skipped} déjà présentes)` : ''}`);
        nav(`/portfolios/${portfolioId}`, { replace: true });
      },
      onError: (e: ApiError) => {
        const errors: Record<number, string> = {};
        e.fieldErrors?.forEach(f => { if (f.field.startsWith('row:')) errors[Number(f.field.slice(4))] = f.message; });
        setRowErrors(errors);
        const firstId = Object.keys(errors).map(Number)[0];
        if (firstId !== undefined) {
          const row = rows.find(r => r.id === firstId);
          if (row) setFilter(row.status);
          setTimeout(() => document.getElementById(`import-row-${firstId}`)?.scrollIntoView({ block: 'center' }), 50);
        }
        toast.error(e.message);
      },
    });
  };

  const title = portfolio.data ? `Importer · ${portfolio.data.name}` : 'Importer un relevé';

  return (
    <div className="space-y-4 pb-24 lg:max-w-3xl">
      <TopBar back title={title} right={<TourButton tour={TOURS.import} />} />

      {step === 'upload' && (
        <>
          <FileDrop onFile={onFile} loading={inspect.isPending || previewMutation.isPending}
            error={inspect.error?.message ?? previewMutation.error?.message} />
          <Card data-tour="import-where" className="p-4 space-y-2 text-xs text-muted-foreground">
            <p className="text-sm font-medium text-foreground flex items-center gap-2"><FileSpreadsheet size={16} /> Où trouver l'export ?</p>
            <p><span className="text-foreground">Fortuneo</span> : Bourse → Historique des opérations → Exporter (CSV).</p>
            <p><span className="text-foreground">Trade Republic</span> : Profil → Activité → Exporter les transactions.</p>
            <p><span className="text-foreground">Binance</span> : Portefeuille → Historique des transactions → Exporter.</p>
            <p>Le fichier est lu pour l'aperçu puis oublié : il n'est jamais conservé.</p>
          </Card>
        </>
      )}

      {step === 'mapping' && inspection && file && (
        <>
          <p className="text-sm text-muted-foreground">Format non reconnu : indique quelle colonne contient quoi.</p>
          <ColumnMappingForm inspection={inspection} loading={previewMutation.isPending}
            onSubmit={mapping => runPreview(file, 'GENERIC', mapping)} />
          {previewMutation.isError && <FormError message={previewMutation.error.message} />}
        </>
      )}

      {step === 'preview' && preview && file && (
        <>
          <Card className="p-4 flex-row items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate" title={file.name}>{file.name}</p>
              <p className="text-sm font-medium">{preview.format === 'GENERIC' ? 'Colonnes associées à la main' : `Relevé ${preview.formatLabel}`}</p>
            </div>
            <FormSelect className="w-44" value={preview.format} disabled={previewMutation.isPending}
              onChange={v => v === 'GENERIC' && inspection ? setStep('mapping') : runPreview(file, v as ImportFormat, null)}
              options={FORMAT_OPTIONS} />
          </Card>

          {needsCashTracking && (
            <Card className="p-4">
              <Switch checked={enableCash} onChange={onEnableCash} label="Importer les versements et retraits"
                description="Active le suivi des liquidités de ce portefeuille : son solde espèces entrera dans sa valeur." />
            </Card>
          )}

          <AssetMappingList assets={preview.assets.filter(a => needed.has(a.reference))} choices={choices}
            onChange={(ref, choice) => setChoices(c => ({ ...c, [ref]: choice }))} />

          <ImportRowsList rows={rows} selected={selected} isSelectable={isSelectable} onToggle={toggle}
            rowErrors={rowErrors} filter={filter} onFilter={setFilter} />

          <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 px-4">
            <Card className="mx-auto max-w-lg p-3 shadow-lg space-y-2">
              {commit.isPending && (
                <p className="text-xs text-muted-foreground">Import et recalcul de l'historique… cela peut prendre une minute.</p>
              )}
              {pendingAssets > 0 && !commit.isPending && (
                <p className="text-xs text-warning">Valide {pendingAssets} actif{pendingAssets > 1 ? 's' : ''} avant d'importer.</p>
              )}
              <Button className="w-full" disabled={selectedRows.length === 0 || pendingAssets > 0} loading={commit.isPending}
                onClick={onCommit}>
                Importer {selectedRows.length} ligne{selectedRows.length > 1 ? 's' : ''}
                {cashCount > 0 && ` (dont ${cashCount} mouvement${cashCount > 1 ? 's' : ''})`}
              </Button>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
