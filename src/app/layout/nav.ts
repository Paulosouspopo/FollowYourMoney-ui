import { Bell, BookOpen, CandlestickChart, ScanSearch, Sparkles, Trash2, Coins, Landmark, LayoutDashboard, LayoutGrid, Settings, Target, Wallet } from 'lucide-react';

/** Navigation principale de la barre latérale (bureau). */
export const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/portfolios', icon: Wallet, label: 'Portefeuilles' },
  { to: '/markets', icon: CandlestickChart, label: 'Marchés' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
] as const;

/** Pages d'analyse : section « Analyse » de la barre latérale, et page « Plus » sur mobile. */
export const SECONDARY_NAV_ITEMS = [
  { to: '/analysis', icon: ScanSearch, label: 'Radiographie', description: 'Pays, secteurs, devises, risque, frais cachés, contributions' },
  { to: '/income', icon: Coins, label: 'Revenus', description: 'Dividendes et intérêts : reçus, attendus, calendrier' },
  { to: '/goals', icon: Target, label: 'Objectifs', description: 'Projection de ton patrimoine et objectifs d\'épargne' },
  { to: '/tax', icon: Landmark, label: 'Fiscalité', description: 'Cases à déclarer, plus-values, crypto, PEA' },
  { to: '/wrapped', icon: Sparkles, label: "Bilan de l'année", description: "Ton année d'investisseur en quelques écrans" },
] as const;

/** Guide d'utilisation : page « Plus », barre latérale et Réglages. */
export const GUIDE_NAV_ITEM = {
  to: '/guide', icon: BookOpen, label: "Guide d'utilisation", description: 'Visites guidées, lexique, quiz, questions fréquentes',
} as const;

/**
 * Page « Plus » (mobile) : tout ce qui ne tient pas dans la barre du bas.
 * Ajouter une page ici suffit pour qu'elle soit accessible sur téléphone.
 */
export const MORE_SECTIONS = [
  { title: 'Analyse', items: SECONDARY_NAV_ITEMS },
  { title: 'Aide', items: [GUIDE_NAV_ITEM] },
  { title: 'Compte', items: [
    { to: '/settings', icon: Settings, label: 'Réglages', description: 'Apparence, devise, notifications, sécurité' },
    { to: '/trash', icon: Trash2, label: 'Corbeille', description: 'Opérations et portefeuilles supprimés (30 jours)' },
  ] },
] as const;

const MORE_PATHS: string[] = ['/more', ...MORE_SECTIONS.flatMap(s => s.items.map(i => i.to))];

/**
 * Barre du bas (mobile) : 4 onglets + « Plus ». `matches` : chemins pour
 * lesquels l'onglet est actif (« Plus » reste allumé sur ses pages).
 */
export const MOBILE_NAV_ITEMS = [
  ...NAV_ITEMS.filter(i => i.to !== '/settings').map(i => ({ ...i, matches: [i.to as string] })),
  { to: '/more', icon: LayoutGrid, label: 'Plus', matches: MORE_PATHS },
];

/** Onglet actif : correspondance exacte pour l'accueil, par préfixe sinon. */
export const isNavActive = (pathname: string, matches: readonly string[]) =>
  matches.some(m => (m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(`${m}/`)));

export const unreadLabel = (n: number) => `${n} notification${n > 1 ? 's' : ''} non lue${n > 1 ? 's' : ''}`;
