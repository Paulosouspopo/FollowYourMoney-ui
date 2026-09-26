import { CircleHelp } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useTourStore } from './tour.store';
import type { Tour } from './tour.types';

/** Bouton « ? » d'une page : relance sa visite guidée à tout moment. */
export function TourButton({ tour, className }: { tour: Tour; className?: string }) {
  const start = useTourStore(s => s.start);
  const label = `Visite guidée : ${tour.title}`;
  return (
    <button type="button" onClick={() => start(tour)} aria-label={label} title={label} data-tour="help"
      className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors', className)}>
      <CircleHelp size={18} />
    </button>
  );
}
