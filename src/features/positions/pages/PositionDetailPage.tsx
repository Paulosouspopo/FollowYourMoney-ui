import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { ReplaceAssetSheet } from '../components/ReplaceAssetSheet';
import { useState } from 'react';
import { usePortfolioDashboard } from '@/features/dashboard/api/dashboard.api';
import { useTransactionsBySymbol } from '@/features/transactions/api/transaction.api';
import { TransactionFormSheet } from '@/features/transactions/components/TransactionFormSheet';
import { TransactionRow } from '@/features/transactions/components/TransactionRow';
import { KpiGrid } from '@/shared/components/data/KpiGrid';
import { performanceKpis } from '@/shared/components/data/kpis';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { GainLine } from '@/shared/components/data/GainLine';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { TopBar } from '@/app/layout/TopBar';
import { Fab } from '@/shared/ui/Fab';
import { Card } from '@/shared/ui/card';
import { formatQty, formatMoney, formatDate } from '@/shared/lib/format';
import type { TransactionResponse } from '@/features/transactions/model/transaction.types';
import { AssetTypeBadge } from '@/shared/components/data/AssetIcon';

export default function PositionDetailPage() {
  const { portfolioId = '', symbol: raw = '' } = useParams();
  const symbol = decodeURIComponent(raw);
  const dash = usePortfolioDashboard(portfolioId, 'all');
  const txs = useTransactionsBySymbol(portfolioId, symbol);
  const [editing, setEditing] = useState<TransactionResponse | null | 'new'>(null);
  // « ?changer=1 » : ouverture directe depuis une alerte (actif mal choisi)
  const [params, setParams] = useSearchParams();
  const [replacing, setReplacing] = useState(params.get('changer') === '1');
  const navigate = useNavigate();

  const position = dash.data?.portfolios[0]?.positions.find(p => p.symbol === symbol);

  return (
    <div className="space-y-4 lg:max-w-3xl">
      <TopBar back title={position?.name ?? symbol} right={position && (
        <Button size="sm" variant="outline" onClick={() => setReplacing(true)}>
          <ArrowLeftRight size={14} /> Changer d'actif
        </Button>
      )} />
      {position && (
        <ReplaceAssetSheet open={replacing} portfolioId={portfolioId} assetId={position.assetId} symbol={symbol}
          name={position.name}
          onClose={() => { setReplacing(false); if (params.has('changer')) setParams({}, { replace: true }); }}
          onReplaced={s => navigate(`/portfolios/${portfolioId}/positions/${encodeURIComponent(s)}`, { replace: true })} />
      )}

      <QueryBoundary query={dash}>
        {() => position ? (
          <>
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{symbol}</span>
                <AssetTypeBadge type={position.assetType} />
              </div>
              <MoneyValue value={position.currentValueEur} className="block text-3xl font-semibold" />
              <GainLine amount={position.unrealizedGainEur} pct={position.unrealizedGainPercentage} />
              <dl className="grid grid-cols-2 gap-y-1 text-xs pt-2 border-t border-border">
                <dt className="text-muted-foreground">Quantité</dt><dd className="text-right tabular-nums">{formatQty(position.quantity)}</dd>
                <dt className="text-muted-foreground">PRU</dt><dd className="text-right"><MoneyValue value={position.averageCostEur} /></dd>
                <dt className="text-muted-foreground">Dernier prix</dt>
                <dd className="text-right tabular-nums">
                  {position.lastPrice != null && position.priceCurrency
                    ? formatMoney(position.lastPrice, position.priceCurrency)
                    : '—'}
                </dd>
                <dt className="text-muted-foreground">Mis à jour</dt>
                <dd className="text-right">{position.priceMissing ? 'Estimé (dernière transaction)' : position.priceAsOf ? formatDate(position.priceAsOf) : '—'}</dd>
              </dl>
            </Card>
            <KpiGrid items={performanceKpis(position)} />
          </>
        ) : <p className="text-sm text-muted-foreground">Position introuvable dans ce portefeuille.</p>}
      </QueryBoundary>

      <section>
        <h2 className="text-sm font-semibold tracking-tight mb-1">Historique</h2>
        <QueryBoundary query={txs}>
          {list => list.length
            ? <div className="divide-y divide-border">
                {list.map(t => <TransactionRow key={t.id} tx={t} onClick={() => setEditing(t)} />)}
              </div>
            : <p className="text-sm text-muted-foreground py-4 text-center">Aucune transaction</p>}
        </QueryBoundary>
      </section>

      <Fab onClick={() => setEditing('new')} label="Ajouter une transaction" />
      <TransactionFormSheet
        portfolioId={portfolioId}
        open={editing !== null}
        onClose={() => setEditing(null)}
        initial={editing === 'new' ? undefined : editing ?? undefined}
        lockedAsset={{ symbol, name: position?.name ?? symbol, currency: position?.priceCurrency }}
        heldQuantities={{ [symbol]: position?.quantity ?? 0 }}
      />
    </div>
  );
}