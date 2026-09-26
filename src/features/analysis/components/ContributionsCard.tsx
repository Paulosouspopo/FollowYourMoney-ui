import { Link } from 'react-router-dom';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatPercent } from '@/shared/lib/format';
import type { ContributionReport } from '../model/analysis.types';

const COUNT = 5;

/** « Qui a fait ta performance » : les lignes qui ont le plus rapporté, et celles qui ont coûté. */
export function ContributionsCard({ report, periodLabel }: { report: ContributionReport; periodLabel: string }) {
  const winners = report.lines.filter(l => l.gainEur > 0).slice(0, COUNT);
  const losers = report.lines.filter(l => l.gainEur < 0).slice(-COUNT).reverse();
  const max = Math.max(...report.lines.map(l => Math.abs(l.gainEur)), 1);
  // Même actif dans plusieurs portefeuilles : le nom du portefeuille les distingue
  const names = report.lines.map(l => l.name);
  const repeated = new Set(names.filter((n, i) => names.indexOf(n) !== i));

  const Row = ({ l }: { l: ContributionReport['lines'][number] }) => (
    <li>
      <Link to={`/portfolios/${l.portfolioId}/positions/${encodeURIComponent(l.symbol)}`} className="block rounded-lg px-1 py-1 hover:bg-muted/50">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="min-w-0 truncate">
            {l.name}
            {repeated.has(l.name) && <span className="ml-1.5 text-xs text-muted-foreground">· {l.portfolioName}</span>}
          </span>
          <span className="shrink-0">
            <MoneyValue value={l.gainEur} signed colored className="font-semibold" />
            {l.dataSuspect
              ? <span className="ml-1.5 text-xs text-warning" title="Division d'actions probable : cours à vérifier dans « Saisies à vérifier »">à vérifier</span>
              : l.returnPct != null && <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">{formatPercent(l.returnPct)}</span>}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={l.gainEur >= 0 ? 'h-full rounded-full bg-positive' : 'h-full rounded-full bg-negative'}
            style={{ width: `${(Math.abs(l.gainEur) / max) * 100}%` }} />
        </div>
      </Link>
    </li>
  );

  return (
    <Card className="p-4 gap-4" data-tour="analysis-contributions">
      <p className="text-sm text-muted-foreground">
        {periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}, tes lignes ont rapporté{' '}
        <MoneyValue value={report.gainEur} signed colored className="font-semibold" /> (plus-values, dividendes, frais déduits).
      </p>
      {winners.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gain">Ce qui a porté</p>
          <ul className="space-y-1">{winners.map(l => <Row key={l.assetId} l={l} />)}</ul>
        </div>
      )}
      {losers.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-loss">Ce qui a pesé</p>
          <ul className="space-y-1">{losers.map(l => <Row key={l.assetId} l={l} />)}</ul>
        </div>
      )}
      {winners.length + losers.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">Rien n'a bougé sur la période.</p>
      )}
    </Card>
  );
}
