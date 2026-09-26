/** Avancement vers une ancienneté (5 ans d'un PEA, 8 ans d'une assurance-vie), en % (0 à 100). */
export function yearsProgress(openedAt: string | null, target: number, now = new Date()) {
  if (!openedAt) return 0;
  const years = (now.getTime() - new Date(`${openedAt}T12:00:00`).getTime()) / (365.25 * 86_400_000);
  return Math.max(0, Math.min(100, (years / target) * 100));
}

/** Avancement vers les 5 ans d'un PEA, en % (0 à 100). */
export const fiveYearsProgress = (openedAt: string | null, now = new Date()) => yearsProgress(openedAt, 5, now);
