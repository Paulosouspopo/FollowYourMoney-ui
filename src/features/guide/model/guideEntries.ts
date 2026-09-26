import type { PortfolioValuation } from '@/features/dashboard/model/dashboard.types';
import type { Tour } from '@/shared/tour/tour.types';
import { TOURS } from '../tours';

export interface GuideEntry {
  tour: Tour;
  /** Page où se lance la visite (null : pas encore disponible). */
  path: string | null;
  /** Pourquoi elle n'est pas disponible. */
  needs?: string;
}

/** Visites proposées, et la page où chacune se lance selon les données du compte. */
export function guideEntries(portfolios: PortfolioValuation[]): GuideEntry[] {
  const first = portfolios[0];
  const withPosition = portfolios.find(p => p.positions.length > 0);
  const tradable = portfolios.find(p => p.type !== 'LIVRET');
  const noPortfolio = "Crée d'abord un portefeuille";
  return [
    portfolios.length === 0
      ? { tour: TOURS.start, path: '/' }
      : { tour: TOURS.welcome, path: '/' },
    { tour: TOURS.portfolio, path: first ? `/portfolios/${first.portfolioId}` : null, needs: noPortfolio },
    { tour: TOURS.import, path: tradable ? `/portfolios/${tradable.portfolioId}/import` : null, needs: 'Crée d\'abord un compte-titres, PEA ou crypto' },
    { tour: TOURS.position,
      path: withPosition ? `/portfolios/${withPosition.portfolioId}/positions/${encodeURIComponent(withPosition.positions[0].symbol)}` : null,
      needs: "Ajoute d'abord une opération" },
    { tour: TOURS.markets, path: '/markets' },
    { tour: TOURS.alerts, path: '/alerts' },
    { tour: TOURS.analysis, path: portfolios.length ? '/analysis' : null, needs: noPortfolio },
    { tour: TOURS.income, path: '/income' },
    { tour: TOURS.goals, path: '/goals' },
    { tour: TOURS.tax, path: '/tax' },
  ];
}
