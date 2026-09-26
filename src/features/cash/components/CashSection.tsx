import { useState } from 'react';
import { Percent, Wallet } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { formatRate } from '@/shared/lib/format';
import type { PortfolioType } from '@/shared/model/enums';
import { cashLabel, hasEuroFund } from '@/shared/model/portfolioRules';
import type { CashBalance } from '@/features/dashboard/model/dashboard.types';
import { useCashMovements, useInterestEstimate } from '../api/cash.api';
import { CashMovementRow } from './CashMovementRow';
import { CashMovementFormSheet } from './CashMovementFormSheet';
import type { CashMovementPrefill, CashMovementResponse } from '../model/cash.types';

const PREVIEW_COUNT = 5;

interface Props {
  portfolioId: string;
  balance: number;
  portfolioType: PortfolioType;
  /** Soldes par devise (compte multidevise), vide sinon. */
  balances?: CashBalance[];
  multiCurrency?: boolean;
  /** Taux du livret ou du fonds euros : intérêts estimés. */
  annualInterestRate?: number | null;
}

/**
 * Solde de liquidités (fonds euros d'une assurance-vie, solde d'un livret…),
 * intérêts estimés et derniers mouvements ; un clic ouvre la modification.
 */
export function CashSection({ portfolioId, balance, portfolioType, balances = [], multiCurrency = false,
  annualInterestRate }: Props) {
  const isLivret = portfolioType === 'LIVRET';
  const q = useCashMovements(portfolioId);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<CashMovementResponse | null>(null);
  const [prefill, setPrefill] = useState<CashMovementPrefill | null>(null);
  const formProps = { portfolioId, balance, noOverdraft: isLivret, portfolioType, multiCurrency };

  return (
    <section data-tour="cash" className="space-y-2">
      {isLivret ? (
        <h2 className="text-sm font-semibold tracking-tight">Mouvements</h2>
      ) : (
        <Card className="p-4 gap-2">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-muted grid place-items-center shrink-0"><Wallet size={16} /></span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">
                {cashLabel(portfolioType)}
                {hasEuroFund(portfolioType) && annualInterestRate != null && <> · {formatRate(annualInterestRate)}</>}
              </p>
              <MoneyValue value={balance} colored={balance < 0} className="block font-semibold" />
            </div>
            {balance < 0 && (
              <p className="text-[11px] text-warning max-w-40 text-right">Solde négatif : saisis tes versements</p>
            )}
          </div>
          {balances.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pl-12" aria-label="Soldes par devise">
              {balances.map(b => (
                <li key={b.currency} className="rounded-full bg-muted px-2.5 py-1 text-[11px] tabular-nums">
                  <MoneyValue value={b.amount} currency={b.currency} personal colored={b.amount < 0} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
      {(isLivret || hasEuroFund(portfolioType)) && annualInterestRate != null && annualInterestRate > 0 && (
        <InterestHint portfolioId={portfolioId} onCredit={setPrefill} />
      )}
      <QueryBoundary query={q} skeleton={<ListSkeleton rows={2} />}>
        {list => list.length ? (
          <>
            <div className="divide-y divide-border">
              {(expanded ? list : list.slice(0, PREVIEW_COUNT)).map(m =>
                <CashMovementRow key={m.id} movement={m} onClick={() => setEditing(m)} />)}
            </div>
            {list.length > PREVIEW_COUNT && (
              <button type="button" onClick={() => setExpanded(e => !e)} className="text-xs text-primary">
                {expanded ? 'Afficher moins' : `Tout afficher (${list.length})`}
              </button>
            )}
          </>
        ) : <p className="text-sm text-muted-foreground py-3 text-center">Aucun versement ni retrait</p>}
      </QueryBoundary>
      <CashMovementFormSheet {...formProps} open={editing !== null} onClose={() => setEditing(null)}
        initial={editing ?? undefined} />
      <CashMovementFormSheet {...formProps} open={prefill !== null} onClose={() => setPrefill(null)}
        prefill={prefill ?? undefined} />
    </section>
  );
}

/**
 * Intérêts de l'année en cours (courus, estimés) et, s'ils n'ont pas été
 * saisis, ceux de l'an dernier à créditer en un geste.
 */
function InterestHint({ portfolioId, onCredit }: { portfolioId: string; onCredit: (p: CashMovementPrefill) => void }) {
  const year = new Date().getFullYear();
  const current = useInterestEstimate(portfolioId, year).data;
  const previous = useInterestEstimate(portfolioId, year - 1).data;
  const toCredit = previous && previous.estimatedEur > 0 && previous.creditedEur === 0 ? previous : null;
  if (!current && !toCredit) return null;

  return (
    <Card className="p-3.5 gap-2 bg-gain/5 ring-gain/20">
      {current && current.estimatedEur > 0 && (
        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Percent size={14} className="mt-px shrink-0 text-gain" />
          <span>
            Intérêts courus en {year} : <MoneyValue value={current.estimatedEur} className="font-medium text-foreground" />
            {' '}(estimation{current.method === 'QUINZAINE' ? ', règle des quinzaines' : ''}), crédités au 31 décembre.
          </span>
        </p>
      )}
      {toCredit && (
        <Button size="sm" variant="outline" className="self-start"
          onClick={() => onCredit({
            type: 'INTEREST', amount: toCredit.estimatedEur, movementDate: `${toCredit.year}-12-31`,
            notes: `Intérêts ${toCredit.year}`,
          })}>
          Créditer les intérêts {toCredit.year} (≈ <MoneyValue value={toCredit.estimatedEur} />)
        </Button>
      )}
    </Card>
  );
}
