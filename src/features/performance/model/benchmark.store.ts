import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BENCHMARK_PRESETS, type Benchmark } from './performance.types';

interface State { benchmark: Benchmark | null; setBenchmark: (b: Benchmark | null) => void; }

/** Indice de comparaison choisi (préférence de l'appareil), MSCI World par défaut. */
export const useBenchmarkStore = create<State>()(persist(
  set => ({ benchmark: BENCHMARK_PRESETS[0], setBenchmark: benchmark => set({ benchmark }) }),
  { name: 'fym-benchmark' },
));
