/**
 * Projection d'épargne : capital de départ + versements mensuels, intérêts
 * composés chaque mois au taux annuel donné (en %, ex. 5). Hypothèses
 * volontairement simples et affichées : rendement constant, avant impôts et
 * inflation.
 */

/** Taux mensuel équivalent à un taux annuel (5 % par an ≠ 5/12 % par mois). */
export const monthlyRate = (annualPct: number) => Math.pow(1 + annualPct / 100, 1 / 12) - 1;

/** Valeur après `months` mois (versement en fin de mois). */
export function futureValue(start: number, monthly: number, annualPct: number, months: number) {
  const r = monthlyRate(annualPct);
  if (r === 0) return start + monthly * months;
  const growth = Math.pow(1 + r, months);
  return start * growth + monthly * ((growth - 1) / r);
}

/** Point par année, de maintenant (année 0) à `years`. */
export function yearlySeries(start: number, monthly: number, annualPct: number, years: number) {
  return Array.from({ length: years + 1 }, (_, y) => ({
    year: y,
    value: futureValue(start, monthly, annualPct, y * 12),
    invested: start + monthly * y * 12,
  }));
}

/** Mois nécessaires pour atteindre `target` (null si jamais, dans la limite de 100 ans). */
export function monthsToReach(target: number, start: number, monthly: number, annualPct: number, maxMonths = 1200) {
  if (start >= target) return 0;
  const r = monthlyRate(annualPct);
  let value = start;
  for (let m = 1; m <= maxMonths; m++) {
    value = value * (1 + r) + monthly;
    if (value >= target) return m;
  }
  return null;
}

/** Versement mensuel nécessaire pour atteindre `target` en `months` mois (0 si déjà en route). */
export function requiredMonthly(target: number, start: number, annualPct: number, months: number) {
  if (months <= 0) return Math.max(0, target - start);
  const r = monthlyRate(annualPct);
  const growth = Math.pow(1 + r, months);
  const missing = target - start * growth;
  if (missing <= 0) return 0;
  return r === 0 ? missing / months : (missing * r) / (growth - 1);
}

/** Mois entiers entre aujourd'hui et une date (ISO). */
export function monthsUntil(isoDate: string, now = new Date()) {
  const d = new Date(`${isoDate}T12:00:00`);
  return Math.max(0, (d.getFullYear() - now.getFullYear()) * 12 + (d.getMonth() - now.getMonth()));
}

/** Date (ISO, 1er du mois) dans `months` mois. */
export function dateInMonths(months: number, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth() + months, 1, 12);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Trois scénarios autour d'un rendement médian : prudent, médian, dynamique (± 3 points). */
export const scenarios = (medianPct: number) => ({
  prudent: Math.max(0, medianPct - 3),
  median: medianPct,
  dynamic: medianPct + 3,
});
