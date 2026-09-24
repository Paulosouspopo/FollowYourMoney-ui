import { useId } from 'react';
import { cn } from '@/shared/lib/cn';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  /** Libellé lu par les lecteurs d'écran mais non affiché (liste compacte). */
  labelHidden?: boolean;
}

/** Interrupteur accessible (role="switch") avec libellé et description. */
export function Switch({ checked, onChange, label, description, disabled, labelHidden }: Props) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className={cn(labelHidden && 'sr-only')}>
        <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
          checked ? 'bg-primary' : 'bg-muted-foreground/30')}>
        <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform',
          checked && 'translate-x-5')} />
      </button>
    </div>
  );
}
