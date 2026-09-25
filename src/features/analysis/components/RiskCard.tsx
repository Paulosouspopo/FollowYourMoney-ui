import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/card';
import { formatDate, formatPercent } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import type { RiskStats } from '@/features/performance/model/performance.types';

/** Traduction de la volatilité en mots : c'est ce qu'on retient. */
function volatilityWord(v: number) {
  if (v < 5) return 'très calme';
  if (v < 12) return 'calme';
  if (v < 20) return 'comme le marché actions';
  if (v < 35) return 'agité';
  return 'très agité (niveau crypto)';
}

function Stat({ label, value, tone, children }: { label: string; value: string; tone?: 'gain' | 'loss'; children: ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-semibold tabular-nums', tone === 'gain' && 'text-gain', tone === 'loss' && 'text-loss')}>{value}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{children}</p>
    </div>
  );
}

/** Risque sur la période : volatilité, pire baisse, Sharpe, meilleur et pire jour, en langage clair. */
export function RiskCard({ risk }: { risk: RiskStats | null }) {
  if (!risk) {
    return (
      <Card className="p-4 text-sm text-muted-foreground" data-tour="analysis-risk">
        Il faut au moins un mois d'historique pour mesurer le risque. Allonge la période ou reviens dans quelques semaines.
      </Card>
    );
  }
  return (
    <Card className="p-4 gap-3" data-tour="analysis-risk">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Volatilité (par an)" value={formatPercent(risk.volatilityPct)}>
          Portefeuille {volatilityWord(risk.volatilityPct)}.
        </Stat>
        <Stat label="Pire baisse" value={formatPercent(risk.maxDrawdownPct)} tone={risk.maxDrawdownPct < 0 ? 'loss' : undefined}>
          {risk.drawdownPeak && risk.drawdownTrough
            ? `Du ${formatDate(risk.drawdownPeak)} au ${formatDate(risk.drawdownTrough)}.`
            : 'Aucune baisse sur la période.'}
        </Stat>
        <Stat label="Meilleur jour" value={`+${formatPercent(risk.bestDayPct)}`} tone="gain">{formatDate(risk.bestDay)}</Stat>
        <Stat label="Pire jour" value={formatPercent(risk.worstDayPct)} tone="loss">{formatDate(risk.worstDay)}</Stat>
      </div>
      <p className="text-xs text-muted-foreground">
        {formatPercent(risk.positiveDaysPct)} de jours en hausse.
        {risk.sharpe != null && <> Ratio de Sharpe : <span className="font-medium text-foreground">{risk.sharpe.toLocaleString('fr-FR')}</span>{' '}
          ({risk.sharpe >= 1 ? 'très bon' : risk.sharpe >= 0.5 ? 'correct' : risk.sharpe >= 0 ? 'faible' : 'négatif'} : rendement obtenu par unité de risque, au-delà de 2 % sans risque).</>}
      </p>
    </Card>
  );
}
