import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { formatMoney, formatShortDate } from '@/shared/lib/format';
import type { CurvePointDTO } from '@/features/dashboard/model/dashboard.types';

/** `currency` : devise des montants de la courbe (déjà convertis par le back). */
export function EvolutionChart({ points, currency = 'EUR' }: { points: CurvePointDTO[]; currency?: string }) {
  if (points.length < 2) {
    return (
      <Card className="p-0">
        <EmptyState
          title="Pas encore d'historique"
          description={points.length === 0
            ? 'La courbe apparaîtra après ta première transaction.'
            : "Une seule journée pour l'instant : la courbe se dessine dès demain, ou tout de suite si tu saisis une opération plus ancienne."}
        />
      </Card>
    );
  }

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
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false} tickLine={false} minTickGap={32} />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: 'var(--popover)', color: 'var(--popover-foreground)', border: '1px solid var(--border)', borderRadius: 12 }}
            itemStyle={{ color: 'var(--popover-foreground)' }}
            formatter={(v, name) => [formatMoney(Number(v ?? 0), currency), name === 'value' ? 'Valeur' : 'Investi']}
            labelFormatter={(l) => formatShortDate(String(l))}
          />
          <Area type="monotone" dataKey="invested" stroke="var(--muted-foreground)" strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" fill="url(#fym-area)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary rounded" /> Valeur</span>
        <span className="flex items-center gap-1.5"><span className="h-0 w-4 border-t border-dashed border-muted-foreground" /> Investi</span>
      </div>
    </Card>
  );
}
