/** Rendement d'un mois (%) ; null si le mois n'est pas couvert. */
export interface CalendarYear { year: number; months: (number | null)[]; total: number | null; }

/**
 * Calendrier des performances : rendement de chaque mois à partir de la
 * performance TWR cumulée jour par jour (les versements n'y comptent pas).
 * Rendement d'un mois = indice du dernier jour / indice de fin du mois
 * précédent − 1 (ou du début de la série pour le premier mois).
 */
export function monthlyReturns(series: { date: string; twrPct: number }[]): CalendarYear[] {
  if (series.length === 0) return [];
  const lastIndexByMonth = new Map<string, number>();
  for (const p of series) lastIndexByMonth.set(p.date.slice(0, 7), 1 + p.twrPct / 100);

  const years = new Map<number, CalendarYear>();
  let previous = 1 + series[0].twrPct / 100;
  for (const [month, index] of lastIndexByMonth) {
    const year = Number(month.slice(0, 4));
    const m = Number(month.slice(5, 7)) - 1;
    const row = years.get(year) ?? { year, months: Array<number | null>(12).fill(null), total: null };
    row.months[m] = previous > 0 ? (index / previous - 1) * 100 : null;
    years.set(year, row);
    previous = index;
  }
  for (const row of years.values()) {
    const covered = row.months.filter((v): v is number => v != null);
    row.total = covered.length ? (covered.reduce((acc, r) => acc * (1 + r / 100), 1) - 1) * 100 : null;
  }
  return [...years.values()].sort((a, b) => b.year - a.year);
}
