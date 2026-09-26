// shared/ui/form-select.tsx
import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { cn } from '@/shared/lib/cn';

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  label?: string;
  error?: string;
  options: FormSelectOption[];
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  hint?: string;
}

export const FormSelect = React.forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ label, error, options, value, defaultValue, onChange, className, disabled, hint }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        {/* Radix renvoie '' quand la valeur change par programme (setValue) : jamais une vraie option */}
        <Select value={value} defaultValue={defaultValue} onValueChange={v => { if (v !== '') onChange?.(v); }} disabled={disabled}>
          <SelectTrigger ref={ref} className={cn('w-full', error && 'border-destructive', className)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);
FormSelect.displayName = 'FormSelect';