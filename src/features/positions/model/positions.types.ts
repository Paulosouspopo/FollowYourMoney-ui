import type { PositionValuation } from '@/features/dashboard/model/dashboard.types';

export type { PositionValuation };

export type Sort = 'value' | 'gain' | 'name';

export const SORTERS: Record<Sort, (a: PositionValuation, b: PositionValuation) => number> = {
  value: (a, b) => b.currentValueEur - a.currentValueEur,
  gain: (a, b) => b.unrealizedGainPercentage - a.unrealizedGainPercentage,
  name: (a, b) => a.name.localeCompare(b.name),
};