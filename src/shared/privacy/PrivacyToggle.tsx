import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { usePrivacyStore } from './privacy.store';

/** Bouton œil : masque / affiche les montants partout dans l'app. */
export function PrivacyToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const { hidden, toggle } = usePrivacyStore();
  const label = hidden ? 'Afficher les montants' : 'Masquer les montants';
  return (
    <button type="button" onClick={toggle} aria-pressed={hidden} aria-label={label} title={label}
      className={cn('inline-flex items-center gap-2 rounded-full text-muted-foreground hover:text-foreground transition-colors',
        withLabel ? 'px-3 py-2 text-sm hover:bg-muted' : 'h-8 w-8 justify-center hover:bg-muted', className)}>
      {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
      {withLabel && <span>{label}</span>}
    </button>
  );
}
