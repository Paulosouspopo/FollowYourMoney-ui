import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BellPlus, Star, StarOff, TrendingDown, TrendingUp } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { toast } from '@/shared/ui/toast.store';
import { PercentBadge } from '@/shared/components/data/PercentBadge';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { GainLine } from '@/shared/components/data/GainLine';
import { AssetTypeBadge } from '@/shared/components/data/AssetIcon';
import { formatDate, formatEur, formatMoney, formatQty } from '@/shared/lib/format';
import { useSaveAlertRule } from '@/features/notifications/api/notification.api';
import { AlertRuleFormSheet, type AlertPreset } from '@/features/notifications/components/AlertRuleFormSheet';
import { AlertRuleRow } from '@/features/notifications/components/AlertRulesList';
import type { AlertRule, AlertRuleRequest } from '@/features/notifications/model/notification.types';
import { useAddToWatchlist, useMarketDetail, useRemoveFromWatchlist } from '../api/market.api';
import { MarketChart, RangeBar } from '../components/MarketChart';
import type { MarketDetail } from '../model/market.types';

/** Fiche d'un actif, détenu ou non : cours, graphique, records sur 1 an, mes lignes, mes alertes. */
export default function MarketDetailPage() {
  const { symbol: raw = '' } = useParams();
  const symbol = decodeURIComponent(raw);
  const q = useMarketDetail(symbol);

  return (
    <div>
      <TopBar back title={q.data?.name ?? symbol} right={q.data && <FollowButton detail={q.data} />} />
      <QueryBoundary query={q}>
        {d => (
          <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
            <div className="space-y-6 lg:col-span-8 min-w-0">
              <Hero detail={d} />
              <MarketChart symbol={d.symbol} currency={d.currency} />
            </div>
            <aside className="space-y-6 lg:col-span-4 min-w-0 lg:pt-4">
              {d.low52w != null && d.high52w != null && (
                <Card className="p-4"><RangeBar low={d.low52w} high={d.high52w} price={d.price} currency={d.currency} /></Card>
              )}
              <Holdings detail={d} />
              <Alerts detail={d} />
            </aside>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}

function FollowButton({ detail }: { detail: MarketDetail }) {
  const add = useAddToWatchlist();
  const remove = useRemoveFromWatchlist();
  const followed = detail.watchlistId != null;
  return followed ? (
    <Button size="sm" variant="outline" loading={remove.isPending}
      onClick={() => remove.mutate(detail.watchlistId!, {
        onSuccess: () => toast.success('Retiré de ta liste'), onError: e => toast.error(e.message),
      })}>
      <StarOff size={14} /> Ne plus suivre
    </Button>
  ) : (
    <Button size="sm" loading={add.isPending}
      onClick={() => add.mutate(detail.symbol, {
        onSuccess: () => toast.success('Ajouté à ta liste'), onError: e => toast.error(e.message),
      })}>
      <Star size={14} /> Suivre
    </Button>
  );
}

function Hero({ detail: d }: { detail: MarketDetail }) {
  return (
    <section className="glow -mx-4 px-4 md:mx-0 md:px-0 pt-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span>{d.symbol}{d.exchange && ` · ${d.exchange}`}</span>
        {d.assetType && <AssetTypeBadge type={d.assetType} />}
      </div>
      <p className="text-display mt-2">{formatMoney(d.price, d.currency)}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <PercentBadge value={d.dayChangePct} />
        <span className="text-muted-foreground">
          {d.currency !== 'EUR' && `≈ ${formatEur(d.priceEur)} · `}séance du {formatDate(d.marketDate)}
        </span>
      </div>
    </section>
  );
}

function Holdings({ detail: d }: { detail: MarketDetail }) {
  if (!d.holdings.length) return null;
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight">Mes lignes</h2>
      <Card className="divide-y divide-border p-0">
        {d.holdings.map(h => (
          <Link key={h.portfolioId} to={`/portfolios/${h.portfolioId}/positions/${encodeURIComponent(d.symbol)}`}
            className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">{h.portfolioName}</p>
              <p className="text-xs text-muted-foreground tabular-nums">{formatQty(h.quantity)} part{h.quantity > 1 ? 's' : ''}</p>
            </div>
            <div className="text-right">
              <MoneyValue value={h.valueEur} className="text-sm font-medium" />
              <GainLine amount={h.gainEur} pct={h.gainPct} />
            </div>
          </Link>
        ))}
      </Card>
    </section>
  );
}

/** Alertes en un geste (préréglages) ou personnalisées. */
function Alerts({ detail: d }: { detail: MarketDetail }) {
  const save = useSaveAlertRule();
  const [editing, setEditing] = useState<AlertRule | AlertPreset | null>(null);
  const asset = { symbol: d.symbol, name: d.name, exchange: d.exchange, assetType: d.assetType ?? 'AUTRE' as const };

  const quick = (condition: AlertRuleRequest['condition'], threshold: number | null, period: AlertRuleRequest['period']) =>
    save.mutate({
      body: {
        scope: 'ASSET', portfolioId: null, symbol: d.symbol, condition, threshold, period,
        notifyEmail: false, notifyPush: true, enabled: true, label: null, mutedUntil: null,
      },
    }, { onSuccess: () => toast.success('Alerte créée'), onError: e => toast.error(e.message) });

  const has = (c: AlertRuleRequest['condition']) => d.alerts.some(a => a.condition === c);

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-tight">Mes alertes</h2>
      {d.alerts.length > 0 && (
        <Card className="px-4 py-0">
          <ul className="divide-y divide-border">
            {d.alerts.map(a => <AlertRuleRow key={a.id} rule={a} onEdit={() => setEditing(a)} />)}
          </ul>
        </Card>
      )}
      <div className="flex flex-wrap gap-2">
        {!has('FALLS') && (
          <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => quick('FALLS', 5, 'DAY')}>
            <TrendingDown size={14} /> −5 % sur 1 jour
          </Button>
        )}
        {!has('RISES') && (
          <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => quick('RISES', 5, 'DAY')}>
            <TrendingUp size={14} /> +5 % sur 1 jour
          </Button>
        )}
        {!has('NEW_HIGH') && (
          <Button size="sm" variant="outline" disabled={save.isPending} onClick={() => quick('NEW_HIGH', null, 'YEAR')}>
            <TrendingUp size={14} /> Plus haut 1 an
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => setEditing({ scope: 'ASSET', asset, condition: 'BELOW' })}>
          <BellPlus size={14} /> Personnaliser
        </Button>
      </div>
      <AlertRuleFormSheet open={editing !== null} onClose={() => setEditing(null)}
        initial={editing && 'id' in editing ? editing : undefined}
        preset={editing && !('id' in editing) ? editing : undefined} />
    </section>
  );
}
