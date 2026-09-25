import { useState } from 'react';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { DonutChart } from '@/shared/charts/DonutChart';
import { formatEur, formatPercent } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { ALLOCATION_COLOR, ALLOCATION_LABEL } from '@/shared/model/enums';
import type { AllocationSliceDTO } from '../model/dashboard.types';

/** Répartition : anneau + légende liés (survol de l'un = mise en avant dans l'autre). */
export function AllocationDonut({ slices }: { slices: AllocationSliceDTO[] }) {
  const [active, setActive] = useState<string | null>(null);
  const visible = slices.filter(s => s.value > 0);
  if (!visible.length) return null;
  const total = visible.reduce((s, x) => s + x.value, 0);
  const focus = visible.find(s => s.category === active);

  return (
    <section>
      <SectionHeader title="Répartition" />
      <Card className="p-4 flex-row items-center gap-5">
        <DonutChart size={132} thickness={13} activeKey={active} onHover={setActive}
          ariaLabel={visible.map(s => `${ALLOCATION_LABEL[s.category]} ${formatPercent(s.percentage)}`).join(', ')}
          slices={visible.map(s => ({ key: s.category, value: s.value, color: ALLOCATION_COLOR[s.category] }))}>
          <div className="px-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
              {focus ? ALLOCATION_LABEL[focus.category] : 'Total'}
            </p>
            <p className="text-sm font-semibold tabular-nums">{focus ? formatPercent(focus.percentage) : formatEur(total)}</p>
          </div>
        </DonutChart>
        <ul className="flex-1 min-w-0 space-y-1">
          {visible.map(s => (
            <li key={s.category} onPointerEnter={() => setActive(s.category)} onPointerLeave={() => setActive(null)}
              className={cn('flex items-center gap-2 rounded-lg px-1.5 py-1 text-xs transition-opacity',
                active && active !== s.category && 'opacity-40')}>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: ALLOCATION_COLOR[s.category] }} />
              <span className="flex-1 truncate">{ALLOCATION_LABEL[s.category]}</span>
              <span className="tabular-nums font-medium">{formatPercent(s.percentage)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
