import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import type { Tour, TutorialState } from './tour.types';
import { useTourStore } from './tour.store';
import { TourOverlay } from './TourOverlay';
import { usePageTour } from './usePageTour';

const complete = vi.fn();
const autoDisplay = vi.fn();
let state: TutorialState = { autoEnabled: true, completed: [] };

vi.mock('./tour.api', () => ({
  useTutorials: () => ({ data: state }),
  useCompleteTutorial: () => ({ mutate: complete }),
  useTutorialAutoDisplay: () => ({ mutate: autoDisplay }),
}));

const tour: Tour = {
  key: 'demo', title: 'Démo', summary: 'Une visite de test', icon: Sparkles,
  steps: [
    { title: 'Bienvenue', body: 'Première étape' },
    { target: 'absent', title: 'Élément absent', body: 'Sautée : rien à éclairer' },
    { title: 'Au revoir', body: 'Dernière étape' },
  ],
};

beforeEach(() => {
  complete.mockReset();
  autoDisplay.mockReset();
  state = { autoEnabled: true, completed: [] };
  useTourStore.getState().stop();
});

describe('TourOverlay', () => {
  it("saute les étapes sans élément, avance et recule, puis enregistre la visite terminée", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TourOverlay /></MemoryRouter>);
    act(() => useTourStore.getState().start(tour));

    expect(screen.getByRole('dialog', { name: 'Bienvenue' })).toBeInTheDocument();
    expect(screen.getByText('Démo · 1/2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: "C'est parti" }));
    expect(screen.getByRole('dialog', { name: 'Au revoir' })).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('dialog', { name: 'Bienvenue' })).toBeInTheDocument();

    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByRole('button', { name: "C'est compris !" }));
    expect(complete).toHaveBeenCalledWith('demo');
    expect(autoDisplay).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('« Ne plus afficher » puis Échap : visite passée et affichage automatique coupé', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TourOverlay /></MemoryRouter>);
    act(() => useTourStore.getState().start(tour));

    await user.click(screen.getByLabelText('Ne plus afficher les visites automatiquement'));
    await user.keyboard('{Escape}');
    expect(complete).toHaveBeenCalledWith('demo');
    expect(autoDisplay).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it("s'arrête sans être comptée comme vue quand on change de page", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/a']}>
        <TourOverlay />
        <Routes>
          <Route path="/a" element={<Link to="/b">Ailleurs</Link>} />
          <Route path="/b" element={<p>Page B</p>} />
        </Routes>
      </MemoryRouter>,
    );
    act(() => useTourStore.getState().start(tour));
    await user.click(screen.getByText('Ailleurs'));
    expect(screen.getByText('Page B')).toBeInTheDocument();
    expect(useTourStore.getState().tour).toBeNull();
    expect(complete).not.toHaveBeenCalled();
  });
});

function Page({ ready = true }: { ready?: boolean }) {
  usePageTour(tour, ready);
  return null;
}
const renderPage = (url = '/', ready = true) =>
  render(<MemoryRouter initialEntries={[url]}><Page ready={ready} /></MemoryRouter>);

describe('usePageTour', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lance la visite à la première ouverture de la page, une fois la page prête', () => {
    const { unmount } = renderPage('/', false);
    act(() => vi.advanceTimersByTime(2000));
    expect(useTourStore.getState().tour).toBeNull();
    unmount();

    renderPage();
    act(() => vi.advanceTimersByTime(2000));
    expect(useTourStore.getState().tour?.key).toBe('demo');
  });

  it("ne se relance pas d'elle-même si elle est terminée ou si l'affichage automatique est coupé", () => {
    state = { autoEnabled: true, completed: ['demo'] };
    const first = renderPage();
    act(() => vi.advanceTimersByTime(2000));
    first.unmount();
    state = { autoEnabled: false, completed: [] };
    renderPage();
    act(() => vi.advanceTimersByTime(2000));
    expect(useTourStore.getState().tour).toBeNull();
  });

  it('se lance à la demande (?tour=) même déjà vue', () => {
    state = { autoEnabled: false, completed: ['demo'] };
    renderPage('/?tour=demo');
    act(() => vi.advanceTimersByTime(1000));
    expect(useTourStore.getState().tour?.key).toBe('demo');
  });
});
