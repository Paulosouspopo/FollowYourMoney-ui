import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useSearchStore } from './search.store';

/** Loupe qui ouvre la recherche globale ; `wide` : champ factice avec le raccourci (barre latérale). */
export function SearchButton({ wide = false, className }: { wide?: boolean; className?: string }) {
  const setOpen = useSearchStore(s => s.setOpen);
  if (wide) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className={cn('flex w-full items-center gap-2 rounded-xl bg-sidebar-accent/60 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors', className)}>
        <Search size={15} />
        <span className="flex-1 text-left">Rechercher…</span>
        <kbd className="rounded-md border border-border px-1.5 text-[10px] font-medium">Ctrl K</kbd>
      </button>
    );
  }
  return (
    <button type="button" onClick={() => setOpen(true)} aria-label="Rechercher" title="Rechercher (Ctrl K)"
      className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors', className)}>
      <Search size={17} />
    </button>
  );
}
