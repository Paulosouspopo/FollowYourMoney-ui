/** Premier élément `[data-tour=…]` visible parmi les visées (dans l'ordre donné). */
export function findTarget(target: string | string[] | undefined): HTMLElement | null {
  if (!target) return null;
  for (const key of Array.isArray(target) ? target : [target]) {
    for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`)) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) return el;
    }
  }
  return null;
}
