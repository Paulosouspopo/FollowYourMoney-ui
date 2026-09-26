import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/shared/ui/card';
import { Treemap, type TreemapTile } from '@/shared/charts/Treemap';
import { formatPercent, formatEur } from '@/shared/lib/format';
import { displaySymbol } from '@/shared/model/portfolioRules';
import type { ContributionLine } from '../model/analysis.types';
import { returnColor } from '../model/colors';

/** Carte des positions : surface = poids actuel, couleur = performance de la ligne sur la période. */
export function PositionsMap({ lines, periodLabel }: { lines: ContributionLine[]; periodLabel: string }) {
  const navigate = useNavigate();
  const tiles = useMemo<TreemapTile[]>(() => lines.filter(l => l.endValueEur > 0).map(l => ({
    key: l.assetId,
    value: l.endValueEur,
    color: returnColor(l.returnPct),
    title: `${l.name} : ${formatEur(l.endValueEur)}, ${l.returnPct == null ? '—' : formatPercent(l.returnPct)} ${periodLabel}`,
    onClick: () => navigate(`/portfolios/${l.portfolioId}/positions/${encodeURIComponent(l.symbol)}`),
    label: (
      <span className="block leading-tight">
        <span className="block truncate text-xs font-semibold drop-shadow-sm">{l.name}</span>
        <span className="block text-[11px] tabular-nums opacity-90">
          {l.returnPct == null ? displaySymbol(l.symbol) : `${l.returnPct > 0 ? '+' : ''}${formatPercent(l.returnPct)}`}
        </span>
      </span>
    ),
  })), [lines, navigate, periodLabel]);

  if (tiles.length === 0) return null;
  return (
    <Card className="p-3 gap-2" data-tour="analysis-map">
      <Treemap tiles={tiles} height={300} ariaLabel={`Carte des positions : taille selon le poids, couleur selon la performance ${periodLabel}`} />
      <p className="px-1 text-[11px] text-muted-foreground">Taille = poids dans ton patrimoine · couleur = performance {periodLabel}. Touche une tuile pour ouvrir la ligne.</p>
    </Card>
  );
}
