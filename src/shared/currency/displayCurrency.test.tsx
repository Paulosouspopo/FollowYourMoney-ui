import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MASK, formatEur, formatMoney, formatPercent, formatPrivateMoney, formatQty, setAmountsHidden, setDisplayCurrency } from '@/shared/lib/format';
import { MoneyValue } from '@/shared/components/data/MoneyValue';

const plain = (s: string | null) => (s ?? '').replace(/\s/g, ' ');

describe("devise d'affichage", () => {
  afterEach(() => { setDisplayCurrency('EUR', 1); setAmountsHidden(false); });

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

  it('mode confidentialité : montants et quantités masqués, pourcentages et cours visibles', () => {
    setAmountsHidden(true);
    expect(formatEur(12345)).toBe(MASK);
    expect(formatPrivateMoney(900, 'USD')).toBe(MASK);
    expect(formatQty(15)).toBe(MASK);
    expect(plain(formatPercent(12.5))).toBe('12,50 %');
    expect(plain(formatMoney(99.14, 'EUR'))).toBe('99,14 €'); // cours d'un actif
    render(<MoneyValue value={250} signed />);
    expect(screen.getByText(`+${MASK}`)).toBeInTheDocument();
  });
});
