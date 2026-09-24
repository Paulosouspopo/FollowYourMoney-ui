import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/ui/card';
import { formatEur, formatPercent } from '@/shared/lib/format';
import { ALLOCATION_COLOR, ALLOCATION_LABEL } from '@/shared/model/enums';
import type { AllocationSliceDTO } from '../model/dashboard.types';

export function AllocationDonut({ slices }: { slices: AllocationSliceDTO[] }) {
  const visible = slices.filter(s => s.value > 0);
  if (!visible.length) return null;
  return (
    <Card className="p-4">
      <h2 className="text-sm font-medium mb-2">Répartition</h2>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={visible} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2} stroke="none">
              {/* Même couleur par type partout (donut, icônes, badges), liquidités comprises */}
              {visible.map(s => <Cell key={s.category} fill={ALLOCATION_COLOR[s.category]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex-1 space-y-1.5 text-sm">
          {visible.map(s => (
            <li key={s.category} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: ALLOCATION_COLOR[s.category] }} />
              <span className="flex-1 truncate">{ALLOCATION_LABEL[s.category]}</span>
              <span className="text-muted-foreground tabular-nums">{formatPercent(s.percentage)}</span>
              <span className="tabular-nums w-20 text-right">{formatEur(s.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
