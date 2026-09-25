import { useMemo } from 'react';
import { Card } from '@/shared/ui/card';
import { formatPercent } from '@/shared/lib/format';
import { monthlyReturns } from '../model/calendar';
import { returnColor } from '../model/colors';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/** Calendrier des performances : une ligne par année, une case par mois, colorée selon le rendement. */
export function PerformanceCalendar({ series }: { series: { date: string; twrPct: number }[] }) {
  const years = useMemo(() => monthlyReturns(series), [series]);
  if (years.length === 0) return null;
  const short = (v: number) => `${v > 0 ? '+' : ''}${v.toLocaleString('fr-FR', { maximumFractionDigits: Math.abs(v) < 10 ? 1 : 0 })}`;

  return (
    <Card className="p-4 gap-2 overflow-x-auto" data-tour="analysis-calendar">
      <table className="w-full min-w-[520px] border-separate border-spacing-1 text-center text-[11px]">
        <thead>
          <tr className="text-muted-foreground">
            <th className="w-12" />
            {MONTHS.map((m, i) => <th key={i} className="font-medium" scope="col" aria-label={MONTH_NAMES[i]}>{m}</th>)}
            <th className="w-14 font-semibold" scope="col">Année</th>
          </tr>
        </thead>
        <tbody>
          {years.map(y => (
            <tr key={y.year}>
              <th scope="row" className="text-left text-xs font-semibold tabular-nums">{y.year}</th>
              {y.months.map((v, i) => (
                <td key={i} title={v == null ? undefined : `${MONTH_NAMES[i]} ${y.year} : ${formatPercent(v)}`}
                  className="h-8 rounded-md tabular-nums text-white"
                  style={{ background: v == null ? 'transparent' : returnColor(v * 2) }}>
                  {v == null ? '' : short(v)}
                </td>
              ))}
              <td className="rounded-md font-semibold tabular-nums"
                style={{ color: y.total == null ? undefined : y.total >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {y.total == null ? '—' : `${short(y.total)} %`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[11px] text-muted-foreground">Performance de tes placements mois par mois (en %), versements exclus.</p>
    </Card>
  );
}
