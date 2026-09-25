import { Link } from 'react-router-dom';
import { ChevronRight, Landmark } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { useTaxReport } from '../api/tax.api';

/** Accueil : impôt estimé sur l'année écoulée, ou état du PEA. Masquée s'il n'y a rien à dire. */
export function TaxCard() {
  const { data } = useTaxReport(null);
  if (!data) return null;
  const tax = data.securities.estimatedTaxEur + data.crypto.estimatedTaxEur;
  const boxes = data.securities.boxes.length + data.crypto.boxes.length;
  if (tax === 0 && boxes === 0 && data.peas.length === 0) return null;
  return (
    <Link to="/tax" className="group block">
      <Card className="p-4 flex-row items-center gap-3 transition-colors group-hover:ring-primary/40">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-chart-2/15 text-chart-2"><Landmark size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Fiscalité {data.year}</p>
          <p className="text-sm font-semibold">
            {boxes > 0 ? <>≈ <MoneyValue value={tax} /> d'impôt estimé</> : 'Rien à déclarer'}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {boxes > 0 ? `${boxes} case${boxes > 1 ? 's' : ''} à reporter` : 'Suivi de tes PEA'}
          </p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
      </Card>
    </Link>
  );
}
