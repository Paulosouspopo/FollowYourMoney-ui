import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface State { hidden: boolean; toggle: () => void; setHidden: (hidden: boolean) => void; }

/**
 * Mode confidentialité : montants et quantités masqués (pourcentages, cours et
 * couleurs visibles). Préférence de l'appareil, appliquée par DisplayCurrencyScope.
 */
export const usePrivacyStore = create<State>()(persist(
  set => ({ hidden: false, toggle: () => set(s => ({ hidden: !s.hidden })), setHidden: hidden => set({ hidden }) }),
  { name: 'fym-privacy' },
));
