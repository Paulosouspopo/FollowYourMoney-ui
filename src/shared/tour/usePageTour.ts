import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTutorials } from './tour.api';
import { useTourStore } from './tour.store';
import type { Tour } from './tour.types';

/** Visites déjà lancées automatiquement : pas de relance dans la même session, même si l'enregistrement échoue. */
const autoShown = new Set<string>();

/** « Tout revoir » : les visites peuvent se relancer dès maintenant. */
export const forgetShownTours = () => autoShown.clear();

/**
 * Visite de la page : lancée à la première visite (affichage automatique
 * activé, visite jamais terminée) ou à la demande (`?tour=<clé>`, page Guide).
 * `ready` : la page affiche son contenu (données chargées, pas de fenêtre ouverte).
 */
export function usePageTour(tour: Tour, ready = true) {
  const state = useTutorials().data;
  const running = useTourStore(s => s.tour != null);
  const start = useTourStore(s => s.start);
  const [params, setParams] = useSearchParams();
  const asked = params.get('tour') === tour.key;

  useEffect(() => {
    if (!ready || running) return;
    if (asked) {
      const t = setTimeout(() => {
        start(tour);
        setParams(p => { p.delete('tour'); return p; }, { replace: true });
      }, 450);
      return () => clearTimeout(t);
    }
    if (!state?.autoEnabled || state.completed.includes(tour.key) || autoShown.has(tour.key)) return;
    // Laisse la page apparaître avant d'éclairer ses éléments
    const t = setTimeout(() => { autoShown.add(tour.key); start(tour); }, 900);
    return () => clearTimeout(t);
  }, [ready, running, asked, state, tour, start, setParams]);
}
