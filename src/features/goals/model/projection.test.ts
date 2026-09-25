import { describe, expect, it } from 'vitest';
import { futureValue, monthlyRate, monthsToReach, monthsUntil, requiredMonthly, yearlySeries } from './projection';

describe("projection d'épargne", () => {
  it('taux mensuel équivalent : 12 mois composés = le taux annuel', () => {
    expect(Math.pow(1 + monthlyRate(5), 12)).toBeCloseTo(1.05, 10);
  });

  it('capital seul : 10 000 € à 5 % pendant 10 ans ≈ 16 289 €', () => {
    expect(futureValue(10000, 0, 5, 120)).toBeCloseTo(16288.95, 1);
  });

  it('versements sans rendement : simple addition', () => {
    expect(futureValue(1000, 200, 0, 24)).toBe(5800);
  });

  it('versements avec rendement : plus que la somme versée', () => {
    const v = futureValue(0, 300, 5, 240); // 300 €/mois pendant 20 ans
    expect(v).toBeGreaterThan(72000);
    expect(v).toBeCloseTo(122_000, -3);
  });

  it('délai et effort : cohérents entre eux', () => {
    const months = monthsToReach(100000, 20000, 500, 5)!;
    expect(futureValue(20000, 500, 5, months)).toBeGreaterThanOrEqual(100000);
    expect(futureValue(20000, 500, 5, months - 1)).toBeLessThan(100000);
    const monthly = requiredMonthly(100000, 20000, 5, months);
    expect(monthly).toBeLessThanOrEqual(500);
    expect(futureValue(20000, monthly, 5, months)).toBeCloseTo(100000, 0);
  });

  it('cas limites : déjà atteint, jamais atteint, en route sans versement', () => {
    expect(monthsToReach(1000, 2000, 0, 5)).toBe(0);
    expect(monthsToReach(1_000_000, 0, 0, 0)).toBeNull();
    expect(requiredMonthly(10000, 9000, 5, 60)).toBe(0); // 9000 € à 5 % pendant 5 ans > 10 000 €
  });

  it('série annuelle : année 0 = aujourd\'hui, investi = départ + versements', () => {
    const s = yearlySeries(1000, 100, 5, 2);
    expect(s).toHaveLength(3);
    expect(s[0]).toEqual({ year: 0, value: 1000, invested: 1000 });
    expect(s[2].invested).toBe(3400);
  });

  it("mois jusqu'à une échéance", () => {
    expect(monthsUntil('2031-09-01', new Date(2026, 8, 25))).toBe(60);
  });
});
