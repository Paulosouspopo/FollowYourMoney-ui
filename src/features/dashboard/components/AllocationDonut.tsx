import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/shared/ui/card';
import { formatEur, formatPercent } from '@/shared/lib/format';
import type { AllocationSliceDTO } from '../model/dashboard.types';

const PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6'];

export function AllocationDonut({ slices }: { slices: AllocationSliceDTO[] }) {
  if (!slices.length) return null;
  return (
    <Card className="p-4">
      <h2 className="text-sm font-medium mb-2">Répartition</h2>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={slices} dataKey="value" innerRadius={40} outerRadius={56} paddingAngle={2} stroke="none">
              {slices.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex-1 space-y-1.5 text-sm">
          {slices.map((s, i) => (
            <li key={s.assetType} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="flex-1 truncate">{s.label}</span>
              <span className="text-muted-foreground tabular-nums">{formatPercent(s.percentage)}</span>
              <span className="tabular-nums w-20 text-right">{formatEur(s.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}