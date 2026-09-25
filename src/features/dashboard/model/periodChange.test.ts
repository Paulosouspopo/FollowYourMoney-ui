import { describe, expect, it } from 'vitest';
import { periodChange } from './periodChange';

describe('gain sur la période', () => {
  it("versements en cours de période : % sur l'argent engagé, pas sur la valeur de départ (cas réel « Max »)", () => {
    const r = periodChange(
      { totalValueEur: 480.37, totalInvestedEur: 500, gainLossEur: -19.63 },
      { totalValueEur: 29515.13, totalInvestedEur: 26587.32, gainLossEur: 2927.81 },
    )!;
    expect(r.gain).toBeCloseTo(2947.44, 2);
    expect(r.pct).toBeCloseTo(11.09, 1); // et non 613 %
  });

  it('sans versement : variation classique sur la valeur de départ', () => {
    const r = periodChange(
      { totalValueEur: 10000, totalInvestedEur: 8000, gainLossEur: 2000 },
      { totalValueEur: 10500, totalInvestedEur: 8000, gainLossEur: 2500 },
    )!;
    expect(r.gain).toBe(500);
    expect(r.pct).toBeCloseTo(5, 6);
  });

  it('retrait ou vente : pas de hausse de capital engagé ; courbe vide : rien', () => {
    const r = periodChange(
      { totalValueEur: 10000, totalInvestedEur: 8000, gainLossEur: 2000 },
      { totalValueEur: 6000, totalInvestedEur: 4000, gainLossEur: 2000 },
    )!;
    expect(r.gain).toBe(0);
    expect(r.pct).toBe(0);
    expect(periodChange(undefined, undefined)).toBeNull();
  });
});
