/** Avancement vers les 5 ans d'un PEA, en % (0 à 100). */
export function fiveYearsProgress(openedAt: string | null, now = new Date()) {
  if (!openedAt) return 0;
  const years = (now.getTime() - new Date(`${openedAt}T12:00:00`).getTime()) / (365.25 * 86_400_000);
  return Math.max(0, Math.min(100, (years / 5) * 100));
}
