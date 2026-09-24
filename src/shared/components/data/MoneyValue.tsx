import { formatEur, formatMoney, gainTone } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

/**
 * Sans `currency` : montant EUR, affiché dans la devise d'affichage.
 * Avec `currency` : montant dans cette devise, affiché tel quel (cours, saisie).
 */
interface Props { value: number | null | undefined; currency?: string; signed?: boolean; colored?: boolean; className?: string; }
export function MoneyValue({ value, currency, signed, colored, className }: Props) {
  if (value == null) return <span className={cn('text-muted-foreground', className)}>—</span>;
  const text = currency == null ? formatEur(Math.abs(value)) : formatMoney(Math.abs(value), currency);
  const sign = signed ? (value > 0 ? '+' : value < 0 ? '−' : '') : (value < 0 ? '−' : '');
  return <span className={cn('tabular-nums', colored && gainTone(value), className)}>{sign}{text}</span>;
}