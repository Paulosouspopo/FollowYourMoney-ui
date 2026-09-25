/**
 * Imports des pages de l'app : partagés entre le chargement différé (router)
 * et le préchargement pendant l'inactivité du navigateur (AppShell).
 */
export const appPages = {
  dashboard: () => import('@/features/dashboard/pages/DashboardPage'),
  portfolios: () => import('@/features/portfolios/pages/PortfoliosPage'),
  portfolioDetail: () => import('@/features/portfolios/pages/PortfolioDetailPage'),
  positionDetail: () => import('@/features/positions/pages/PositionDetailPage'),
  settings: () => import('@/features/settings/pages/SettingsPage'),
  import: () => import('@/features/imports/pages/ImportPage'),
  markets: () => import('@/features/markets/pages/MarketsPage'),
  marketDetail: () => import('@/features/markets/pages/MarketDetailPage'),
  alerts: () => import('@/features/notifications/pages/AlertsPage'),
  income: () => import('@/features/income/pages/IncomePage'),
  goals: () => import('@/features/goals/pages/GoalsPage'),
  tax: () => import('@/features/tax/pages/TaxPage'),
};

/** Pages atteignables en un geste depuis l'accueil : préchargées quand le navigateur est inactif. */
const PRELOADED = ['portfolios', 'portfolioDetail', 'markets', 'marketDetail', 'alerts', 'settings'] as const;

export function preloadAppPages() {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 4000 }) : setTimeout(cb, 1500);
  PRELOADED.forEach((name, i) => idle(() => setTimeout(() => void appPages[name]().catch(() => {}), i * 150)));
}
