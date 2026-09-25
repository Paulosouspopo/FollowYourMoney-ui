import { describe, expect, it } from 'vitest';
import { monthlyReturns } from './calendar';

describe('monthlyReturns', () => {
  it('rendement de chaque mois depuis la performance cumulée, total de l’année composé', () => {
    const rows = monthlyReturns([
      { date: '2025-11-15', twrPct: 0 },
      { date: '2025-11-30', twrPct: 10 },   // novembre : +10 %
      { date: '2025-12-31', twrPct: 21 },   // décembre : 1,21 / 1,10 − 1 = +10 %
      { date: '2026-01-31', twrPct: 8.9 },  // janvier : 1,089 / 1,21 − 1 = −10 %
    ]);
    expect(rows.map(r => r.year)).toEqual([2026, 2025]);
    expect(rows[1].months[10]).toBeCloseTo(10, 6);
    expect(rows[1].months[11]).toBeCloseTo(10, 6);
    expect(rows[1].total).toBeCloseTo(21, 6);
    expect(rows[0].months[0]).toBeCloseTo(-10, 6);
    expect(rows[0].months[1]).toBeNull();
  });
});
