import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useAvailableAssets } from '@/features/transactions/api/transaction.api';
import { AssetIcon } from '@/shared/components/data/AssetIcon';
import { Input } from '@/shared/ui/Input';
import type { AvailableAssetResponse } from '@/features/assets/model/asset.types';

interface Props { portfolioId: string; onSelect: (a: AvailableAssetResponse) => void; }

export function AssetPicker({ portfolioId, onSelect }: Props) {
  const { data = [], isLoading } = useAvailableAssets(portfolioId);
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data.slice(0, 30);
    return data.filter(a => a.symbol.toLowerCase().includes(s) || a.name.toLowerCase().includes(s)).slice(0, 30);
  }, [data, q]);

  return (
    <div className="space-y-3">
      <Input autoFocus placeholder="Rechercher un actif (AAPL, BTC, CW8…)" value={q} onChange={e => setQ(e.target.value)} leading={<Search size={16} />} />
      {isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      <ul className="divide-y divide-border max-h-[50dvh] overflow-y-auto">
        {results.map(a => (
          <li key={a.symbol}>
            <button type="button" onClick={() => onSelect(a)} className="w-full flex items-center gap-3 py-2.5 text-left">
              <AssetIcon symbol={a.symbol} type={a.type} />
              <div className="min-w-0"><p className="font-medium truncate">{a.name}</p><p className="text-xs text-muted-foreground">{a.symbol} · {a.currency}</p></div>
            </button>
          </li>
        ))}
        {!isLoading && !results.length && <li className="py-6 text-center text-sm text-muted-foreground">Aucun résultat</li>}
      </ul>
    </div>
  );
}