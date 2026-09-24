import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { formatEur, formatShortDate } from '@/shared/lib/format';
import type { CurvePointDTO } from '@/features/dashboard/model/dashboard.types';

export function EvolutionChart({ points }: { points: CurvePointDTO[] }) {
  if (points.length < 2) return <EmptyState title="Pas encore d'historique" description="La courbe apparaîtra dès qu'il y aura au moins deux jours d'historique." />;

  const data = points.map(p => ({
    date: p.date,
    value: p.totalValueEur,
    invested: p.totalInvestedEur,
  }));

  return (
    <Card className="p-4">
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="fym-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={32} />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}
            formatter={(v, name) => [formatEur(Number(v ?? 0)), name === 'value' ? 'Valeur' : 'Investi']}
            labelFormatter={(l) => formatShortDate(String(l))}
          />
          <Area type="monotone" dataKey="invested" stroke="var(--muted-foreground)" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#fym-area)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}