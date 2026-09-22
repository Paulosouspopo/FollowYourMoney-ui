import { formatPercent } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export function PercentBadge({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
      up ? 'bg-gain/15 text-gain' : 'bg-loss/15 text-loss', className)}>
      {up ? '▲' : '▼'} {formatPercent(Math.abs(value))}
    </span>
  );
}