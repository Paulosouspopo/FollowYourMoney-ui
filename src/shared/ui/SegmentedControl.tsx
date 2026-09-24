import { cn } from "@/shared/lib/cn";

interface Props<T extends string> {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
  /** Occupe toute la largeur, segments de taille égale (formulaires). */
  fullWidth?: boolean;
}
export function SegmentedControl<T extends string>({ value, onChange, options, fullWidth = false }: Props<T>) {
  return (
    <div className={cn('rounded-xl bg-muted p-1', fullWidth ? 'flex w-full' : 'inline-flex')} role="group">
      {options.map(o => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value}
          className={cn('px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            fullWidth && 'flex-1 py-2 text-sm',
            value === o.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{o.label}</button>
      ))}
    </div>
  );
}
