import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatEur, formatMoney, setDisplayCurrency } from '@/shared/lib/format';
import { MoneyValue } from '@/shared/components/data/MoneyValue';

const plain = (s: string | null) => (s ?? '').replace(/\s/g, ' ');

describe("devise d'affichage", () => {
  afterEach(() => setDisplayCurrency('EUR', 1));

  it('convertit les montants EUR au taux du jour', () => {
    setDisplayCurrency('USD', 1.1);
    expect(plain(formatEur(1000))).toBe('1 100,00 $US');
  });

  it("laisse tels quels les montants d'une devise explicite (cours, saisie)", () => {
    setDisplayCurrency('USD', 1.1);
    expect(plain(formatMoney(1000, 'EUR'))).toBe('1 000,00 €');
    render(<><MoneyValue value={-50} /><MoneyValue value={200} currency="EUR" /></>);
    expect(plain(screen.getByText(/55/).textContent)).toBe('−55,00 $US');
    expect(plain(screen.getByText(/200/).textContent)).toBe('200,00 €');
  });
});
