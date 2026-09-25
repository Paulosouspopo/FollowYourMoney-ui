import { describe, expect, it } from 'vitest';
import { placeBubble, spotlight } from './placement';

describe('placeBubble', () => {
  const vw = 390, vh = 800;

  it("se place sous l'élément quand la place suffit", () => {
    const pos = placeBubble({ top: 100, left: 20, width: 350, height: 100 }, 200, 360, vh);
    expect(pos.top).toBe(214);
    expect(pos.width).toBe(336); // écran étroit : largeur de l'écran moins les marges
    expect(pos.left).toBe(12);
  });

  it("passe au-dessus d'un élément en bas de l'écran (barre du bas, bouton +)", () => {
    const pos = placeBubble({ top: 740, left: 300, width: 56, height: 56 }, 200, vw, vh);
    expect(pos.top).toBe(740 - 14 - 200);
  });

  it("reste visible en bas de l'écran pour un élément plus grand que l'écran", () => {
    const pos = placeBubble({ top: 20, left: 0, width: 390, height: 900 }, 200, vw, vh);
    expect(pos.top).toBe(800 - 200 - 12);
  });

  it("se centre sans élément et reste dans l'écran sur grand écran", () => {
    expect(placeBubble(null, 200, 1440, 900)).toEqual({ width: 360, left: 540, top: 350 });
    const right = placeBubble({ top: 100, left: 1400, width: 30, height: 30 }, 200, 1440, 900);
    expect(right.left + right.width).toBeLessThanOrEqual(1440 - 12);
  });
});

describe('spotlight', () => {
  it("entoure l'élément d'une marge sans sortir de l'écran", () => {
    expect(spotlight({ top: 100, left: 50, width: 100, height: 40 }, 390, 800)).toEqual({ top: 92, left: 42, width: 116, height: 56 });
    expect(spotlight({ top: 0, left: 0, width: 390, height: 60 }, 390, 800)).toEqual({ top: 4, left: 4, width: 382, height: 64 });
  });
});
