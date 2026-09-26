import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { squarify } from './squarify';

export interface TreemapTile {
  key: string;
  value: number;
  /** Couleur de fond (CSS). */
  color: string;
  /** Contenu de la tuile (masqué si elle est trop petite). */
  label: ReactNode;
  /** Texte lu par les lecteurs d'écran et affiché au survol. */
  title: string;
  onClick?: () => void;
}

/**
 * Carte proportionnelle (treemap) : surface = poids, couleur = ce qu'on veut
 * montrer (performance). Largeur mesurée, hauteur fixe ; tuiles cliquables.
 */
export function Treemap({ tiles, height = 280, ariaLabel }: { tiles: TreemapTile[]; height?: number; ariaLabel: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rects = useMemo(() => squarify(tiles.map(t => ({ key: t.key, value: t.value })), width, height),
    [tiles, width, height]);
  const byKey = useMemo(() => new Map(tiles.map(t => [t.key, t])), [tiles]);

  return (
    <div ref={ref} role="list" aria-label={ariaLabel} className="relative w-full overflow-hidden rounded-2xl" style={{ height }}>
      {rects.map(r => {
        const t = byKey.get(r.key)!;
        const big = r.w > 64 && r.h > 40;
        return (
          <button key={r.key} type="button" role="listitem" title={t.title} aria-label={t.title} onClick={t.onClick}
            className="absolute overflow-hidden rounded-lg p-1.5 text-left text-white ring-2 ring-background transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-primary"
            style={{ left: r.x, top: r.y, width: r.w, height: r.h, background: t.color }}>
            {big && t.label}
          </button>
        );
      })}
    </div>
  );
}
