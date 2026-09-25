export interface TreemapItem { key: string; value: number; }
export interface TreemapRect extends TreemapItem { x: number; y: number; w: number; h: number; }

/**
 * Treemap « squarifié » (Bruls, Huizing, van Wijk) : des tuiles aussi proches
 * que possible du carré, la surface proportionnelle à la valeur. Les valeurs
 * nulles ou négatives sont ignorées.
 */
export function squarify(items: TreemapItem[], width: number, height: number): TreemapRect[] {
  const data = items.filter(i => i.value > 0).sort((a, b) => b.value - a.value);
  const total = data.reduce((s, i) => s + i.value, 0);
  if (!total || width <= 0 || height <= 0) return [];
  const scale = (width * height) / total;
  const nodes = data.map(i => ({ ...i, area: i.value * scale }));
  const out: TreemapRect[] = [];
  const rect = { x: 0, y: 0, w: width, h: height };

  const worst = (row: typeof nodes, side: number) => {
    const s = row.reduce((acc, n) => acc + n.area, 0);
    const max = Math.max(...row.map(n => n.area));
    const min = Math.min(...row.map(n => n.area));
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
  };

  const layout = (row: typeof nodes) => {
    const s = row.reduce((acc, n) => acc + n.area, 0);
    if (rect.w >= rect.h) {
      // Colonne à gauche
      const colW = s / rect.h;
      let y = rect.y;
      for (const n of row) {
        const h = n.area / colW;
        out.push({ key: n.key, value: n.value, x: rect.x, y, w: colW, h });
        y += h;
      }
      rect.x += colW;
      rect.w -= colW;
    } else {
      // Rangée en haut
      const rowH = s / rect.w;
      let x = rect.x;
      for (const n of row) {
        const w = n.area / rowH;
        out.push({ key: n.key, value: n.value, x, y: rect.y, w, h: rowH });
        x += w;
      }
      rect.y += rowH;
      rect.h -= rowH;
    }
  };

  let row: typeof nodes = [];
  let i = 0;
  while (i < nodes.length) {
    const side = Math.min(rect.w, rect.h);
    const candidate = [...row, nodes[i]];
    if (row.length === 0 || worst(candidate, side) <= worst(row, side)) {
      row = candidate;
      i++;
    } else {
      layout(row);
      row = [];
    }
  }
  if (row.length) layout(row);
  return out;
}
