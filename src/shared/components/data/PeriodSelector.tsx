import { cn } from '@/shared/lib/cn';
import { DASHBOARD_PERIODS, PERIOD_LABEL, type DashboardPeriod } from '@/features/dashboard/model/dashboard.types';

export function PeriodSelector({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5">
      {DASHBOARD_PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-pressed={value === p}
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            value === p
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {PERIOD_LABEL[p]}
        </button>
      ))}
    </div>
  );
}
