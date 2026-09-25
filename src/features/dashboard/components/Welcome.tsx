import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, FileUp, Wallet } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PortfolioFormSheet } from '@/features/portfolios/components/PortfolioFormSheet';
import { Logo } from '@/app/layout/Logo';
import { TourButton } from '@/shared/tour/TourButton';
import { TOURS } from '@/features/guide/tours';

const STEPS = [
  { icon: Wallet, title: 'Crée ton premier portefeuille',
    text: 'PEA, compte-titres, crypto, livret : un portefeuille par compte, comme chez ta banque.' },
  { icon: FileUp, title: 'Ajoute tes opérations',
    text: "À la main, ou d'un coup en important le relevé de ton courtier (Fortuneo, Trade Republic, Binance…)." },
  { icon: BellRing, title: 'Laisse l\'app veiller',
    text: 'Cours chaque heure, performance réelle, alertes et rapport quand tu le souhaites.' },
];

/** Premier lancement : aucun portefeuille. Une promesse claire et une seule action principale. */
export function Welcome() {
  const [creating, setCreating] = useState(false);
  return (
    <div className="glow -mx-4 px-4 md:mx-0 md:px-8 md:rounded-3xl pt-8 pb-4 lg:pt-12">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between">
          <Logo className="h-11 w-11" />
          <TourButton tour={TOURS.start} />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-[-0.035em] leading-[1.05]">
          Tout ton patrimoine.<br /><span className="text-primary">Enfin clair.</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-md">
          Tes comptes réunis, valorisés au cours du marché, avec ta vraie performance — frais, dividendes et versements compris.
        </p>
        <Button size="lg" className="mt-7 rounded-xl" onClick={() => setCreating(true)} data-tour="welcome-create">
          Créer mon premier portefeuille <ArrowRight size={16} />
        </Button>
      </div>

      <ol data-tour="welcome-steps" className="mt-12 grid gap-3 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="animate-rise rounded-2xl bg-card/70 ring-1 ring-border p-4 backdrop-blur"
            style={{ animationDelay: `${120 + i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/12 text-primary"><s.icon size={18} /></span>
              <span className="text-xs font-medium text-muted-foreground">Étape {i + 1}</span>
            </div>
            <p className="mt-3 text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-muted-foreground">
        Envie de regarder d'abord ? <Link to="/markets" className="font-medium text-primary" data-tour="welcome-markets">Suis quelques actifs dans Marchés</Link>.
      </p>
      <PortfolioFormSheet open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
