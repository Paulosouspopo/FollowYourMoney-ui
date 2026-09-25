import { useEffect, useRef, useState } from 'react';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Valeur animée vers `target` (ease-out, requestAnimationFrame). Première
 * apparition : part de 0 ; ensuite, glisse depuis la valeur affichée. Pas
 * d'animation si l'utilisateur la refuse (prefers-reduced-motion) ou si
 * `enabled` est faux (curseur sur un graphique : réponse immédiate).
 */
export function useCountUp(target: number, { duration = 700, enabled = true } = {}) {
  const [value, setValue] = useState(() => (enabled && !reducedMotion() ? 0 : target));
  const shown = useRef(value);

  useEffect(() => {
    if (!enabled || reducedMotion() || shown.current === target) {
      shown.current = target;
      setValue(target);
      return;
    }
    const from = shown.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      shown.current = from + (target - from) * eased;
      setValue(shown.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, enabled]);

  return value;
}
