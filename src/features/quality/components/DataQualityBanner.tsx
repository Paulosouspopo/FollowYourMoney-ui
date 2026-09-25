import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { toast } from '@/shared/ui/toast.store';
import { useDataIssues, useDismissIssue } from '../api/quality.api';

/**
 * Accueil : opérations qui ressemblent à des erreurs de saisie (prix loin du
 * cours du jour, actif hors PEA). Corriger ou déclarer « c'est normal ».
 */
export function DataQualityBanner() {
  const { data: issues = [] } = useDataIssues();
  const dismiss = useDismissIssue();
  const [open, setOpen] = useState(false);
  if (!issues.length) return null;

  return (
    <section className="rounded-2xl border border-warning/40 bg-warning/10 text-sm">
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-warning">
        <AlertTriangle size={16} className="shrink-0" />
        <span className="flex-1 font-medium">
          {issues.length} saisie{issues.length > 1 ? 's' : ''} à vérifier
        </span>
        <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="divide-y divide-warning/20 border-t border-warning/20">
          {issues.map(i => (
            <li key={i.key} className="space-y-2 px-4 py-3">
              <p className="text-foreground">{i.message}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link to={i.transactionId ? `/portfolios/${i.portfolioId}/positions/${encodeURIComponent(i.symbol)}` : `/portfolios/${i.portfolioId}`}
                  className="rounded-full bg-warning/20 px-2.5 py-1 font-medium text-warning hover:bg-warning/30">
                  {i.transactionId ? "Corriger l'opération" : 'Voir le portefeuille'}
                </Link>
                <button type="button" disabled={dismiss.isPending}
                  onClick={() => dismiss.mutate(i.key, { onError: e => toast.error(e.message) })}
                  className="rounded-full px-2.5 py-1 text-muted-foreground hover:bg-muted">
                  C'est normal
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
