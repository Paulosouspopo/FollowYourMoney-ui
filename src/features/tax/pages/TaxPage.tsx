import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Download, Info, Landmark } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { TOURS } from '@/features/guide/tours';
import { usePageTour } from '@/shared/tour/usePageTour';
import { TourButton } from '@/shared/tour/TourButton';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { QueryBoundary } from '@/shared/ui/QueryBoundary';
import { Skeleton } from '@/shared/ui/skeleton';
import { FormSelect } from '@/shared/ui/form-select';
import { MoneyValue } from '@/shared/components/data/MoneyValue';
import { toast } from '@/shared/ui/toast.store';
import { cn } from '@/shared/lib/cn';
import { formatDate, formatEur, formatMonthYear, formatQty } from '@/shared/lib/format';
import { useTaxReport } from '../api/tax.api';
import { downloadCsv, salesCsv } from '../model/taxCsv';
import type { PeaStatus, TaxBox, TaxReport } from '../model/tax.types';
import { fiveYearsProgress } from '../model/pea';

/**
 * Fiscalité : ce qu'il faut déclarer pour une année (revenus de l'année,
 * déclarés au printemps suivant), cessions détaillées, état des PEA.
 */
export default function TaxPage() {
  const [year, setYear] = useState<number | null>(null);
  const q = useTaxReport(year);
  usePageTour(TOURS.tax, q.isSuccess);
  return (
    <div className="lg:max-w-5xl">
      <TopBar back title="Fiscalité" right={<>
        <TourButton tour={TOURS.tax} />
        {q.data && (
          <span data-tour="tax-year" className="flex">
            <FormSelect className="w-28" value={String(q.data.year)} onChange={v => setYear(Number(v))}
              options={q.data.years.map(y => ({ value: String(y), label: String(y) }))} />
          </span>
        )}
      </>} />
      <QueryBoundary query={q} skeleton={<Skeleton className="h-96 w-full rounded-2xl" />}>
        {r => <Report report={r} />}
      </QueryBoundary>
    </div>
  );
}

function Report({ report: r }: { report: TaxReport }) {
  const total = r.securities.estimatedTaxEur + r.crypto.estimatedTaxEur;
  const boxes = [...r.securities.boxes, ...r.crypto.boxes];
  const hasSales = r.securities.sales.length + r.crypto.sales.length > 0;

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0">
      <div className="space-y-6 lg:col-span-7 min-w-0">
        <section data-tour="tax-hero" className="glow -mx-4 px-4 md:mx-0 md:px-0 pt-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Impôt estimé sur {r.year} · à déclarer en {r.year + 1}
          </p>
          <p className="text-display mt-2">{formatEur(total)}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Flat tax 30 % (12,8 % d'impôt + 17,2 % de prélèvements sociaux), hors PEA et livrets réglementés.
          </p>
        </section>

        <section data-tour="tax-boxes">
          <SectionHeader title="Cases à reporter" action={<span className="text-[11px] text-muted-foreground">déclaration de revenus</span>} />
          {boxes.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">
              Rien à déclarer pour {r.year} d'après tes opérations{r.crypto.exempt && r.crypto.sales.length > 0
                ? ' (cessions de crypto sous la franchise de 305 €)' : ''}.
            </Card>
          ) : (
            <Card className="p-0 gap-0">
              <ul className="divide-y divide-border">{boxes.map(b => <BoxRow key={b.code} box={b} />)}</ul>
            </Card>
          )}
        </section>

        <section>
          <SectionHeader title="Titres (CTO, compte ordinaire)" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Stat label="Plus-values" value={r.securities.gainsEur} colored />
            <Stat label="Moins-values" value={r.securities.lossesEur} colored />
            <Stat label="Pertes passées imputées" value={r.securities.carriedLossesUsedEur} />
            <Stat label="Dividendes" value={r.securities.dividendsEur} />
          </div>
          {r.securities.lossesCarryForwardEur > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              <MoneyValue value={r.securities.lossesCarryForwardEur} className="font-medium text-foreground" /> de moins-values
              restent imputables sur tes plus-values des prochaines années (10 ans).
            </p>
          )}
          {r.securities.sales.length > 0 && (
            <Card className="mt-3 p-0 gap-0">
              <ul className="divide-y divide-border">
                {r.securities.sales.map((s, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.name || s.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(s.date)} · {formatQty(s.quantity)} vendu{s.quantity > 1 ? 's' : ''} · coût (PMP) <MoneyValue value={s.costEur} />
                      </p>
                    </div>
                    <div className="text-right">
                      <MoneyValue value={s.proceedsEur} className="block text-xs text-muted-foreground" />
                      <MoneyValue value={s.gainEur} signed colored className="text-sm font-semibold" />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>

        <section>
          <SectionHeader title="Crypto-actifs" action={r.crypto.sales.length > 0 && (
            <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium',
              r.crypto.exempt ? 'bg-gain/15 text-gain' : 'bg-muted text-muted-foreground')}>
              {r.crypto.exempt ? 'Sous la franchise de 305 €' : 'Formulaire 2086'}
            </span>)} />
          {r.crypto.sales.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">
              Aucune vente de crypto contre des euros en {r.year}. Les échanges entre cryptos ne sont pas imposables.
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Total des cessions" value={r.crypto.totalProceedsEur} />
                <Stat label="Plus-value nette" value={r.crypto.netGainEur} colored />
              </div>
              <Card className="mt-3 p-0 gap-0">
                <ul className="divide-y divide-border">
                  {r.crypto.sales.map((s, i) => (
                    <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{s.symbol}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(s.date)} · portefeuille <MoneyValue value={s.portfolioValueEur} /> · part d'acquisition <MoneyValue value={s.acquisitionShareEur} />
                        </p>
                      </div>
                      <div className="text-right">
                        <MoneyValue value={s.proceedsEur} className="block text-xs text-muted-foreground" />
                        <MoneyValue value={s.gainEur} signed colored className="text-sm font-semibold" />
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Méthode officielle (art. 150 VH bis) : gain = prix de cession − prix total d'acquisition × prix de cession ÷ valeur
                de tout ton portefeuille crypto au moment de la vente.
              </p>
            </>
          )}
        </section>

        {hasSales && (
          <Button variant="outline" className="w-full" data-tour="tax-export"
            onClick={() => downloadCsv(`cessions-${r.year}.csv`, salesCsv(r))}>
            <Download size={16} /> Exporter les cessions {r.year} (CSV)
          </Button>
        )}
      </div>

      <aside className="space-y-6 lg:col-span-5 min-w-0 lg:pt-2">
        {r.peas.length > 0 && (
          <section data-tour="tax-pea">
            <SectionHeader title="PEA" />
            <div className="space-y-3">{r.peas.map(p => <PeaCard key={p.portfolioId} pea={p} />)}</div>
          </section>
        )}
        <section>
          <SectionHeader title="À savoir" />
          <Card className="p-4 space-y-2.5 text-xs text-muted-foreground">
            {r.reminders.map((m, i) => (
              <p key={i} className="flex gap-2"><Info size={14} className="mt-px shrink-0" /> {m}</p>
            ))}
          </Card>
        </section>
      </aside>
    </div>
  );
}

function BoxRow({ box: b }: { box: TaxBox }) {
  const copy = () => navigator.clipboard?.writeText(String(Math.round(b.amountEur)))
    .then(() => toast.success(`Case ${b.code} copiée`), () => undefined);
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="grid h-10 min-w-12 place-items-center rounded-xl bg-primary/12 px-2 text-sm font-bold text-primary">{b.code}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{b.label}</p>
        <p className="text-[11px] text-muted-foreground">Formulaire {b.form}</p>
      </div>
      <MoneyValue value={b.amountEur} className="text-sm font-semibold" />
      <button type="button" onClick={copy} aria-label={`Copier le montant de la case ${b.code}`}
        className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted">
        <Copy size={14} />
      </button>
    </li>
  );
}

function PeaCard({ pea: p }: { pea: PeaStatus }) {
  const ceilingPct = Math.min(100, (p.depositsEur / p.ceilingEur) * 100);
  const progress = fiveYearsProgress(p.openedAt);
  return (
    <Card className="p-4 gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/12 text-primary"><Landmark size={16} /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{p.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {p.openedAt ? `Ouvert en ${formatMonthYear(p.openedAt)}${p.openedAtEstimated ? ' (estimé)' : ''}` : 'Date d\'ouverture inconnue'}
          </p>
        </div>
      </div>
      <div>
        <p className={cn('text-sm font-medium', p.fiveYearsReached ? 'text-gain' : 'text-foreground')}>
          {p.fiveYearsReached ? '5 ans atteints : retraits possibles sans clôture'
            : p.fiveYearsDate ? `5 ans le ${formatDate(p.fiveYearsDate)}` : '—'}
        </p>
        {!p.fiveYearsReached && p.fiveYearsDate && (
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground">
          {p.fiveYearsReached ? 'Seuls les prélèvements sociaux (17,2 %) s\'appliquent sur les gains retirés.'
            : 'Un retrait avant 5 ans clôture le PEA et rend les gains imposables.'}
        </p>
      </div>
      <div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Versements{p.depositsEstimated ? ' (estimés)' : ''}</span>
          <span><MoneyValue value={p.depositsEur} className="font-medium" /> / <MoneyValue value={p.ceilingEur} /></span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-chart-2" style={{ width: `${ceilingPct}%` }} />
        </div>
      </div>
      {p.socialChargesIfWithdrawnEur > 0 && (
        <p className="text-xs text-muted-foreground">
          Retrait total aujourd'hui : ≈ <MoneyValue value={p.socialChargesIfWithdrawnEur} className="font-medium text-foreground" /> de prélèvements sociaux.
        </p>
      )}
      {p.openedAtEstimated && (
        <Link to={`/portfolios/${p.portfolioId}`} className="text-xs font-medium text-primary">
          Renseigne la date d'ouverture (Modifier le portefeuille) pour un calcul exact
        </Link>
      )}
    </Card>
  );
}

function Stat({ label, value, colored }: { label: string; value: number; colored?: boolean }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border px-3.5 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <MoneyValue value={value} signed={colored} colored={colored} className="block text-base font-semibold tracking-tight mt-0.5" />
    </div>
  );
}
