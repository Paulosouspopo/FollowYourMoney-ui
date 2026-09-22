import { formatEur, formatMoney, gainTone } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

interface Props { value: number | null | undefined; currency?: string; signed?: boolean; colored?: boolean; className?: string; }
export function MoneyValue({ value, currency = 'EUR', signed, colored, className }: Props) {
  if (value == null) return <span className={cn('text-muted-foreground', className)}>—</span>;
  const text = currency === 'EUR' ? formatEur(Math.abs(value)) : formatMoney(Math.abs(value), currency);
  const sign = signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : (value < 0 ? '−' : '');
  return <span className={cn('tabular-nums', colored && gainTone(value), className)}>{sign}{text}</span>;
}