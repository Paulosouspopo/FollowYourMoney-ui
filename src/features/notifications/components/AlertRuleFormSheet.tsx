import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import { FormError } from '@/shared/ui/FormError';
import { FormSelect } from '@/shared/ui/form-select';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/toast.store';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import type { AssetSearchResult } from '@/features/assets/model/asset.types';
import { usePortfolios } from '@/features/portfolios/api/portfolio.api';
import { useDeleteAlertRule, useSaveAlertRule } from '../api/notification.api';
import {
  CONDITION_LABEL, PERIOD_LABEL, SCOPE_LABEL, isPercentage,
  type AlertCondition, type AlertPeriod, type AlertRule, type AlertScope,
} from '../model/notification.types';

const SCOPES: AlertScope[] = ['GLOBAL', 'PORTFOLIO', 'ASSET'];
const CONDITIONS: AlertCondition[] = ['FALLS', 'RISES', 'MOVES', 'ABOVE', 'BELOW'];
const PERIODS: AlertPeriod[] = ['DAY', 'WEEK', 'MONTH'];

interface Props { open: boolean; onClose: () => void; initial?: AlertRule; }

/** Monté uniquement quand la feuille est ouverte : chaque ouverture repart d'un état neuf. */
export function AlertRuleFormSheet(props: Props) {
  if (!props.open) return null;
  return <AlertRuleForm key={props.initial?.id ?? 'new'} {...props} />;
}

/**
 * Le « personnaliseur » : une phrase à compléter.
 * Quand [périmètre] [condition] [seuil] [période] → prévenir [app / email].
 */
function AlertRuleForm({ onClose, initial }: Props) {
  const portfolios = usePortfolios();
  const save = useSaveAlertRule();
  const remove = useDeleteAlertRule();

  const [scope, setScope] = useState<AlertScope>(initial?.scope ?? 'GLOBAL');
  const [portfolioId, setPortfolioId] = useState<string>(initial?.portfolioId ?? '');
  const [asset, setAsset] = useState<AssetSearchResult | null>(initial?.symbol
    ? { symbol: initial.symbol, name: initial.assetName ?? initial.symbol, exchange: null, assetType: 'ACTION' } : null);
  const [condition, setCondition] = useState<AlertCondition>(initial?.condition ?? 'FALLS');
  const [threshold, setThreshold] = useState<string>(initial ? String(initial.threshold) : '');
  const [period, setPeriod] = useState<AlertPeriod>(initial?.period ?? 'DAY');
  const [notifyEmail, setNotifyEmail] = useState(initial?.notifyEmail ?? false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const percent = isPercentage(condition);
  const value = Number(threshold.replace(',', '.'));
  const subject = scope === 'GLOBAL' ? 'mon patrimoine total'
    : scope === 'PORTFOLIO' ? (portfolios.data?.find(p => p.id === portfolioId)?.name ?? 'le portefeuille')
    : (asset?.symbol ?? "l'actif");
  const summary = `Quand ${subject} ${CONDITION_LABEL[condition].replace(' (hausse ou baisse)', '')} `
    + `${threshold || '…'} ${percent ? `% ${PERIOD_LABEL[period]}` : '€'}`;

  const submit = () => {
    if (scope === 'PORTFOLIO' && !portfolioId) return setError('Choisis le portefeuille');
    if (scope === 'ASSET' && !asset) return setError("Choisis l'actif");
    if (!(value > 0)) return setError('Indique un seuil positif');
    if (percent && value > 1000) return setError('Le seuil est en % (1000 maximum)');
    setError(null);
    save.mutate({
      id: initial?.id,
      body: {
        scope, portfolioId: scope === 'PORTFOLIO' ? portfolioId : null, symbol: scope === 'ASSET' ? asset!.symbol : null,
        condition, threshold: value, period: percent ? period : null, notifyEmail, enabled: initial?.enabled ?? true,
      },
    }, {
      onSuccess: () => { toast.success(initial ? 'Alerte modifiée' : 'Alerte créée'); onClose(); },
      onError: e => setError(e.message),
    });
  };

  return (
    <BottomSheet open onClose={onClose} title={initial ? "Modifier l'alerte" : 'Nouvelle alerte'}>
      <div className="space-y-4">
        <FormSelect label="Quand…" value={scope} onChange={v => setScope(v as AlertScope)}
          options={SCOPES.map(s => ({ value: s, label: SCOPE_LABEL[s] }))} />

        {scope === 'PORTFOLIO' && (
          <FormSelect label="Portefeuille" value={portfolioId} onChange={setPortfolioId}
            options={(portfolios.data ?? []).map(p => ({ value: p.id, label: p.name }))} />
        )}
        {scope === 'ASSET' && (
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Actif (détenu ou non)</span>
            <AssetSearchCombobox value={asset} onChange={setAsset} placeholder="Bitcoin, Apple, un ETF…" />
          </div>
        )}

        <FormSelect label="…" value={condition} onChange={v => setCondition(v as AlertCondition)}
          options={CONDITIONS.map(c => ({ value: c, label: CONDITION_LABEL[c] }))} />

        <div className="grid grid-cols-2 gap-3">
          <Input label={percent ? 'Seuil (%)' : 'Seuil (€)'} type="number" inputMode="decimal" step="any" min="0"
            placeholder={percent ? '3' : '50000'} value={threshold} onChange={e => setThreshold(e.target.value)} />
          {percent && (
            <FormSelect label="Période" value={period} onChange={v => setPeriod(v as AlertPeriod)}
              options={PERIODS.map(p => ({ value: p, label: PERIOD_LABEL[p] }))} />
          )}
        </div>

        <Switch checked={notifyEmail} onChange={setNotifyEmail} label="Recevoir aussi par email"
          description="La notification arrive toujours dans l'onglet Alertes." />

        <p className="rounded-xl bg-muted p-3 text-sm">{summary}</p>
        {scope !== 'ASSET' && percent && (
          <p className="text-xs text-muted-foreground">
            La variation est mesurée sur ta plus-value : un versement ou un achat ne déclenche pas de fausse hausse.
          </p>
        )}
        <FormError message={error ?? undefined} />

        <div className="flex gap-2">
          {initial && (
            <Button type="button" variant="destructive" aria-label="Supprimer l'alerte" onClick={() => setConfirmDelete(true)}><Trash2 size={18} /></Button>
          )}
          <Button className="flex-1" loading={save.isPending} onClick={submit}>{initial ? 'Enregistrer' : "Créer l'alerte"}</Button>
        </div>
      </div>
      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} title="Supprimer cette alerte ?" loading={remove.isPending}
        onConfirm={() => initial && remove.mutate(initial.id, {
          onSuccess: () => { toast.success('Alerte supprimée'); onClose(); },
          onError: e => toast.error(e.message),
        })} />
    </BottomSheet>
  );
}
