import { ArrowLeftRight, TrendingUp } from 'lucide-react';
import { BottomSheet } from '@/shared/ui/BottomSheet';

export type EntryKind = 'transaction' | 'cash';

const CHOICES: { kind: EntryKind; icon: typeof TrendingUp; title: string; description: string }[] = [
  { kind: 'transaction', icon: TrendingUp, title: 'Opération sur un actif', description: 'Achat, vente ou dividende' },
  { kind: 'cash', icon: ArrowLeftRight, title: 'Mouvement d\'argent', description: 'Versement, retrait, intérêts ou frais' },
];

/** Compte avec suivi des liquidités : le bouton + propose les deux types de saisie. */
export function AddEntrySheet({ open, onClose, onChoose }: { open: boolean; onClose: () => void; onChoose: (kind: EntryKind) => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Ajouter">
      <div className="space-y-2">
        {CHOICES.map(c => (
          <button key={c.kind} type="button" onClick={() => onChoose(c.kind)}
            className="w-full flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:bg-muted/50 active:bg-muted">
            <span className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><c.icon size={18} /></span>
            <span>
              <span className="block text-sm font-medium">{c.title}</span>
              <span className="block text-xs text-muted-foreground">{c.description}</span>
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
