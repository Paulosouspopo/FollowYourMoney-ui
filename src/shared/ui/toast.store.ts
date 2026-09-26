import { create } from 'zustand';

export type ToastTone = 'success' | 'error';
/** Action proposée dans le toast (ex. « Annuler » après une suppression). */
export interface ToastAction { label: string; onClick: () => void; }
export interface Toast { id: number; message: string; tone: ToastTone; action?: ToastAction; }
interface ToastState {
  toasts: Toast[];
  push: (message: string, tone: ToastTone, action?: ToastAction) => void;
  dismiss: (id: number) => void;
}

const DURATION_MS = 3500;
/** Plus long avec une action : le temps de lire et de cliquer. */
const ACTION_DURATION_MS = 7000;
let nextId = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, tone, action) => {
    const id = ++nextId;
    set(s => ({ toasts: [...s.toasts, { id, message, tone, action }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), action ? ACTION_DURATION_MS : DURATION_MS);
  },
  dismiss: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

/** Utilisable hors composant (callbacks de mutation). */
export const toast = {
  success: (message: string, action?: ToastAction) => useToastStore.getState().push(message, 'success', action),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
};
