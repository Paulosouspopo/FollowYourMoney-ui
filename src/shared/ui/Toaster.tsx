import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useToastStore } from './toast.store';

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none" aria-live="polite">
      {toasts.map(t => {
        const Icon = t.tone === 'success' ? CheckCircle2 : AlertCircle;
        return (
          <div key={t.id} role="status"
            className="pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10 shadow-lg px-3 py-2.5 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <Icon size={18} className={cn('shrink-0', t.tone === 'success' ? 'text-gain' : 'text-loss')} />
            <span className="flex-1">{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} className="p-1 text-muted-foreground" aria-label="Fermer"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}
