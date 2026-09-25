import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, ChevronDown, ChevronRight, CircleCheck, Play, RotateCcw, Trophy } from 'lucide-react';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/Switch';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { toast } from '@/shared/ui/toast.store';
import { cn } from '@/shared/lib/cn';
import { useDashboard } from '@/features/dashboard/api/dashboard.api';
import { useResetTutorials, useTutorialAutoDisplay, useTutorials } from '@/shared/tour/tour.api';
import { forgetShownTours } from '@/shared/tour/usePageTour';
import { FAQ, GLOSSARY, QUIZ } from '../model/guide.content';
import { guideEntries, type GuideEntry } from '../model/guideEntries';

/** Guide d'utilisation : visites guidées (avec progression), lexique, quiz, questions fréquentes. */
export default function GuidePage() {
  const dashboard = useDashboard('30d');
  const state = useTutorials().data;
  const entries = guideEntries(dashboard.data?.portfolios ?? []);
  const done = entries.filter(e => state?.completed.includes(e.tour.key)).length;

  return (
    <div className="space-y-8 pt-4 lg:max-w-3xl">
      <header className="glow -mx-4 px-4 md:mx-0 md:px-0 pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Guide d'utilisation</h1>
        <p className="mt-1 text-sm text-muted-foreground">Des visites de 30 secondes, le sens de chaque chiffre, et un petit quiz pour vérifier.</p>
        <Progress done={done} total={entries.length} />
      </header>

      <section>
        <SectionHeader title="Visites guidées" />
        <div className="grid gap-2 md:grid-cols-2">
          {entries.map(e => <TourCard key={e.tour.key} entry={e} seen={!!state?.completed.includes(e.tour.key)} />)}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Sur chaque page, le bouton ? relance sa visite.</p>
      </section>

      <Quiz />

      <section>
        <SectionHeader title="Lexique" />
        <div className="space-y-4">
          {GLOSSARY.map(group => (
            <div key={group.title}>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>
              <Card className="p-0 gap-0">
                <ul className="divide-y divide-border">
                  {group.entries.map(g => (
                    <li key={g.term}>
                      <Disclosure title={g.term}>
                        <p>{g.definition}</p>
                        {g.example && <p className="mt-2 rounded-lg bg-muted/70 px-3 py-2 text-xs text-foreground">{g.example}</p>}
                      </Disclosure>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Comment faire…" />
        <Card className="p-0 gap-0">
          <ul className="divide-y divide-border">
            {FAQ.map(f => (
              <li key={f.question}>
                <Disclosure title={f.question}>
                  <p>{f.answer}</p>
                  {f.link && (
                    <Link to={f.link.to} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                      {f.link.label} <ChevronRight size={13} />
                    </Link>
                  )}
                </Disclosure>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Preferences />
    </div>
  );
}

function Progress({ done, total }: { done: number; total: number }) {
  const all = done >= total;
  return (
    <div className="mt-5 flex items-center gap-3">
      <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl',
        all ? 'bg-positive-bg text-gain' : 'bg-primary/12 text-primary')}>
        <Trophy size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {all ? 'Tu connais l\'app sur le bout des doigts !' : `${done} visite${done > 1 ? 's' : ''} sur ${total} découverte${done > 1 ? 's' : ''}`}
        </p>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}
          aria-label="Visites découvertes">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function TourCard({ entry: { tour, path, needs }, seen }: { entry: GuideEntry; seen: boolean }) {
  const navigate = useNavigate();
  const Icon = tour.icon;
  return (
    <button type="button" disabled={!path} onClick={() => path && navigate(`${path}?tour=${tour.key}`)}
      className="group flex items-start gap-3 rounded-2xl bg-card p-3.5 text-left ring-1 ring-border transition hover:ring-primary/50 disabled:opacity-55 disabled:hover:ring-border">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"><Icon size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {tour.title}
          {seen && <CircleCheck size={14} className="text-gain" aria-label="déjà vue" />}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{path ? tour.summary : needs}</span>
      </span>
      {path && (
        <span className="mt-2.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Play size={13} />
        </span>
      )}
    </button>
  );
}

/** Quiz : une réponse par question, correction immédiate et explication. */
function Quiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const answered = answers.filter(a => a != null).length;
  const score = answers.filter((a, i) => a === QUIZ[i].answer).length;
  const finished = answered === QUIZ.length;

  return (
    <section>
      <SectionHeader title="Teste-toi" action={<span className="text-[11px] text-muted-foreground">{answered}/{QUIZ.length}</span>} />
      <Card className="p-4 space-y-5">
        {QUIZ.map((q, i) => {
          const chosen = answers[i];
          return (
            <div key={q.question}>
              <p className="flex gap-2 text-sm font-medium"><Brain size={16} className="mt-0.5 shrink-0 text-primary" /> {q.question}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options.map((o, j) => {
                  const right = chosen != null && j === q.answer;
                  const wrong = chosen === j && j !== q.answer;
                  return (
                    <button key={o} type="button" disabled={chosen != null}
                      onClick={() => setAnswers(a => a.map((x, k) => (k === i ? j : x)))}
                      className={cn('rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition',
                        right ? 'bg-positive-bg text-gain ring-transparent'
                          : wrong ? 'bg-negative-bg text-loss ring-transparent'
                            : chosen != null ? 'ring-border text-muted-foreground' : 'ring-border hover:ring-primary hover:text-primary')}>
                      {o}
                    </button>
                  );
                })}
              </div>
              {chosen != null && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground animate-rise">
                  <span className={cn('font-semibold', chosen === q.answer ? 'text-gain' : 'text-loss')}>
                    {chosen === q.answer ? 'Bien vu ! ' : 'Pas tout à fait. '}
                  </span>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
        {finished && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-primary/10 px-3 py-2.5 animate-rise">
            <p className="text-sm font-medium">
              {score === QUIZ.length ? `Sans faute : ${score}/${QUIZ.length} !` : `${score}/${QUIZ.length} : le lexique ci-dessous t'attend.`}
            </p>
            <Button size="sm" variant="ghost" onClick={() => setAnswers(QUIZ.map(() => null))}><RotateCcw size={14} /> Rejouer</Button>
          </div>
        )}
      </Card>
    </section>
  );
}

function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-muted/50 transition-colors">
        <span className="flex-1">{title}</span>
        <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="px-4 pb-3.5 -mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div>}
    </>
  );
}

function Preferences() {
  const state = useTutorials().data;
  const auto = useTutorialAutoDisplay();
  const reset = useResetTutorials();
  return (
    <section>
      <SectionHeader title="Préférences" />
      <Card className="p-4 space-y-4">
        <Switch checked={state?.autoEnabled ?? true} disabled={!state || auto.isPending}
          onChange={v => auto.mutate(v, { onError: e => toast.error(e.message) })}
          label="Afficher les visites automatiquement"
          description="À la première ouverture de chaque page. Réglage enregistré sur ton compte." />
        <Button variant="outline" className="w-full" loading={reset.isPending}
          onClick={() => reset.mutate(undefined, {
            onSuccess: () => {
              forgetShownTours();
              toast.success('Visites remises à zéro : elles se relanceront page après page');
            },
            onError: e => toast.error(e.message),
          })}>
          <RotateCcw size={15} /> Tout revoir depuis le début
        </Button>
      </Card>
    </section>
  );
}
