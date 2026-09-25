import type { ReactNode } from 'react';
import { Logo } from '@/app/layout/Logo';

/** Courbe décorative (fixe, sans données) : la promesse de l'app, dessinée à l'arrivée. */
const DECOR_PATH = 'M0,190 C40,185 60,170 90,172 C130,175 150,140 190,138 C230,136 250,150 290,120 C330,90 350,105 390,80 C430,55 460,62 500,30';

/**
 * Écrans de connexion. Mobile : formulaire centré. Grand écran : panneau de
 * marque à gauche (promesse + courbe animée), formulaire à droite.
 */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-12 glow">
        <div className="flex items-center gap-2.5">
          <Logo className="h-9 w-9" />
          <span className="font-semibold tracking-tight">FollowYourMoney</span>
        </div>
        <div>
          <p className="text-5xl font-semibold tracking-[-0.035em] leading-[1.05] max-w-md">
            Tout ton patrimoine.<br /><span className="text-primary">Enfin clair.</span>
          </p>
          <p className="mt-4 max-w-sm text-muted-foreground">
            PEA, compte-titres, crypto, livrets : valorisés au cours du marché, avec ta vraie performance.
          </p>
          <svg viewBox="0 0 500 200" className="mt-12 w-full max-w-lg overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="auth-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={`${DECOR_PATH} L500,200 L0,200 Z`} fill="url(#auth-area)" className="chart-fade" />
            <path d={DECOR_PATH} fill="none" stroke="var(--primary)" strokeWidth={3} strokeLinecap="round"
              pathLength={1} className="chart-draw" />
            <circle cx={500} cy={30} r={6} fill="var(--primary)" className="chart-fade" />
          </svg>
        </div>
        <p className="text-xs text-muted-foreground">Tes données restent les tiennes : aucune connexion bancaire requise.</p>
      </aside>

      <main className="flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-rise glow lg:before:hidden">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo className="mb-5 h-12 w-12 lg:hidden" />
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
