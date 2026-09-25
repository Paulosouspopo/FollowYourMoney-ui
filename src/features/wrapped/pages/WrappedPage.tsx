import { useEffect, useEffectEvent, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { TopBar } from '@/app/layout/TopBar';
import { FormSelect } from '@/shared/ui/form-select';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { toast } from '@/shared/ui/toast.store';
import { formatEur } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { useWrapped } from '../api/wrapped.api';
import { MONTH_NAMES, type Wrapped } from '../model/wrapped.types';
import { renderShareCard } from '../model/shareCard';

const signedPct = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

/** Fonds des diapositives : dégradés à partir des couleurs du thème. */
const BACKGROUNDS = [
  'linear-gradient(160deg, color-mix(in oklch, var(--primary) 70%, black), var(--primary))',
  'linear-gradient(160deg, color-mix(in oklch, var(--positive) 55%, black), color-mix(in oklch, var(--primary) 80%, black))',
  'linear-gradient(160deg, color-mix(in oklch, var(--primary) 55%, black), color-mix(in oklch, var(--positive) 70%, black))',
  'linear-gradient(160deg, color-mix(in oklch, var(--warning) 45%, black), color-mix(in oklch, var(--primary) 75%, black))',
];

interface Slide { key: string; content: ReactNode; }

function slides(w: Wrapped): Slide[] {
  const out: Slide[] = [];
  const Big = ({ children, tone }: { children: ReactNode; tone?: 'gain' | 'loss' }) => (
    <p className={cn('text-6xl font-bold tracking-tight tabular-nums', tone === 'loss' ? 'text-white/80' : 'text-white')}>{children}</p>
  );
  out.push({ key: 'intro', content: <>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">Ton année</p>
    <p className="text-7xl font-bold tracking-tight">{w.year}</p>
    <p className="text-lg text-white/85">{w.complete ? 'Prêt à revivre ton année d\'investisseur ?' : 'Ton année jusqu\'ici. Prêt ?'}</p>
    <p className="text-xs text-white/60">Touche l'écran pour avancer</p>
  </> });
  out.push({ key: 'perf', content: <>
    <p className="text-lg text-white/85">Tes placements ont fait</p>
    <Big tone={w.twrPct < 0 ? 'loss' : 'gain'}>{signedPct(w.twrPct)}</Big>
    {w.benchmarkPct != null && (
      <p className="text-lg text-white/85">
        {w.twrPct >= w.benchmarkPct
          ? <>Le {w.benchmarkName} a fait {signedPct(w.benchmarkPct)} : tu l'as battu de <span className="font-bold text-white">{(w.twrPct - w.benchmarkPct).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} points</span>.</>
          : <>Le {w.benchmarkName} a fait {signedPct(w.benchmarkPct)}. L'an prochain, la revanche ?</>}
      </p>
    )}
  </> });
  out.push({ key: 'gain', content: <>
    <p className="text-lg text-white/85">En euros, ça donne</p>
    <Big tone={w.gainEur < 0 ? 'loss' : 'gain'}>{w.gainEur >= 0 ? '+' : '−'}{formatEur(Math.abs(w.gainEur))}</Big>
    <p className="text-lg text-white/85">
      et tu as versé {formatEur(Math.max(w.netDepositsEur, 0))} de plus. Ton patrimoine suivi : {formatEur(w.endValueEur)}.
    </p>
  </> });
  if (w.bestMonth != null && w.worstMonth != null) {
    const best = w.months[w.bestMonth - 1]!, worst = w.months[w.worstMonth - 1]!;
    out.push({ key: 'months', content: <>
      <p className="text-lg text-white/85">Ton meilleur mois</p>
      <p className="text-5xl font-bold capitalize">{MONTH_NAMES[w.bestMonth - 1]}</p>
      <p className="text-3xl font-semibold tabular-nums">{signedPct(best)}</p>
      <MonthBars months={w.months} />
      <p className="text-white/80">Le plus dur : {MONTH_NAMES[w.worstMonth - 1]} ({signedPct(worst)}).</p>
    </> });
  }
  if (w.bestLine) {
    out.push({ key: 'star', content: <>
      <p className="text-lg text-white/85">Ta star de l'année</p>
      <p className="text-4xl font-bold leading-tight">{w.bestLine.name}</p>
      <p className="text-3xl font-semibold tabular-nums">+{formatEur(w.bestLine.gainEur)}{w.bestLine.returnPct != null && <span className="text-white/75"> · {signedPct(w.bestLine.returnPct)}</span>}</p>
      {w.worstLine && <p className="text-white/80">Et la ligne qui a le plus pesé : {w.worstLine.name} (−{formatEur(Math.abs(w.worstLine.gainEur))}).</p>}
    </> });
  }
  if (w.dividendsEur + w.interestEur > 0) {
    out.push({ key: 'income', content: <>
      <p className="text-lg text-white/85">Sans rien faire, tes placements t'ont versé</p>
      <Big>{formatEur(w.dividendsEur + w.interestEur)}</Big>
      <p className="text-white/80">{w.dividendsEur > 0 && `${formatEur(w.dividendsEur)} de dividendes`}{w.dividendsEur > 0 && w.interestEur > 0 && ' et '}{w.interestEur > 0 && `${formatEur(w.interestEur)} d'intérêts`}.</p>
    </> });
  }
  out.push({ key: 'activity', content: <>
    <p className="text-lg text-white/85">Côté action</p>
    <Big>{w.operations}</Big>
    <p className="text-lg text-white/85">opérations : {w.buys} achat{w.buys > 1 ? 's' : ''}, {w.sells} vente{w.sells > 1 ? 's' : ''}, sur {w.activeMonths} mois{w.newAssets > 0 && `, dont ${w.newAssets} nouvel${w.newAssets > 1 ? 's' : ''} actif${w.newAssets > 1 ? 's' : ''}`}.</p>
    {w.feesEur > 0 && <p className="text-white/75">Frais payés : {formatEur(w.feesEur)}.</p>}
  </> });
  out.push({ key: 'persona', content: <>
    <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">Ton profil {w.year}</p>
    <p className="text-5xl font-bold leading-tight">{w.personality.title}</p>
    <p className="text-lg text-white/85">{w.personality.text}</p>
  </> });
  return out;
}

function MonthBars({ months }: { months: (number | null)[] }) {
  const max = Math.max(...months.map(m => Math.abs(m ?? 0)), 1);
  // Ligne de base au milieu : hausses au-dessus, baisses en dessous
  return (
    <div className="flex h-24 gap-1" aria-hidden>
      {months.map((m, i) => {
        const h = m == null ? 0 : Math.max((Math.abs(m) / max) * 100, 6);
        return (
          <div key={i} className="flex flex-1 flex-col">
            <div className="flex h-1/2 items-end border-b border-white/25">
              {m != null && m >= 0 && <div className="w-full rounded-t-sm bg-white" style={{ height: `${h}%` }} />}
            </div>
            <div className="flex h-1/2 items-start">
              {m != null && m < 0 && <div className="w-full rounded-b-sm bg-white/45" style={{ height: `${h}%` }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Bilan de l'année façon « story » : une diapositive à la fois, au toucher ou au clavier, puis une carte à partager. */
export default function WrappedPage() {
  const [year, setYear] = useState<number | null>(null);
  const q = useWrapped(year);
  const [index, setIndex] = useState(0);
  const list = useMemo(() => (q.data ? slides(q.data) : []), [q.data]);
  const last = index >= list.length - 1;

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, list.length - 1));
    if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0));
  });
  useEffect(() => {
    const l = (e: KeyboardEvent) => onKey(e);
    window.addEventListener('keydown', l);
    return () => window.removeEventListener('keydown', l);
  }, []);

  const share = async () => {
    if (!q.data) return;
    const blob = await renderShareCard(q.data);
    if (!blob) return toast.error('Image impossible à créer sur cet appareil');
    const file = new File([blob], `bilan-${q.data.year}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: `Mon année ${q.data.year}` }).catch(() => undefined);
    } else {
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <TopBar back title="Bilan de l'année" right={q.data && (
        <FormSelect className="w-28" value={String(q.data.year)} onChange={v => { setYear(Number(v)); setIndex(0); }}
          options={q.data.years.map(y => ({ value: String(y), label: String(y) }))} />
      )} />
      {q.isPending ? <Skeleton className="aspect-[9/14] w-full rounded-3xl" />
        : q.isError ? <EmptyState title="Pas encore de bilan" description={q.error.message} />
          : (
            <>
              <div className="relative aspect-[9/14] w-full select-none overflow-hidden rounded-3xl text-white shadow-2xl transition-[background] duration-500"
                style={{ background: BACKGROUNDS[index % BACKGROUNDS.length] }}>
                <div className="absolute inset-x-4 top-4 flex gap-1" aria-hidden>
                  {list.map((s, i) => (
                    <span key={s.key} className={cn('h-1 flex-1 rounded-full', i <= index ? 'bg-white' : 'bg-white/30')} />
                  ))}
                </div>
                <div key={list[index]?.key} className="animate-rise flex h-full flex-col justify-center gap-4 px-7" aria-live="polite">
                  {list[index]?.content}
                </div>
                <button type="button" aria-label="Diapositive précédente" onClick={() => setIndex(i => Math.max(i - 1, 0))}
                  className="absolute inset-y-0 left-0 w-1/3" />
                <button type="button" aria-label="Diapositive suivante" onClick={() => setIndex(i => Math.min(i + 1, list.length - 1))}
                  className="absolute inset-y-0 right-0 w-2/3" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">{index + 1} / {list.length}</p>
                {last ? (
                  <Button onClick={share}><Share2 size={16} /> Partager (en %)</Button>
                ) : (
                  <Link to="/analysis" className="text-xs text-primary">Voir la radiographie</Link>
                )}
              </div>
              {last && <p className="mt-2 text-[11px] text-muted-foreground">L'image partagée ne montre que des pourcentages, jamais tes montants.</p>}
            </>
          )}
    </div>
  );
}
