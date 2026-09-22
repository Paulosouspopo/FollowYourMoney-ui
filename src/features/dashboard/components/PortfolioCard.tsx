import { GainLine } from "@/shared/components/data/GainLine";
import { MoneyValue } from "@/shared/components/data/MoneyValue";
import { cn } from "@/shared/lib/cn";
import { PORTFOLIO_TYPE_LABEL } from "@/shared/model/enums";
import { Card } from "@/shared/ui/card";
import { Link, AlertTriangle } from "lucide-react";
import type { PortfolioValuation } from "../model/dashboard.types";

export function PortfolioCard({ valuation: v, className }: { valuation: PortfolioValuation; className?: string }) {
  return (
    <Link to={`/portfolios/${v.portfolioId}`} className={cn('block', className)}>
      <Card className="p-4 h-full">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{PORTFOLIO_TYPE_LABEL[v.type]}</span>
          {v.hasIncompletePrices && <AlertTriangle size={14} className="text-warning" />}
        </div>
        <p className="font-medium truncate mt-0.5">{v.name}</p>
        <MoneyValue value={v.currentValueEur} className="block text-xl font-semibold mt-2" />
        <GainLine amount={v.unrealizedGainEur} pct={v.unrealizedGainPercentage} size="xs" />
        <p className="text-[11px] text-muted-foreground mt-2">{v.openPositionCount} position{v.openPositionCount > 1 ? 's' : ''}</p>
      </Card>
    </Link>
  );
}