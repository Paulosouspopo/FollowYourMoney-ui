import { ArrowDownLeft, ArrowUpRight, Coins } from 'lucide-react';
import { EditHint } from '@/shared/ui/EditHint';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { TRANSACTION_TYPE_LABEL } from '@/shared/model/enums';
import { formatDate, formatMoney, formatQty } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import type { TransactionResponse } from '../model/transaction.types';

const ICON = { BUY: ArrowDownLeft, SELL: ArrowUpRight, DIVIDEND: Coins } as const;
const TONE = { BUY: 'bg-primary/15 text-primary', SELL: 'bg-loss/15 text-loss', DIVIDEND: 'bg-gain/15 text-gain' } as const;

export function TransactionRow({ tx, onClick, showAsset = false }: { tx: TransactionResponse; onClick?: () => void; showAsset?: boolean }) {
  const Icon = ICON[tx.type];
  // Sortie de cash pour un achat, entrée pour vente/dividende → signe cohérent partout
  const cashFlow = tx.type === 'BUY' ? -(tx.totalAmountEur + tx.feesEur) : tx.totalAmountEur - tx.feesEur;

  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      aria-label={onClick ? `Modifier : ${TRANSACTION_TYPE_LABEL[tx.type]} ${tx.symbol} du ${formatDate(tx.transactionDate)}` : undefined}
      className="group w-full flex items-center gap-3 py-3 text-left -mx-2 px-2 rounded-xl hover:bg-muted/50 active:bg-muted/60 transition-colors disabled:cursor-default">
      <span className={cn('h-9 w-9 rounded-full grid place-items-center shrink-0', TONE[tx.type])}><Icon size={16} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {TRANSACTION_TYPE_LABEL[tx.type]}{showAsset && ` · ${tx.symbol}`}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(tx.transactionDate)}
          {tx.type !== 'DIVIDEND' && ` · ${formatQty(tx.quantity)} × ${formatMoney(tx.pricePerUnit, tx.currency)}`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <MoneyValue value={cashFlow} signed colored className="block text-sm font-medium" />
        {tx.currency !== 'EUR' && <span className="text-[11px] text-muted-foreground"><MoneyValue value={tx.totalAmount} currency={tx.currency} /></span>}
      </div>
      {onClick && <EditHint />}
    </button>
  );
}