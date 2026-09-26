import { formatPercent } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

export function PercentBadge({ value, className }: { value: number | null | undefined; className?: string }) {
  if (value == null) return null;
  const flat = Math.abs(value) < 0.005; // affiché « 0,00 % » : ni hausse ni baisse
  const up = value > 0;
  return (
    <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
      flat ? 'bg-muted text-muted-foreground' : up ? 'bg-gain/15 text-gain' : 'bg-loss/15 text-loss', className)}>
      {flat ? '' : up ? '▲ ' : '▼ '}{formatPercent(Math.abs(value))}
    </span>
  );
}