import { formatMonthYear } from '@/shared/lib/format';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { dateInMonths, monthsToReach, monthsUntil, requiredMonthly } from '../model/projection';
import type { Goal } from '../model/goal.types';

/**
 * Où mène le rythme actuel (versements programmés du périmètre, rendement
 * médian) : date d'atteinte, et effort mensuel nécessaire si l'échéance est
 * manquée.
 */
export function GoalVerdict({ goal, ratePct }: { goal: Goal; ratePct: number }) {
  if (goal.currentValueEur >= goal.targetAmount) {
    return <p className="text-xs font-medium text-gain">Atteint 🎉</p>;
  }
  const months = monthsToReach(goal.targetAmount, goal.currentValueEur, goal.monthlyContributionEur, ratePct);
  const deadline = goal.targetDate ? monthsUntil(goal.targetDate) : null;
  const onTime = months != null && (deadline == null || months <= deadline);

  return (
    <div className="space-y-0.5 text-xs">
      <p className={onTime ? 'text-gain' : 'text-warning'}>
        {months == null
          ? 'Au rythme actuel, jamais atteint : programme des versements.'
          : `Au rythme actuel : ${formatMonthYear(dateInMonths(months))}${deadline != null ? (onTime ? ', dans les temps' : ', après ton échéance') : ''}`}
      </p>
      {deadline != null && !onTime && deadline > 0 && (
        <p className="text-muted-foreground">
          Pour tenir l'échéance : <MoneyValue value={requiredMonthly(goal.targetAmount, goal.currentValueEur, ratePct, deadline)}
            className="font-medium text-foreground" /> par mois
          {goal.monthlyContributionEur > 0 && <> (aujourd'hui <MoneyValue value={goal.monthlyContributionEur} />)</>}
        </p>
      )}
    </div>
  );
}
