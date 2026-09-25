import type { ReactNode } from 'react';

export interface DonutSlice { key: string; value: number; color: string; }

interface Props {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  /** Part mise en avant (survol de la légende) : les autres s'estompent. */
  activeKey?: string | null;
  onHover?: (key: string | null) => void;
  /** Contenu au centre (total, part survolée…). */
  children?: ReactNode;
  ariaLabel: string;
}

const GAP = 0.012; // espace entre les parts, en fraction du tour

/** Anneau SVG (cercles à tirets) : une part par segment, espacées, sans librairie. */
export function DonutChart({ slices, size = 160, thickness = 14, activeKey, onHover, children, ariaLabel }: Props) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const many = slices.length > 1;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={ariaLabel}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={thickness} />
        {total > 0 && slices.map(s => {
          const share = s.value / total;
          const length = Math.max(share - (many ? GAP : 0), 0.001) * c;
          const dash = `${length} ${c - length}`;
          const circle = (
            <circle key={s.key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color}
              strokeWidth={activeKey === s.key ? thickness + 4 : thickness} strokeDasharray={dash}
              strokeDashoffset={-offset * c} strokeLinecap={many ? 'butt' : 'round'}
              opacity={activeKey && activeKey !== s.key ? 0.3 : 1}
              className="transition-[opacity,stroke-width] duration-200 cursor-pointer"
              onPointerEnter={() => onHover?.(s.key)} onPointerLeave={() => onHover?.(null)} />
          );
          offset += share;
          return circle;
        })}
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center text-center">{children}</div>}
    </div>
  );
}
