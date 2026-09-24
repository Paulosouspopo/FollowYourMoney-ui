export interface Kpi { label: string; value: number; signed?: boolean; colored?: boolean; hint?: string; }

interface PerformanceFields {
  realizedGainEur: number; dividendsEur: number; totalFeesEur: number; unrealizedGainEur: number; interestEur?: number;
}

/** Une seule fonction pour dériver les KPI, que ce soit d'un DashboardResponse ou d'un PortfolioValuation (ils partagent ces champs). */
export const performanceKpis = (d: PerformanceFields): Kpi[] => [
  { label: 'Latent', value: d.unrealizedGainEur, signed: true, colored: true },
  { label: 'Réalisé', value: d.realizedGainEur, signed: true, colored: true },
  { label: 'Dividendes', value: d.dividendsEur },
  // Intérêts : seulement quand il y en a (rémunération des espèces d'un compte suivi)
  ...(d.interestEur ? [{ label: 'Intérêts', value: d.interestEur }] : []),
  { label: 'Frais', value: -d.totalFeesEur, signed: true, colored: true },
];

/** Livret : ni plus-value ni dividende, seulement des versements et des intérêts. */
export const livretKpis = (p: { netDepositsEur: number; interestEur: number; totalFeesEur: number }): Kpi[] => [
  { label: 'Versements nets', value: p.netDepositsEur, hint: 'Versements − retraits' },
  { label: 'Intérêts perçus', value: p.interestEur, signed: true, colored: true },
  ...(p.totalFeesEur ? [{ label: 'Frais', value: -p.totalFeesEur, signed: true, colored: true }] : []),
];
