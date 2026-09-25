import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { AssetSearchCombobox } from '@/features/assets/components/AssetSearchCombobox';
import { useBenchmarkStore } from '../model/benchmark.store';
import { BENCHMARK_PRESETS } from '../model/performance.types';

/** Indice de comparaison : raccourcis courants, aucun, ou n'importe quel actif via la recherche. */
export function BenchmarkPicker() {
  const { benchmark, setBenchmark } = useBenchmarkStore();
  const [searching, setSearching] = useState(false);
  const custom = benchmark != null && !BENCHMARK_PRESETS.some(b => b.symbol === benchmark.symbol);

  const chip = (active: boolean) => cn('rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
    active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground');

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-muted-foreground">Comparer à</p>
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Indice de comparaison">
        <button type="button" role="radio" aria-checked={benchmark == null} className={chip(benchmark == null)}
          onClick={() => setBenchmark(null)}>Aucun</button>
        {BENCHMARK_PRESETS.map(b => (
          <button key={b.symbol} type="button" role="radio" aria-checked={benchmark?.symbol === b.symbol}
            className={chip(benchmark?.symbol === b.symbol)} onClick={() => setBenchmark(b)}>{b.label}</button>
        ))}
        {custom && <span className={chip(true)} role="radio" aria-checked>{benchmark.label}</span>}
        <button type="button" className={chip(false)} onClick={() => setSearching(s => !s)} aria-expanded={searching}>
          <Search size={11} className="inline -mt-0.5" /> Autre
        </button>
      </div>
      {searching && (
        <AssetSearchCombobox placeholder="Un indice, un ETF, une action…"
          onChange={a => { setBenchmark({ symbol: a.symbol, label: a.name }); setSearching(false); }} />
      )}
    </div>
  );
}
