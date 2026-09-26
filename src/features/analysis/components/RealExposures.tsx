import { Layers, TriangleAlert } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import type { Exposure } from '../model/analysis.types';
import { formatShare } from '../model/labels';

/** Concentration : la plus grosse ligne et les entreprises auxquelles l'argent est le plus exposé (fonds compris). */
export function RealExposures({ exposure: e }: { exposure: Exposure }) {
  const concentrated = e.largestLinePct >= 25;
  return (
    <Card className="p-4 gap-3" data-tour="analysis-concentration">
      {e.largestLineName && (
        <p className={concentrated ? 'flex items-start gap-2 text-sm text-warning' : 'flex items-start gap-2 text-sm text-muted-foreground'}>
          {concentrated ? <TriangleAlert size={15} className="mt-0.5 shrink-0" /> : <Layers size={15} className="mt-0.5 shrink-0" />}
          <span>
            Ta plus grosse ligne, <span className="font-medium text-foreground">{e.largestLineName}</span>, pèse{' '}
            <span className="font-semibold text-foreground">{formatShare(e.largestLinePct)}</span> de ton patrimoine
            {concentrated ? ' : si elle chute, tout ton patrimoine le sent.' : '.'}
          </span>
        </p>
      )}
      {e.topExposures.length > 0 && (
        <>
          <p className="text-xs font-medium text-muted-foreground">Tes plus grosses expositions réelles</p>
          <ol className="space-y-1.5">
            {e.topExposures.map((x, i) => (
              <li key={`${x.symbol ?? x.name}-${i}`} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  {x.name}
                  {x.viaFunds && <span className="ml-1.5 rounded bg-primary/12 px-1 text-[10px] text-primary">via tes fonds</span>}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatShare(x.pct)}</span>
                <MoneyValue value={x.valueEur} className="w-24 text-right font-medium" />
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-muted-foreground">
            Actions détenues en direct + les 10 premières lignes de chaque fonds quand Yahoo les publie.
          </p>
        </>
      )}
    </Card>
  );
}
