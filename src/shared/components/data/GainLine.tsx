import { cn } from '@/shared/lib/cn';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { PercentBadge } from '@/shared/components/data/PercentBadge';

export function GainLine({ amount, pct, size = 'sm' }: { amount: number; pct: number; size?: 'sm' | 'xs' }) {
  return (
    <span className={cn('flex items-center gap-1.5', size === 'xs' ? 'text-xs' : 'text-sm')}>
      <MoneyValue value={amount} signed colored className="font-medium" />
      <PercentBadge value={pct} />
    </span>
  );
}