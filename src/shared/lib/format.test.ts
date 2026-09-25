import { describe, expect, it } from 'vitest';
import { formatEur, formatMoney, formatPercent, gainTone } from './format';

// Intl insère des espaces insécables (U+00A0, U+202F), couverts par \s : on les normalise
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('format', () => {
  it('formate les euros à la française', () => {
    expect(plain(formatEur(1234.5))).toBe('1 234,50 €');
  });

  it('affiche un tiret pour une valeur absente', () => {
    expect(formatEur(null)).toBe('—');
    expect(formatMoney(undefined, 'USD')).toBe('—');
    expect(formatPercent(null)).toBe('—');
  });

  it('interprète les pourcentages du back comme 12.34 = 12,34 %', () => {
    expect(plain(formatPercent(12.34))).toBe('12,34 %');
  });

  it('formate une devise étrangère', () => {
    expect(plain(formatMoney(10, 'USD'))).toBe('10,00 $US');
  });

  it('colore selon le signe', () => {
    expect(gainTone(5)).toBe('text-gain');
    expect(gainTone(-5)).toBe('text-loss');
    expect(gainTone(0)).toBe('text-muted-foreground');
  });
});
