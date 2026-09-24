import { AlertTriangle, ArrowDownLeft, CalendarClock, Pause } from 'lucide-react';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { formatDate } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { PLAN_FREQUENCY_LABEL, type PlanResponse } from '../model/plan.types';

/** Une ligne de plan : quoi, combien, quand ; état (pause, terminé, problème). */
export function PlanRow({ plan: p, onClick, showPortfolio = false }: { plan: PlanResponse; onClick?: () => void; showPortfolio?: boolean }) {
  const Icon = p.type === 'DEPOSIT' ? ArrowDownLeft : CalendarClock;
  const status = !p.active ? 'En pause'
    : p.nextExecutionDate ? `Prochaine le ${formatDate(p.nextExecutionDate)}` : 'Terminé';
  return (
    <button type="button" onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left -mx-2 px-2 rounded-xl active:bg-muted/60">
      <span className={cn('h-9 w-9 rounded-full grid place-items-center shrink-0',
        p.active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
        {p.active ? <Icon size={16} /> : <Pause size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">
          {p.type === 'DEPOSIT' ? 'Versement' : p.name}{showPortfolio && ` · ${p.portfolioName}`}
        </p>
        <p className="text-xs text-muted-foreground truncate">{PLAN_FREQUENCY_LABEL[p.frequency]} · {status}</p>
        {p.lastError && (
          <p className="text-[11px] text-warning flex items-start gap-1 mt-0.5"><AlertTriangle size={11} className="shrink-0 mt-px" />{p.lastError}</p>
        )}
      </div>
      <MoneyValue value={p.amount} className="text-sm font-medium shrink-0" />
    </button>
  );
}
