import { ArrowDownLeft, ArrowUpRight, Percent, Receipt } from 'lucide-react';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
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
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left -mx-2 px-2 rounded-xl active:bg-muted/60">
      <span className={cn('h-9 w-9 rounded-full grid place-items-center shrink-0', TONE[m.type])}><Icon size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{CASH_MOVEMENT_LABEL[m.type]}</p>
        <p className="text-xs text-muted-foreground truncate">{formatDate(m.movementDate)}{m.notes && ` · ${m.notes}`}</p>
      </div>
      <MoneyValue value={CASH_MOVEMENT_SIGN[m.type] * m.amount} signed colored className="text-sm font-medium shrink-0" />
    </button>
  );
}
