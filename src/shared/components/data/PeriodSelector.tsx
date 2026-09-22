import { cn } from '@/shared/lib/cn';

export type Period = '7d' | '30d' | '90d' | '1y' | 'all';

const OPTIONS: { value: Period; label: string }[] = [
  { value: '7d', label: '7J' },
  { value: '30d', label: '1M' },
  { value: '90d', label: '3M' },
  { value: '1y', label: '1A' },
  { value: 'all', label: 'Tout' },
];

export function PeriodSelector({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}