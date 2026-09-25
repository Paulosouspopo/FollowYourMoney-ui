import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { isWrappedSeason } from '../model/season';

/** Accueil, en fin et début d'année : invitation à ouvrir le bilan. */
export function WrappedTeaser() {
  const now = new Date();
  if (!isWrappedSeason(now)) return null;
  const year = now.getMonth() === 11 ? now.getFullYear() : now.getFullYear() - 1;
  return (
    <Link to="/wrapped" className="group block">
      <Card className="p-4 flex-row items-center gap-3 bg-primary/10 ring-primary/30 transition-colors group-hover:ring-primary/60">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">C'est prêt</p>
          <p className="text-base font-semibold tracking-tight">Ton bilan {year} t'attend</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
      </Card>
    </Link>
  );
}
