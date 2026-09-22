import { cn } from "@/shared/lib/cn";

interface Props<T extends string> { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; }
export function SegmentedControl<T extends string>({ value, onChange, options }: Props<T>) {
  return (
    <div className="inline-flex rounded-xl bg-card p-1 border border-border">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            value === o.value ? 'bg-primary text-white' : 'text-muted')}>{o.label}</button>
      ))}
    </div>
  );
}
// PeriodSelector = <SegmentedControl options={DASHBOARD_PERIODS.map(p => ({ value: p, label: PERIOD_LABEL[p] }))} />