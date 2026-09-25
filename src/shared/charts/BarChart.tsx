import { useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface Bar {
  key: string;
  /** Libellé sous la barre (affiché une fois sur `labelEvery`). */
  label: string;
  /** Segments empilés, du bas vers le haut. */
  segments: { value: number; color: string }[];
}

interface Props {
  bars: Bar[];
  height?: number;
  labelEvery?: number;
  /** Détail affiché au survol / à l'appui d'une barre. */
  tooltip?: (bar: Bar) => ReactNode;
  ariaLabel: string;
}

/** Barres empilées en flex (sans librairie) : s'adaptent à la largeur, survol / appui pour le détail. */
export function BarChart({ bars, height = 140, labelEvery = 1, tooltip, ariaLabel }: Props) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(...bars.map(b => b.segments.reduce((s, x) => s + x.value, 0)), 0);
  const current = bars.find(b => b.key === active);

  return (
    <div role="img" aria-label={ariaLabel} className="space-y-2">
      <div className="min-h-9 text-xs">{current && tooltip ? tooltip(current) : null}</div>
      <div className="flex items-end gap-[3px]" style={{ height }} onPointerLeave={() => setActive(null)}>
        {bars.map(b => {
          const total = b.segments.reduce((s, x) => s + x.value, 0);
          return (
            <button key={b.key} type="button" aria-label={b.label}
              onPointerEnter={() => setActive(b.key)} onFocus={() => setActive(b.key)} onClick={() => setActive(b.key)}
              className="group flex h-full flex-1 flex-col justify-end rounded-t-md focus-visible:outline-none">
              <div className={cn('flex w-full flex-col-reverse overflow-hidden rounded-t-md transition-opacity',
                active && active !== b.key && 'opacity-40', total === 0 && 'bg-muted')}
                style={{ height: total > 0 && max > 0 ? `${Math.max((total / max) * 100, 3)}%` : 3 }}>
                {b.segments.filter(s => s.value > 0).map((s, i) => (
                  <div key={i} style={{ height: `${(s.value / total) * 100}%`, background: s.color }} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex gap-[3px] text-[10px] text-muted-foreground">
        {bars.map((b, i) => (
          <span key={b.key} className="flex-1 text-center truncate">{i % labelEvery === 0 ? b.label : ''}</span>
        ))}
      </div>
    </div>
  );
}
