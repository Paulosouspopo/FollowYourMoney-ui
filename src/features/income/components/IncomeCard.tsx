import { Link } from 'react-router-dom';
import { ChevronRight, Coins } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatShortDate } from '@/shared/lib/format';
import { useIncome } from '../api/income.api';

/** Accueil : « tes placements te versent X € par mois », prochain versement. Masquée s'il n'y a rien. */
export function IncomeCard() {
  const { data } = useIncome();
  if (!data || (data.annualProjectedEur === 0 && data.receivedLast12mEur === 0)) return null;
  const next = data.upcoming[0];
  return (
    <Link to="/income" className="group block">
      <Card className="p-4 flex-row items-center gap-3 transition-colors group-hover:ring-primary/40">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gain/15 text-gain"><Coins size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Revenus passifs attendus</p>
          <p className="text-base font-semibold tracking-tight">
            <MoneyValue value={data.monthlyProjectedEur} /> <span className="text-sm font-normal text-muted-foreground">/ mois</span>
          </p>
          {next && (
            <p className="truncate text-[11px] text-muted-foreground">
              Prochain : {next.name} · {formatShortDate(next.date)} · <MoneyValue value={next.amountEur} />
            </p>
          )}
        </div>
        <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
      </Card>
    </Link>
  );
}
