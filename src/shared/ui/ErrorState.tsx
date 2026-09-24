import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { getErrorMessage } from '@/shared/api/errors';

interface Props { error: unknown; onRetry?: () => void }

export function ErrorState({ error, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div className="h-14 w-14 rounded-2xl bg-loss/15 flex items-center justify-center mb-4">
        <AlertCircle size={26} className="text-loss" />
      </div>
      <p className="font-medium">Une erreur est survenue</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">{getErrorMessage(error)}</p>
      {onRetry && <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>Réessayer</Button>}
    </div>
  );
}