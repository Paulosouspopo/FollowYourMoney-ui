/** Période du bilan : du 15 décembre au 15 février. */
export function isWrappedSeason(now = new Date()) {
  const m = now.getMonth(), d = now.getDate();
  return (m === 11 && d >= 15) || m === 0 || (m === 1 && d <= 15);
}
