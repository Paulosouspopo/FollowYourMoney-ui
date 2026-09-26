import { useState } from 'react';
import { Info } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { SegmentedControl } from '@/shared/ui/SegmentedControl';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import type { Exposure, Slice } from '../model/analysis.types';
import { flag, sliceLabel, formatShare } from '../model/labels';

type Tab = 'countries' | 'sectors' | 'currencies' | 'classes';
const TABS: { value: Tab; label: string }[] = [
  { value: 'countries', label: 'Pays' },
  { value: 'sectors', label: 'Secteurs' },
  { value: 'currencies', label: 'Devises' },
  { value: 'classes', label: 'Classes' },
];
const VISIBLE = 8;

/** Répartition par pays, secteur, devise ou classe d'actifs : barres horizontales. */
export function ExposureBreakdown({ exposure: e }: { exposure: Exposure }) {
  const [tab, setTab] = useState<Tab>('countries');
  const [all, setAll] = useState(false);
  const slices: Slice[] = e[tab];
  const shown = all ? slices : slices.slice(0, VISIBLE);
  const max = Math.max(...slices.map(s => s.pct), 1);

  return (
    <Card className="p-4 gap-4" data-tour="analysis-breakdown">
      <SegmentedControl<Tab> fullWidth value={tab} onChange={t => { setTab(t); setAll(false); }} options={TABS} />
      {slices.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Pas encore assez de lignes pour cette répartition.</p>
      ) : (
        <ul className="space-y-2.5">
          {shown.map(s => (
            <li key={s.key}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  {tab === 'countries' && <span className="mr-1.5" aria-hidden>{flag(s.key)}</span>}
                  {sliceLabel(tab, s.key, s.label)}
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-semibold">{formatShare(s.pct)}</span>
                  <MoneyValue value={s.valueEur} className="ml-2 text-xs text-muted-foreground" />
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(s.pct / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
      {slices.length > VISIBLE && (
        <button type="button" onClick={() => setAll(a => !a)} className="self-start text-xs text-primary">
          {all ? 'Afficher moins' : `Tout afficher (${slices.length})`}
        </button>
      )}
      <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
        <Info size={13} className="mt-px shrink-0" />
        <span>
        {tab === 'countries' || tab === 'sectors'
          ? <>Sur la partie actions (<MoneyValue value={e.equityEur} />), en regardant dans tes fonds.
            {tab === 'countries' && e.countryEstimatedPct > 0 && ` Pays des ETF estimés d'après leur indice (${formatShare(e.countryEstimatedPct)} des actions).`}</>
          : tab === 'currencies'
            ? 'Devise économique : celle du pays des entreprises, pas celle de la cotation (un ETF monde en euros reste surtout exposé au dollar).'
            : 'Tout ton patrimoine, fonds décomposés en actions, obligations et liquidités quand Yahoo le permet.'}
        </span>
      </p>
    </Card>
  );
}
