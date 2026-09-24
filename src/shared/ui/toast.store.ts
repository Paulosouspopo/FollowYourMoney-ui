import { create } from 'zustand';

export type ToastTone = 'success' | 'error';
export interface Toast { id: number; message: string; tone: ToastTone; }
interface ToastState { toasts: Toast[]; push: (message: string, tone: ToastTone) => void; dismiss: (id: number) => void; }

const DURATION_MS = 3500;
let nextId = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (message, tone) => {
    const id = ++nextId;
    set(s => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), DURATION_MS);
  },
  dismiss: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

/** Utilisable hors composant (callbacks de mutation). */
export const toast = {
  success: (message: string) => useToastStore.getState().push(message, 'success'),
  error: (message: string) => useToastStore.getState().push(message, 'error'),
};
