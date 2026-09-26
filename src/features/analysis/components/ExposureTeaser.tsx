import { Link } from 'react-router-dom';
import { ChevronRight, ScanSearch } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { useExposure } from '../api/analysis.api';
import { SECTOR_LABEL, formatShare } from '../model/labels';

/** Accueil : le pays et le secteur dominants, et les frais annuels des fonds. Masquée sans actions. */
export function ExposureTeaser() {
  const { data } = useExposure(null);
  if (!data || data.equityEur <= 0) return null;
  const country = data.countries.find(c => c.key !== '??');
  const sector = data.sectors.find(s => s.key !== 'unknown');
  return (
    <Link to="/analysis" className="group block">
      <Card className="p-4 flex-row items-center gap-3 transition-colors group-hover:ring-primary/40">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><ScanSearch size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Radiographie</p>
          <p className="truncate text-sm font-semibold tracking-tight">
            {country && <>{formatShare(country.pct)} {country.label}</>}
            {country && sector && ' · '}
            {sector && <>{formatShare(sector.pct)} {SECTOR_LABEL[sector.key] ?? sector.label}</>}
          </p>
          {data.fees.annualFundFeesEur > 0 && (
            <p className="truncate text-[11px] text-muted-foreground">
              Frais de tes fonds : <MoneyValue value={data.fees.annualFundFeesEur} /> / an
            </p>
          )}
        </div>
        <ChevronRight size={16} className="text-muted-foreground/60 group-hover:translate-x-0.5 transition-transform" />
      </Card>
    </Link>
  );
}
