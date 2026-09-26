import { useState } from 'react';
import { Check, PenLine, X } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatPercent } from '@/shared/lib/format';
import { toast } from '@/shared/ui/toast.store';
import { useSetFundFee } from '../api/analysis.api';
import type { Fees, FeeLine } from '../model/analysis.types';

/**
 * Ce que coûtent les placements : frais de courtage déjà payés, frais
 * courants des fonds (par an et sur 20 ans), détail par fonds. Frais inconnus
 * de Yahoo : l'utilisateur les renseigne (DIC du fonds).
 */
export function FeesCard({ fees: f }: { fees: Fees }) {
  return (
    <Card className="p-4 gap-4" data-tour="analysis-fees">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-[11px] text-muted-foreground">Frais des fonds, par an</p>
          <MoneyValue value={f.annualFundFeesEur} className="block text-lg font-semibold" />
          <p className="text-[11px] text-muted-foreground">
            {f.weightedTerPct != null ? `${formatPercent(f.weightedTerPct)} en moyenne` : 'frais inconnus'}
          </p>
        </div>
        <div className="rounded-xl bg-muted/50 p-3">
          <p className="text-[11px] text-muted-foreground">Sur 20 ans</p>
          <MoneyValue value={f.twentyYearCostEur} className="block text-lg font-semibold text-loss" />
          <p className="text-[11px] text-muted-foreground">de patrimoine en moins (à 5 %/an)</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Frais de courtage et de tenue de compte déjà payés : <MoneyValue value={f.brokerFeesPaidEur} className="font-medium text-foreground" />.
        {f.unknownValueEur > 0 && <> <MoneyValue value={f.unknownValueEur} /> placés dans des fonds aux frais inconnus : renseigne-les ci-dessous.</>}
      </p>
      {f.lines.length > 0 && (
        <ul className="divide-y divide-border">
          {f.lines.map(l => <FeeRow key={l.symbol} line={l} />)}
        </ul>
      )}
      <p className="text-[11px] text-muted-foreground">
        Les frais courants (TER) sont prélevés chaque jour dans la valeur du fonds : invisibles, mais bien réels. Ils figurent dans le DIC du fonds.
      </p>
    </Card>
  );
}

function FeeRow({ line: l }: { line: FeeLine }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(l.terPct != null ? String(l.terPct).replace('.', ',') : '');
  const save = useSetFundFee();
  const submit = (fee: number | null) => save.mutate({ symbol: l.symbol, annualFeePct: fee }, {
    onSuccess: () => { setEditing(false); toast.success(fee == null ? 'Frais de Yahoo rétablis' : 'Frais enregistrés'); },
    onError: e => toast.error(e.message),
  });
  const parsed = Number(value.replace(',', '.'));

  return (
    <li className="flex items-center gap-3 py-2.5 text-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{l.name}</p>
        <p className="text-[11px] text-muted-foreground"><MoneyValue value={l.valueEur} /></p>
      </div>
      {editing ? (
        <div className="flex items-center gap-1">
          <input value={value} onChange={e => setValue(e.target.value)} inputMode="decimal" placeholder="0,20" autoFocus
            aria-label={`Frais annuels de ${l.name} (%)`}
            className="h-8 w-16 rounded-lg border border-border bg-background px-2 text-right text-sm tabular-nums" />
          <span className="text-xs text-muted-foreground">%</span>
          <button type="button" aria-label="Enregistrer" disabled={!(parsed >= 0 && parsed <= 10) || value === '' || save.isPending}
            onClick={() => submit(parsed)} className="grid h-8 w-8 place-items-center rounded-full text-gain hover:bg-muted disabled:opacity-40">
            <Check size={15} />
          </button>
          <button type="button" aria-label="Annuler" onClick={() => setEditing(false)}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"><X size={15} /></button>
        </div>
      ) : (
        <>
          <div className="text-right">
            {l.terPct != null ? (
              <>
                <p className="font-medium tabular-nums">{formatPercent(l.terPct)}{l.userProvided && <span className="ml-1 text-[10px] text-muted-foreground">(saisi)</span>}</p>
                <p className="text-[11px] text-muted-foreground"><MoneyValue value={l.annualCostEur} /> / an</p>
              </>
            ) : <p className="text-xs text-warning">inconnus</p>}
          </div>
          <button type="button" onClick={() => setEditing(true)} aria-label={`Renseigner les frais de ${l.name}`}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <PenLine size={14} />
          </button>
          {l.userProvided && (
            <button type="button" onClick={() => submit(null)} className="text-[11px] text-primary">Yahoo</button>
          )}
        </>
      )}
    </li>
  );
}
