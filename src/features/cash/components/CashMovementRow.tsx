import { ArrowDownLeft, ArrowUpRight, Percent, Receipt } from 'lucide-react';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { EditHint } from '@/shared/ui/EditHint';
import { CASH_MOVEMENT_LABEL, CASH_MOVEMENT_SIGN } from '@/shared/model/enums';
import { formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import type { CashMovementResponse } from '../model/cash.types';

const ICON = { DEPOSIT: ArrowDownLeft, WITHDRAWAL: ArrowUpRight, INTEREST: Percent, FEE: Receipt } as const;
const TONE = {
  DEPOSIT: 'bg-primary/15 text-primary', WITHDRAWAL: 'bg-muted text-muted-foreground',
  INTEREST: 'bg-gain/15 text-gain', FEE: 'bg-loss/15 text-loss',
} as const;

export function CashMovementRow({ movement: m, onClick }: { movement: CashMovementResponse; onClick?: () => void }) {
  const Icon = ICON[m.type];
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      aria-label={onClick ? `Modifier : ${CASH_MOVEMENT_LABEL[m.type]} du ${formatDate(m.movementDate)}` : undefined}
      className="group w-full flex items-center gap-3 py-3 text-left -mx-2 px-2 rounded-xl hover:bg-muted/50 active:bg-muted/60 transition-colors disabled:cursor-default">
      <span className={cn('h-9 w-9 rounded-full grid place-items-center shrink-0', TONE[m.type])}><Icon size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{CASH_MOVEMENT_LABEL[m.type]}</p>
        <p className="text-xs text-muted-foreground truncate">{formatDate(m.movementDate)}{m.notes && ` · ${m.notes}`}</p>
      </div>
      <MoneyValue value={CASH_MOVEMENT_SIGN[m.type] * m.amount} signed colored className="text-sm font-medium shrink-0" />
      {onClick && <EditHint />}
    </button>
  );
}
