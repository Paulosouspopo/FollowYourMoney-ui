import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }

/** Feuille montante sur mobile, fenêtre centrée sur grand écran. Échap ferme. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center lg:p-6" role="dialog" aria-modal aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-3xl lg:rounded-3xl bg-card border-t lg:border border-border p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:pb-5 max-h-[92dvh] lg:max-h-[85dvh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom lg:slide-in-from-bottom-4 lg:fade-in lg:zoom-in-95 duration-200">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border lg:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 -mr-2 place-items-center rounded-full text-muted-foreground hover:bg-muted transition-colors" aria-label="Fermer"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
