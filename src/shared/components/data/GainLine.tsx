import { cn } from '@/shared/lib/cn';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { PercentBadge } from '@/shared/components/data/PercentBadge';

/** @param label précise la nature du gain (« latent ») quand plusieurs gains se côtoient */
export function GainLine({ amount, pct, size = 'sm', label }: { amount: number; pct: number; size?: 'sm' | 'xs'; label?: string }) {
  return (
    <span className={cn('flex items-center gap-1.5', size === 'xs' ? 'text-xs' : 'text-sm')}>
      <MoneyValue value={amount} signed colored className="font-medium" />
      <PercentBadge value={pct} />
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  );
}