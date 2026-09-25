import { Pencil } from 'lucide-react';

/**
 * Indice visuel « modifiable » en bout de ligne cliquable (la ligne entière
 * reste la cible). Parent attendu : classe `group`.
 */
export function EditHint() {
  return (
    <span aria-hidden
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary/12 group-hover:text-primary">
      <Pencil size={14} />
    </span>
  );
}
