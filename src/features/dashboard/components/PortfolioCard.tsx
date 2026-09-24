import { GainLine } from "@/shared/components/data/GainLine";
import { MoneyValue } from "@/shared/components/data/MoneyValue";
import { cn } from "@/shared/lib/cn";
import { formatRate } from "@/shared/lib/format";
import { PORTFOLIO_TYPE_LABEL } from "@/shared/model/enums";
import { Card } from "@/shared/ui/card";
import { AlertTriangle } from "lucide-react";
import type { PortfolioValuation } from "../model/dashboard.types";
import { Link } from "react-router-dom";

export function PortfolioCard({ valuation: v, className }: { valuation: PortfolioValuation; className?: string }) {
  const isLivret = v.type === 'LIVRET';
  return (
    <Link to={`/portfolios/${v.portfolioId}`} className={cn('block', className)}>
      <Card className="p-4 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {PORTFOLIO_TYPE_LABEL[v.type]}{isLivret && v.annualInterestRate != null && ` · ${formatRate(v.annualInterestRate)}`}
          </span>
          {v.hasIncompletePrices && <AlertTriangle size={14} className="text-warning" />}
        </div>
        <p className="font-medium truncate mt-0.5">{v.name}</p>
        <MoneyValue value={v.currentValueEur} className="block text-xl font-semibold mt-2" />
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
      </Card>
    </Link>
  );
}
