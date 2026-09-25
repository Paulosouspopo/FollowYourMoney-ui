export interface Box { top: number; left: number; width: number; height: number; }

const MARGIN = 12;
const GAP = 14;
export const BUBBLE_MAX_WIDTH = 360;

/**
 * Position de la bulle : sous l'élément éclairé si la place suffit, sinon
 * au-dessus, sinon en bas de l'écran (élément plus haut que l'écran).
 * Toujours entièrement visible ; centrée s'il n'y a pas d'élément.
 */
export function placeBubble(target: Box | null, bubbleHeight: number, vw: number, vh: number): { top: number; left: number; width: number } {
  const width = Math.min(BUBBLE_MAX_WIDTH, vw - 2 * MARGIN);
  const clampTop = (top: number) => Math.max(MARGIN, Math.min(top, vh - bubbleHeight - MARGIN));
  if (!target) return { width, left: (vw - width) / 2, top: clampTop((vh - bubbleHeight) / 2) };

  const left = Math.max(MARGIN, Math.min(target.left + target.width / 2 - width / 2, vw - width - MARGIN));
  const below = target.top + target.height + GAP;
  if (below + bubbleHeight <= vh - MARGIN) return { width, left, top: below };
  const above = target.top - GAP - bubbleHeight;
  if (above >= MARGIN) return { width, left, top: above };
  return { width, left, top: clampTop(vh - bubbleHeight - MARGIN) };
}

/** Zone éclairée : l'élément avec une marge, limitée à l'écran. */
export function spotlight(target: Box, vw: number, vh: number, pad = 8): Box {
  const top = Math.max(4, target.top - pad);
  const left = Math.max(4, target.left - pad);
  const bottom = Math.min(vh - 4, target.top + target.height + pad);
  const right = Math.min(vw - 4, target.left + target.width + pad);
  return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}
