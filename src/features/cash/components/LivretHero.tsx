import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatRate } from '@/shared/lib/format';
import type { PortfolioValuation } from '@/features/dashboard/model/dashboard.types';

/** En-tête d'un livret : le solde, le taux affiché et les intérêts cumulés. */
export function LivretHero({ portfolio: p }: { portfolio: PortfolioValuation }) {
  return (
    <Card className="p-5 bg-linear-to-br from-card to-primary/10">
      <p className="text-sm text-muted-foreground">
        Solde{p.annualInterestRate != null && ` · taux ${formatRate(p.annualInterestRate)}`}
      </p>
      <MoneyValue value={p.currentValueEur} className="block text-4xl font-semibold tracking-tight mt-1" />
      <p className="mt-3 text-sm">
        <MoneyValue value={p.interestEur} signed colored className="font-medium" />
        <span className="text-muted-foreground"> d'intérêts perçus</span>
      </p>
    </Card>
  );
}
