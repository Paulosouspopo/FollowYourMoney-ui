import { Link } from 'react-router-dom';
import { ChevronRight, Target } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { useGoals } from '../api/goal.api';

/** Accueil : l'objectif le plus avancé (non atteint), ou une invitation à simuler sa trajectoire. */
export function GoalsCard() {
  const { data: goals } = useGoals();
  if (!goals) return null;
  const goal = [...goals].filter(g => g.progressPct < 100).sort((a, b) => b.progressPct - a.progressPct)[0] ?? goals[0];

  return (
    <Link to="/goals" className="group block">
      <Card className="p-4 gap-2 transition-colors group-hover:ring-primary/40">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><Target size={18} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">{goal ? 'Objectif' : 'Et dans 10 ans ?'}</p>
            <p className="truncate text-sm font-semibold">{goal ? goal.name : 'Simule ta trajectoire et fixe-toi un cap'}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
        </div>
        {goal && (
          <div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${goal.progressPct}%` }} />
            </div>
            <p className="mt-1 flex justify-between text-[11px] text-muted-foreground tabular-nums">
              <span><MoneyValue value={goal.currentValueEur} /> sur <MoneyValue value={goal.targetAmount} /></span>
              <span>{Math.round(goal.progressPct)} %</span>
            </p>
          </div>
        )}
      </Card>
    </Link>
  );
}
