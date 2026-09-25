import { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { MAX_FILE_SIZE } from '../api/import.api';

interface Props { onFile: (file: File) => void; loading?: boolean; error?: string | null; }

/** Zone de dépôt (glisser-déposer ou clic) pour un export CSV. */
export function FileDrop({ onFile, loading, error }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!/\.(csv|txt)$/i.test(file.name)) return setLocalError('Choisis un fichier .csv exporté depuis ton courtier');
    if (file.size > MAX_FILE_SIZE) return setLocalError('Fichier trop volumineux (5 Mo maximum)');
    setLocalError(null);
    onFile(file);
  };

  return (
    <div>
      <button type="button" disabled={loading}
        onClick={() => input.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files[0]); }}
        className={cn('w-full rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center transition-colors',
          dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60')}>
        {loading
          ? <Loader2 size={28} className="animate-spin text-muted-foreground" />
          : <FileUp size={28} className="text-primary" />}
        <span className="text-sm font-medium">{loading ? 'Lecture du fichier…' : 'Choisir ou déposer un export CSV'}</span>
        <span className="text-xs text-muted-foreground">Fortuneo, Trade Republic, Binance reconnus automatiquement · autres formats : colonnes à associer</span>
      </button>
      <input ref={input} type="file" accept=".csv,.txt,text/csv" className="hidden" aria-label="Fichier à importer"
        onChange={e => { accept(e.target.files?.[0]); e.target.value = ''; }} />
      {(localError || error) && <p role="alert" className="text-xs text-loss mt-2">{localError ?? error}</p>}
    </div>
  );
}
