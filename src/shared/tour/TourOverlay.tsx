import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Hand, PartyPopper, Sparkles, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/ui/toast.store';
import { useTourStore } from './tour.store';
import { useCompleteTutorial, useTutorialAutoDisplay, useTutorials } from './tour.api';
import { findTarget } from './target';
import { placeBubble, spotlight, type Box } from './placement';
import type { Tour, TourStep } from './tour.types';

/** Visite guidée en cours, par-dessus l'app (rendue une fois, dans AppShell). */
export function TourOverlay() {
  const { tour, steps, index } = useTourStore();
  if (!tour || !steps[index]) return null;
  return createPortal(<TourLayer key={tour.key} tour={tour} steps={steps} index={index} />, document.body);
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const viewport = () => ({ w: document.documentElement.clientWidth || window.innerWidth, h: window.innerHeight });

/** Amène l'élément à l'écran s'il en sort (les éléments fixes, déjà visibles, ne bougent pas). */
function reveal(step: TourStep) {
  const el = findTarget(step.target);
  if (!el) return;
  const r = el.getBoundingClientRect();
  const { h } = viewport();
  if (r.top >= 64 && r.bottom <= h - 96) return;
  const tall = r.height > h * 0.55;
  window.scrollTo({ top: window.scrollY + r.top - (tall ? 80 : (h - r.height) / 2), behavior: reducedMotion() ? 'auto' : 'smooth' });
}

function TourLayer({ tour, steps, index }: { tour: Tour; steps: TourStep[]; index: number }) {
  const { go, stop } = useTourStore();
  const step = steps[index];
  const last = index === steps.length - 1;
  const titleId = useId();
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [vp, setVp] = useState(viewport);
  const [bubbleHeight, setBubbleHeight] = useState(220);
  const [dontShow, setDontShow] = useState(false);
  const autoEnabled = useTutorials().data?.autoEnabled ?? true;
  const complete = useCompleteTutorial();
  const autoDisplay = useTutorialAutoDisplay();

  // Changement de page (lien, retour) : la visite ne concerne plus l'écran, elle s'arrête sans être comptée comme vue
  const { pathname } = useLocation();
  const [startPath] = useState(pathname);
  useEffect(() => { if (pathname !== startPath) stop(); }, [pathname, startPath, stop]);

  // L'élément suit le défilement, les animations et le redimensionnement : mesure à chaque image, rendu seulement si ça bouge
  useEffect(() => {
    reveal(step);
    bubbleRef.current?.focus({ preventScroll: true });
    let frame = 0;
    let previous = '';
    const tick = () => {
      const r = findTarget(step.target)?.getBoundingClientRect();
      const v = viewport();
      const height = bubbleRef.current?.offsetHeight ?? 0;
      const signature = `${r ? `${r.top},${r.left},${r.width},${r.height}` : '-'}|${v.w},${v.h}|${height}`;
      if (signature !== previous) {
        previous = signature;
        setBox(r ? { top: r.top, left: r.left, width: r.width, height: r.height } : null);
        setVp(v);
        if (height) setBubbleHeight(height);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [step]);

  const finish = (done: boolean) => {
    complete.mutate(tour.key);
    if (dontShow) autoDisplay.mutate(false);
    stop();
    if (done) toast.success(`Visite « ${tour.title} » terminée ! Le bouton ? la relance quand tu veux.`);
  };
  const next = () => (last ? finish(true) : go(index + 1));

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') finish(false);
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') go(index - 1);
  });
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const hole = box ? spotlight(box, vp.w, vp.h) : null;
  const pos = placeBubble(hole, bubbleHeight, vp.w, vp.h);
  const Icon = step.icon ?? Sparkles;

  return (
    <div className="pointer-events-none fixed inset-0 z-[55]">
      {hole ? (
        <>
          {/* Autour de la zone éclairée : clics bloqués. Dedans : seulement si l'étape invite à essayer. */}
          <div className="pointer-events-auto fixed inset-x-0 top-0" style={{ height: hole.top }} />
          <div className="pointer-events-auto fixed inset-x-0 bottom-0" style={{ top: hole.top + hole.height }} />
          <div className="pointer-events-auto fixed left-0" style={{ top: hole.top, height: hole.height, width: hole.left }} />
          <div className="pointer-events-auto fixed right-0" style={{ top: hole.top, height: hole.height, left: hole.left + hole.width }} />
          {!step.interactive && <div className="pointer-events-auto fixed" style={hole} />}
          <div aria-hidden className="fixed rounded-2xl ring-2 ring-primary transition-all duration-300 ease-out"
            style={{ ...hole, boxShadow: '0 0 0 200vmax rgb(0 0 0 / 0.58)' }}>
            {step.interactive && <div className="tour-pulse absolute inset-0 rounded-2xl" />}
          </div>
        </>
      ) : (
        <div className="pointer-events-auto fixed inset-0 bg-black/58" />
      )}

      <div ref={bubbleRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className="pointer-events-auto fixed rounded-2xl bg-popover p-4 text-popover-foreground shadow-2xl ring-1 ring-border outline-none transition-[top,left] duration-300 ease-out"
        style={{ top: pos.top, left: pos.left, width: pos.width }}>
        <div key={index} style={{ animation: 'tour-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) backwards' }}>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              {last && steps.length > 1 ? <PartyPopper size={19} /> : <Icon size={19} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-muted-foreground">{tour.title} · {index + 1}/{steps.length}</p>
              <h2 id={titleId} className="text-base font-semibold leading-snug tracking-tight">{step.title}</h2>
            </div>
            <button type="button" onClick={() => finish(false)} aria-label="Fermer la visite"
              className="-mr-1.5 -mt-1 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{step.body}</div>
          {step.interactive && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-medium text-primary">
              <Hand size={13} /> À toi : essaie, c'est sans risque
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 items-center gap-1" aria-hidden>
            {steps.map((_, i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-5 bg-primary' : i < index ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-muted-foreground/30')} />
            ))}
          </div>
          {index > 0 && (
            <Button size="sm" variant="ghost" onClick={() => go(index - 1)} aria-label="Étape précédente">
              <ChevronLeft size={15} />
            </Button>
          )}
          <Button size="sm" onClick={next} className="min-w-24">
            {last ? "C'est compris !" : index === 0 ? "C'est parti" : 'Suivant'}
            {!last && <ChevronRight size={15} />}
          </Button>
        </div>
        {autoEnabled && (
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
            <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)} className="h-3.5 w-3.5 accent-primary" />
            Ne plus afficher les visites automatiquement
          </label>
        )}
      </div>
    </div>
  );
}
