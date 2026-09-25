import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { EmptyState } from '@/shared/ui/EmptyState';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { ListSkeleton } from '@/shared/components/data/ListSkeleton';
import { PercentBadge } from '@/shared/components/data/PercentBadge';
import { AssetIcon } from '@/shared/components/data/AssetIcon';
import { toast } from '@/shared/ui/toast.store';
import { formatMoney } from '@/shared/lib/format';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import { useAddToWatchlist, useWatchlist } from '../api/market.api';
import { Sparkline } from '../components/Sparkline';
import { marketPath, type WatchlistItem } from '../model/market.types';

/** Suggestions pour démarrer : indices et cryptos courants (symboles Yahoo). */
const SUGGESTIONS = [
  { symbol: '^FCHI', label: 'CAC 40' }, { symbol: '^GSPC', label: 'S&P 500' }, { symbol: 'CW8.PA', label: 'MSCI World' },
  { symbol: 'BTC-EUR', label: 'Bitcoin' }, { symbol: 'ETH-EUR', label: 'Ethereum' }, { symbol: 'EURUSD=X', label: 'EUR/USD' },
];

/** Onglet « Marchés » : actifs suivis, détenus ou non (cours, variation du jour, 30 jours). */
export default function MarketsPage() {
  const q = useWatchlist();
  const add = useAddToWatchlist();
  const [adding, setAdding] = useState(false);

  const follow = (symbol: string) => add.mutate(symbol, {
    onSuccess: item => { toast.success(`${item.name} ajouté à ta liste`); setAdding(false); },
    onError: e => toast.error(e.message),
  });
  const followed = new Set(q.data?.map(i => i.symbol));
  const suggestions = SUGGESTIONS.filter(s => !followed.has(s.symbol));

  return (
    <div className="space-y-4 pt-4 lg:max-w-3xl">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Marchés</h1>
        <Button size="sm" onClick={() => setAdding(true)}><Plus size={16} /> Suivre</Button>
      </header>

      <QueryBoundary query={q} skeleton={<ListSkeleton rows={4} />}>
        {items => items.length ? (
          <ul className="divide-y divide-border">
            {items.map(item => <WatchRow key={item.id} item={item} />)}
          </ul>
        ) : (
          <EmptyState title="Aucun actif suivi"
            description="Suis une action, un ETF, une crypto ou un indice, que tu le détiennes ou non : cours, graphique, alertes." />
        )}
      </QueryBoundary>

      {suggestions.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium text-muted-foreground">Suggestions</h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <Button key={s.symbol} size="sm" variant="outline" disabled={add.isPending} onClick={() => follow(s.symbol)}>
                <Plus size={14} /> {s.label}
              </Button>
            ))}
          </div>
        </section>
      )}

      <BottomSheet open={adding} onClose={() => setAdding(false)} title="Suivre un actif">
        <div className="space-y-3">
          <AssetSearchCombobox onChange={a => follow(a.symbol)} disabled={add.isPending}
            placeholder="Apple, Bitcoin, un ETF MSCI World…" />
          <p className="text-xs text-muted-foreground">
            {add.isPending ? "Téléchargement de l'historique…" : 'Le cours est mis à jour chaque heure. Tu pourras créer des alertes depuis sa fiche.'}
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}

function WatchRow({ item }: { item: WatchlistItem }) {
  return (
    <li>
      <Link to={marketPath(item.symbol)} className="py-3 flex items-center gap-3">
        <AssetIcon symbol={item.symbol} type={item.assetType ?? 'AUTRE'} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            {item.symbol}
            {item.ownedQuantity > 0 && <span className="rounded bg-primary/10 px-1 text-primary">détenu</span>}
            {item.alertCount > 0 && <span className="flex items-center gap-0.5" aria-label={`${item.alertCount} alerte(s)`}><Bell size={10} />{item.alertCount}</span>}
          </p>
        </div>
        <Sparkline values={item.sparkline} />
        <div className="w-24 text-right">
          <p className="text-sm font-medium tabular-nums">
            {item.price != null && item.currency ? formatMoney(item.price, item.currency) : '—'}
          </p>
          <PercentBadge value={item.dayChangePct} className="px-1.5 text-[10px]" />
        </div>
      </Link>
    </li>
  );
}
