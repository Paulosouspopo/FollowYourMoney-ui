export interface Kpi { label: string; value: number; signed?: boolean; colored?: boolean; hint?: string; }

/** Une seule fonction pour dériver les KPI, que ce soit d'un DashboardResponse ou d'un PortfolioValuation (ils partagent ces champs). */
export const performanceKpis = (d: { realizedGainEur: number; dividendsEur: number; totalFeesEur: number; unrealizedGainEur: number }): Kpi[] => [
  { label: 'Latent', value: d.unrealizedGainEur, signed: true, colored: true },
  { label: 'Réalisé', value: d.realizedGainEur, signed: true, colored: true },
  { label: 'Dividendes', value: d.dividendsEur },
  { label: 'Frais', value: -d.totalFeesEur, signed: true, colored: true },
];