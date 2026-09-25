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
  CONDITIONS_BY_SCOPE, CONDITION_LABEL, PERIOD_LABEL, SCOPE_LABEL, hasThreshold, isExtreme, isPercentage,
  isVariation, needsHolding, periodsFor,
  type AlertCondition, type AlertPeriod, type AlertRule, type AlertScope,
} from '../model/notification.types';

const SCOPES: AlertScope[] = ['GLOBAL', 'PORTFOLIO', 'ASSET'];

/** Valeurs de départ d'une nouvelle alerte (ex : depuis la fiche d'un actif). */
export interface AlertPreset {
  scope?: AlertScope; portfolioId?: string; condition?: AlertCondition;
  asset?: AssetSearchResult; period?: AlertPeriod;
}

interface Props { open: boolean; onClose: () => void; initial?: AlertRule; preset?: AlertPreset; }

/** Monté uniquement quand la feuille est ouverte : chaque ouverture repart d'un état neuf. */
export function AlertRuleFormSheet(props: Props) {
  if (!props.open) return null;
  return <AlertRuleForm key={props.initial?.id ?? 'new'} {...props} />;
}

const defaultPeriod = (c: AlertCondition): AlertPeriod => (isExtreme(c) ? 'YEAR' : 'DAY');

/**
 * Le « personnaliseur » : une phrase à compléter.
 * Quand [périmètre] [condition] [seuil] [période] → prévenir [app / push / email].
 */
function AlertRuleForm({ onClose, initial, preset }: Props) {
  const portfolios = usePortfolios();
  const save = useSaveAlertRule();
  const remove = useDeleteAlertRule();

  const [scope, setScope] = useState<AlertScope>(initial?.scope ?? preset?.scope ?? 'GLOBAL');
  const [portfolioId, setPortfolioId] = useState<string>(initial?.portfolioId ?? preset?.portfolioId ?? '');
  const [asset, setAsset] = useState<AssetSearchResult | null>(initial?.symbol
    ? { symbol: initial.symbol, name: initial.assetName ?? initial.symbol, exchange: null, assetType: 'ACTION' }
    : preset?.asset ?? null);
  const [condition, setCondition] = useState<AlertCondition>(initial?.condition ?? preset?.condition ?? 'FALLS');
  const [threshold, setThreshold] = useState<string>(initial && hasThreshold(initial.condition) ? String(initial.threshold) : '');
  const [period, setPeriod] = useState<AlertPeriod>(initial?.period ?? preset?.period ?? defaultPeriod(condition));
  const [label, setLabel] = useState(initial?.label ?? '');
  const [notifyPush, setNotifyPush] = useState(initial?.notifyPush ?? true);
  const [notifyEmail, setNotifyEmail] = useState(initial?.notifyEmail ?? false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const conditions = CONDITIONS_BY_SCOPE[scope];
  const changeScope = (s: AlertScope) => {
    setScope(s);
    if (!CONDITIONS_BY_SCOPE[s].includes(condition)) setCondition('FALLS');
  };
  const changeCondition = (c: AlertCondition) => {
    setCondition(c);
    if (!periodsFor(c).includes(period)) setPeriod(defaultPeriod(c));
  };

  const percent = isPercentage(condition);
  const withThreshold = hasThreshold(condition);
  const periods = periodsFor(condition);
  const value = Number(threshold.replace(',', '.'));
  const max = condition === 'WEIGHT_ABOVE' ? 100 : 1000;
  const subject = scope === 'GLOBAL' ? 'mon patrimoine total'
    : scope === 'PORTFOLIO' ? (portfolios.data?.find(p => p.id === portfolioId)?.name ?? 'le portefeuille')
    : (asset?.symbol ?? "l'actif");
  const summary = [
    'Quand', subject, CONDITION_LABEL[condition].replace(/ \(.*\)$/, ''),
    withThreshold ? `${threshold || '…'} ${percent ? '%' : '€'}` : '',
    periods.length ? PERIOD_LABEL[period] : '',
  ].filter(Boolean).join(' ');

  const submit = () => {
    if (scope === 'PORTFOLIO' && !portfolioId) return setError('Choisis le portefeuille');
    if (scope === 'ASSET' && !asset) return setError("Choisis l'actif");
    if (withThreshold && !(value > 0)) return setError('Indique un seuil positif');
    if (withThreshold && percent && value > max) return setError(`Le seuil est en % (${max} maximum)`);
    setError(null);
    save.mutate({
      id: initial?.id,
      body: {
        scope, portfolioId: scope === 'PORTFOLIO' ? portfolioId : null, symbol: scope === 'ASSET' ? asset!.symbol : null,
        condition, threshold: withThreshold ? value : null, period: periods.length ? period : null,
        notifyEmail, notifyPush, enabled: initial?.enabled ?? true,
        label: label.trim() || null, mutedUntil: initial?.mutedUntil ?? null,
      },
    }, {
      onSuccess: () => { toast.success(initial ? 'Alerte modifiée' : 'Alerte créée'); onClose(); },
      onError: e => setError(e.message),
    });
  };

  return (
    <BottomSheet open onClose={onClose} title={initial ? "Modifier l'alerte" : 'Nouvelle alerte'}>
      <div className="space-y-4">
        <FormSelect label="Quand…" value={scope} onChange={v => changeScope(v as AlertScope)}
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

        <FormSelect label="…" value={condition} onChange={v => changeCondition(v as AlertCondition)}
          options={conditions.map(c => ({ value: c, label: CONDITION_LABEL[c] }))} />

        {(withThreshold || periods.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {withThreshold && (
              <Input label={percent ? 'Seuil (%)' : 'Seuil (€)'} type="number" inputMode="decimal" step="any" min="0"
                placeholder={percent ? (condition === 'WEIGHT_ABOVE' ? '25' : '3') : '50000'}
                value={threshold} onChange={e => setThreshold(e.target.value)} />
            )}
            {periods.length > 0 && (
              <FormSelect label="Période" value={period} onChange={v => setPeriod(v as AlertPeriod)}
                options={periods.map(p => ({ value: p, label: PERIOD_LABEL[p] }))} />
            )}
          </div>
        )}

        <Input label="Nom (facultatif)" placeholder="Ex : Achat BTC sous 50 k" maxLength={100}
          value={label} onChange={e => setLabel(e.target.value)} />

        <div className="space-y-3 rounded-xl border border-border p-3">
          <Switch checked={notifyPush} onChange={setNotifyPush} label="Notification push"
            description="Sur les appareils où tu as activé les notifications (Réglages)." />
          <Switch checked={notifyEmail} onChange={setNotifyEmail} label="Email" />
          <p className="text-[11px] text-muted-foreground">La notification arrive toujours dans l'onglet Alertes.</p>
        </div>

        <p className="rounded-xl bg-muted p-3 text-sm">{summary}</p>
        {scope !== 'ASSET' && isVariation(condition) && (
          <p className="text-xs text-muted-foreground">
            La variation est mesurée sur ta plus-value : un versement ou un achat ne déclenche pas de fausse hausse.
          </p>
        )}
        {scope === 'ASSET' && needsHolding(condition) && (
          <p className="text-xs text-muted-foreground">Mesuré sur tes positions : sans ligne détenue, l'alerte attend.</p>
        )}
        {isExtreme(condition) && (
          <p className="text-xs text-muted-foreground">Comparé aux clôtures de la période, au plus une fois par jour.</p>
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
