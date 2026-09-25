import { create } from 'zustand';
import { findTarget } from './target';
import type { Tour, TourStep } from './tour.types';

interface State {
  tour: Tour | null;
  /** Étapes retenues au lancement (celles dont la visée existe sur la page). */
  steps: TourStep[];
  index: number;
  start: (tour: Tour) => void;
  go: (index: number) => void;
  stop: () => void;
}

/** Visite en cours (une seule à la fois), affichée par `TourOverlay`. */
export const useTourStore = create<State>()(set => ({
  tour: null,
  steps: [],
  index: 0,
  start: tour => {
    const steps = tour.steps.filter(s => !s.target || findTarget(s.target));
    if (steps.length) set({ tour, steps, index: 0 });
  },
  go: index => set(s => ({ index: Math.max(0, Math.min(index, s.steps.length - 1)) })),
  stop: () => set({ tour: null, steps: [], index: 0 }),
}));
