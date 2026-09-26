import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());

// API navigateur absentes de jsdom mais utilisées par Radix (Select, Dialog) et cmdk
class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= () => {};
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
window.matchMedia ??= ((query: string) => ({
  matches: false, media: query, onchange: null,
  addEventListener: () => {}, removeEventListener: () => {},
  addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
})) as unknown as typeof window.matchMedia;

// Visites guidées : état « tout vu, affichage automatique coupé » pour les tests de pages
// (sans QueryClient). tour.test.tsx remplace ce simulacre par le sien.
vi.mock('@/shared/tour/tour.api', () => ({
  tutorialKeys: { all: ['tutorials'] },
  useTutorials: () => ({ data: { autoEnabled: false, completed: [] } }),
  useCompleteTutorial: () => ({ mutate: () => {} }),
  useTutorialAutoDisplay: () => ({ mutate: () => {}, isPending: false }),
  useResetTutorials: () => ({ mutate: () => {}, isPending: false }),
}));
