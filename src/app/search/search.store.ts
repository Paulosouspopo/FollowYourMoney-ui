import { create } from 'zustand';

interface State { open: boolean; setOpen: (open: boolean) => void; }

/** Palette de recherche (Ctrl+K) : ouverte depuis le clavier ou un bouton loupe. */
export const useSearchStore = create<State>()(set => ({ open: false, setOpen: open => set({ open }) }));
