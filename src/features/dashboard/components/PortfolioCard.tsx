import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { GainLine } from "@/shared/components/data/GainLine";
import { MoneyValue } from "@/shared/components/data/MoneyValue";
import { cn } from "@/shared/lib/cn";
import { formatPercent, formatRate, gainTone } from "@/shared/lib/format";
import { ASSET_TYPE_COLOR, PORTFOLIO_TYPE_LABEL } from "@/shared/model/enums";
import { Card } from "@/shared/ui/card";
import { Sparkline } from "@/features/markets/components/Sparkline";
import type { PortfolioTrend, PortfolioValuation } from "../model/dashboard.types";
import { usePrefetchPortfolio } from "../api/dashboard.api";

const SHOWN_HOLDINGS = 3;

/**
 * Tuile d'un portefeuille. Gauche : ce qu'il vaut (valeur, plus-value).
 * Droite : où il va (courbe et gain sur 30 jours) et ce qu'il contient
 * (plus grosses lignes) — ou le taux pour un livret.
 */
export function PortfolioCard({ valuation: v, trend, className }: {
  valuation: PortfolioValuation; trend?: PortfolioTrend; className?: string;
}) {
  const isLivret = v.type === 'LIVRET';
  const prefetch = usePrefetchPortfolio();
  const holdings = v.positions.filter(p => p.quantity > 0).sort((a, b) => b.currentValueEur - a.currentValueEur);
  const change = trend?.changeEur ?? null;

  return (
    <Link to={`/portfolios/${v.portfolioId}`} className={cn('group block', className)}
      onPointerEnter={() => void prefetch(v.portfolioId)} onTouchStart={() => void prefetch(v.portfolioId)}>
      <Card className="p-4 h-full flex-row gap-4 transition-colors group-hover:ring-primary/40">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {PORTFOLIO_TYPE_LABEL[v.type]}{isLivret && v.annualInterestRate != null && ` · ${formatRate(v.annualInterestRate)}`}
            </span>
            {v.hasIncompletePrices && <AlertTriangle size={14} className="text-warning" aria-label="Cours incomplets" />}
          </div>
          <p className="font-medium truncate mt-0.5">{v.name}</p>
          <MoneyValue value={v.currentValueEur} className="block text-xl font-semibold tracking-tight mt-2" />
          {isLivret ? (
            <p className="text-xs text-muted-foreground">Intérêts <MoneyValue value={v.interestEur} signed colored /></p>
          ) : (
            <>
              <GainLine amount={v.unrealizedGainEur} pct={v.unrealizedGainPercentage} size="xs" />
              <p className="text-[11px] text-muted-foreground mt-2">
                {v.openPositionCount} position{v.openPositionCount > 1 ? 's' : ''}
                {v.cashTracking && <> · liquidités <MoneyValue value={v.cashEur} /></>}
              </p>
            </>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
          <div className="flex flex-col items-end">
            <Sparkline values={trend?.values ?? []} width={104} height={40} up={change != null ? change >= 0 : undefined} />
            {change != null && (
              <span className={cn('mt-1 text-[11px] font-medium tabular-nums', gainTone(change))}>
                <MoneyValue value={change} signed />
                {trend?.changePct != null && ` · ${change >= 0 ? '+' : '−'}${formatPercent(Math.abs(trend.changePct))}`}
                <span className="text-muted-foreground font-normal"> 30 j</span>
              </span>
            )}
          </div>
          {isLivret ? (
            v.annualInterestRate != null && (
              <span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
                {formatRate(v.annualInterestRate)} / an
              </span>
            )
          ) : holdings.length > 0 && (
            <div className="flex items-center gap-1" aria-label={`Principales lignes : ${holdings.slice(0, SHOWN_HOLDINGS).map(h => h.name).join(', ')}`}>
              {holdings.slice(0, SHOWN_HOLDINGS).map(h => (
                <span key={h.assetId} title={h.name}
                  className="grid h-8 w-8 place-items-center rounded-full text-[9px] font-bold tracking-tight text-white"
                  style={{ background: ASSET_TYPE_COLOR[h.assetType] }}>
                  {h.symbol.replace(/[-.].*$/, '').slice(0, 3)}
                </span>
              ))}
              {holdings.length > SHOWN_HOLDINGS && (
                <span className="grid h-8 min-w-8 place-items-center rounded-full bg-muted px-1 text-[10px] font-semibold text-muted-foreground">
                  +{holdings.length - SHOWN_HOLDINGS}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
