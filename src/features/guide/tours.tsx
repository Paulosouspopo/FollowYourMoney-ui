import {
  ArrowLeftRight, BellRing, CalendarClock, ChartNoAxesCombined, CircleHelp, Coins, Download, Eye, FileSearch,
  FileUp, Globe, Hand, Landmark, LayoutDashboard, LayoutGrid, ListChecks, Percent, PiggyBank, Plus, Receipt,
  Rocket, ScanSearch, ScrollText, ShieldCheck, SlidersHorizontal, Sparkles, Target, Timer, TrendingUp, TriangleAlert, Wallet,
} from 'lucide-react';
import type { Tour } from '@/shared/tour/tour.types';
import { Def, Example } from './components/TourText';

const helpStep = {
  target: 'help', icon: CircleHelp, title: 'Besoin de revoir ça ?',
  body: <p>Ce bouton relance la visite de la page quand tu veux. Toutes les visites, un lexique et un petit quiz t'attendent dans le <span className="font-medium text-foreground">Guide d'utilisation</span>.</p>,
} as const;

export const TOURS = {
  start: {
    key: 'start', title: 'Premiers pas', icon: Rocket,
    summary: 'Les trois étapes pour démarrer : portefeuille, opérations, et c\'est parti.',
    steps: [
      { icon: Sparkles, title: 'Bienvenue !',
        body: <>
          <p>FollowYourMoney réunit tous tes placements au même endroit : leur valeur au cours du marché, ta vraie performance, tes revenus et tes impôts.</p>
          <p>30 secondes de visite. Utilise les boutons ou les flèches du clavier, et quitte quand tu veux.</p>
        </> },
      { target: 'welcome-create', icon: Wallet, title: 'Un portefeuille = un compte',
        body: <>
          <p>Crée un portefeuille pour chaque compte que tu as chez ta banque ou ton courtier :</p>
          <Def term="PEA">actions européennes, gains exonérés d'impôt après 5 ans.</Def>
          <Def term="Compte-titres">tout le reste : actions US, ETF, obligations…</Def>
          <Def term="Assurance-vie, PER">fonds euros + unités de compte ; fiscalité propre.</Def>
          <Def term="Épargne salariale">PEE, PERCO : versements et abondement de l'employeur.</Def>
          <Def term="Crypto">Binance, Coinbase, ton wallet…</Def>
          <Def term="Livret">Livret A, LDDS… un taux, pas de cours.</Def>
        </> },
      { target: 'welcome-steps', icon: FileUp, title: 'Puis ajoute tes opérations',
        body: <>
          <p>Achats, ventes, dividendes : à la main, ou d'un coup en important le relevé CSV de ton courtier.</p>
          <p>L'app va chercher les cours toute seule et reconstruit ton historique jour après jour, même pour une opération d'il y a 5 ans.</p>
        </> },
      { target: 'welcome-markets', icon: Globe, title: 'Pas encore prêt ?',
        body: <p>Tu peux suivre des actions, ETF ou cryptos sans les posséder dans l'onglet Marchés, avec des alertes de cours.</p> },
      { icon: Hand, title: 'À toi de jouer !',
        body: <p>Touche <span className="font-medium text-foreground">« Créer mon premier portefeuille »</span>. Ensuite, chaque page te présentera ses fonctions la première fois que tu l'ouvres.</p> },
    ],
  },

  welcome: {
    key: 'welcome', title: 'Ton tableau de bord', icon: LayoutDashboard,
    summary: 'Patrimoine, courbe, chiffres clés, performance : lire l\'accueil en un coup d\'œil.',
    steps: [
      { icon: Sparkles, title: 'Bienvenue sur ton tableau de bord',
        body: <>
          <p>En une minute, tu vas savoir lire tout ce qui s'affiche ici.</p>
          <p>Boutons ou flèches du clavier pour avancer, croix pour quitter.</p>
        </> },
      { target: 'quality-banner', icon: TriangleAlert, title: 'Une saisie à vérifier',
        body: <p>L'app compare tes opérations aux cours du marché. Un prix très éloigné (faute de frappe, mauvais actif, division d'actions) est signalé ici : corrige-le en un geste ou indique que c'est normal.</p> },
      { target: 'hero-value', icon: Wallet, title: 'Ton patrimoine, en un chiffre',
        body: <>
          <p>La valeur de tous tes comptes au dernier cours (mis à jour chaque heure), en euros. Dessous : ton gain sur la période choisie.</p>
          <Example>Un versement n'est pas un gain : si tu ajoutes 1 000 € sur un compte, ton patrimoine monte mais ta variation, elle, ne bouge pas.</Example>
        </> },
      { target: 'hero-chart', icon: ChartNoAxesCombined, title: 'Remonte le temps', interactive: true,
        body: <>
          <p>Glisse le doigt (ou la souris) sur la courbe : le chiffre du haut affiche ta valeur ce jour-là.</p>
          <p><span className="font-medium text-foreground">Trait plein</span> : ce que vaut ton patrimoine. <span className="font-medium text-foreground">Pointillés</span> : l'argent que tu y as mis. L'écart entre les deux, c'est ton gain.</p>
        </> },
      { target: 'hero-periods', icon: Timer, title: 'Zoome sur une période', interactive: true,
        body: <p>Une semaine, un mois, un an… ou « Max », depuis ta toute première opération. La variation s'adapte à la période choisie.</p> },
      { target: 'stats', icon: Coins, title: 'Les chiffres clés',
        body: <>
          <Def term="Plus-value latente">le gain sur ce que tu détiens encore. Il bouge avec les cours tant que tu ne vends pas.</Def>
          <Def term="Plus-value réalisée">le gain empoché lors de tes ventes.</Def>
          <Def term="Dividendes, intérêts">ce que tes placements t'ont versé.</Def>
          <Example>10 actions achetées 50 € valent 60 € : +100 € latents. Tu en vends 4 : +40 € réalisés, +60 € restent latents.</Example>
        </> },
      { target: 'performance', icon: TrendingUp, title: 'Ta vraie performance',
        body: <>
          <Def term="Performance (TWR)">la qualité de tes choix, sans l'effet du moment où tu as versé ton argent. C'est elle qu'on compare à un indice ou à un fonds.</Def>
          <Def term="Rendement de ton argent">ce que tes euros ont réellement rapporté par an, en tenant compte des dates de tes versements.</Def>
          <p>Compare-toi au CAC 40 ou au MSCI World juste en dessous.</p>
        </> },
      { target: 'portfolios', icon: Wallet, title: 'Tes portefeuilles',
        body: <p>Un par compte réel, avec sa tendance sur 30 jours. Touches-en un pour voir ses lignes, ajouter une opération ou importer un relevé.</p> },
      { target: 'privacy', icon: Eye, title: 'Mode discret', interactive: true,
        body: <p>L'œil masque tous les montants (les pourcentages restent visibles) : pratique dans le métro ou avant une capture d'écran.</p> },
      { target: ['nav-more', 'nav-analysis'], icon: LayoutGrid, title: 'Encore plus d\'analyses',
        body: <>
          <Def term="Revenus">dividendes et intérêts reçus et à venir.</Def>
          <Def term="Objectifs">projection de ton patrimoine et cibles d'épargne.</Def>
          <Def term="Fiscalité">les cases à remplir sur ta déclaration.</Def>
        </> },
      helpStep,
    ],
  },

  portfolio: {
    key: 'portfolio', title: 'Un portefeuille', icon: Wallet,
    summary: 'Ajouter une opération, importer un relevé, lire ses lignes et son PRU.',
    steps: [
      { target: 'hero-value', icon: Wallet, title: 'La valeur de ce compte',
        body: <p>Même principe que l'accueil, pour ce compte seul : sa valeur, son gain sur la période et sa courbe (glisse dessus).</p> },
      { target: 'kpis', icon: Coins, title: 'Son bilan',
        body: <p>Plus-values, dividendes, frais : tout ce que ce compte t'a rapporté ou coûté depuis le début.</p> },
      { target: 'add', icon: Plus, title: 'Ajoute une opération',
        body: <>
          <p>Le bouton + ajoute un achat, une vente ou un dividende. Cherche l'actif par son nom, puis indique date, quantité, prix et frais. Un fonds introuvable (assurance-vie, FCPE) ? Saisis sa valeur toi-même.</p>
          <Example>Achat de 3 Air Liquide à 170 € le 12 mars, 2 € de frais.</Example>
          <p>Une opération ancienne ? Les cours de l'époque sont récupérés et la courbe se recalcule en quelques secondes.</p>
        </> },
      { target: 'import', icon: FileUp, title: 'Ou importe tout d\'un coup',
        body: <p>Cette icône importe le relevé CSV de ton courtier (Fortuneo, Trade Republic, Binance ou autre) : des années d'historique en une minute, sans doublon.</p> },
      { target: 'positions', icon: ListChecks, title: 'Tes lignes',
        body: <>
          <p>Chaque actif détenu, sa valeur et son gain. Touche une ligne pour son détail et son historique.</p>
          <Def term="PRU">ton prix de revient unitaire : la moyenne de tes achats, frais compris.</Def>
          <Example>10 actions à 50 € puis 10 à 70 € : PRU = 60 €. Une vente ne change pas le PRU des actions restantes.</Example>
        </> },
      { target: 'cash', icon: PiggyBank, title: 'Les liquidités',
        body: <>
          <p>L'argent qui attend sur le compte : versements − achats + ventes + dividendes. Il compte dans la valeur du portefeuille.</p>
          <p>Sur une assurance-vie ou un PER, c'est ton <span className="font-medium text-foreground">fonds euros</span> : l'app estime ses intérêts de l'année et te propose de les créditer.</p>
        </> },
      { target: 'plans', icon: CalendarClock, title: 'Investissements programmés',
        body: <p>Tu investis tous les mois ? Programme l'achat ou le versement une fois : il s'ajoute tout seul à chaque échéance.</p> },
      { target: 'recent', icon: Receipt, title: 'Tes dernières opérations',
        body: <p>Touche une opération pour la modifier ou la supprimer : la valeur et la courbe se mettent à jour.</p> },
      helpStep,
    ],
  },

  import: {
    key: 'import', title: 'Importer un relevé', icon: FileUp,
    summary: 'Récupérer tout l\'historique de ton courtier depuis un fichier CSV.',
    steps: [
      { target: 'import-drop', icon: FileUp, title: 'Dépose ton fichier',
        body: <p>Glisse ici le fichier exporté depuis ton courtier, ou touche la zone pour le choisir. Rien n'est enregistré avant ta validation finale.</p> },
      { target: 'import-where', icon: FileSearch, title: 'Où trouver l\'export ?',
        body: <p>Le chemin pour les courtiers les plus courants. Un autre courtier ? Tout fichier CSV fonctionne : tu indiqueras quelle colonne contient quoi.</p> },
      { icon: ListChecks, title: 'Ensuite, en 3 temps',
        body: <>
          <Def term="1. Lecture">le format est reconnu tout seul (sinon, tu associes les colonnes : date, montant…).</Def>
          <Def term="2. Aperçu">chaque ligne est classée : à importer, déjà présente, ignorée ou en erreur. Tu confirmes les actifs reconnus.</Def>
          <Def term="3. Import">un clic, et l'historique complet se recalcule.</Def>
          <Example>Tu peux réimporter le même relevé le mois prochain : les opérations déjà présentes sont ignorées.</Example>
        </> },
      { icon: ShieldCheck, title: 'Ton fichier reste chez toi',
        body: <p>Il est lu pour l'aperçu puis oublié : seul le résultat (tes opérations) est enregistré.</p> },
    ],
  },

  position: {
    key: 'position', title: 'Une ligne', icon: TrendingUp,
    summary: 'Le détail d\'un actif : PRU, historique, corriger un actif mal choisi.',
    steps: [
      { target: 'position-summary', icon: TrendingUp, title: 'L\'essentiel',
        body: <>
          <p>Valeur, gain latent, quantité, PRU et dernier cours connu.</p>
          <p>« Estimé » : aucun cours de marché n'est disponible, l'app utilise ton dernier prix d'achat ou de vente (jamais 0).</p>
        </> },
      { target: 'position-history', icon: Receipt, title: 'Toutes tes opérations',
        body: <p>L'historique de cet actif dans ce portefeuille. Touche une opération pour la modifier.</p> },
      { target: 'add', icon: Plus, title: 'Achète ou vends',
        body: <p>Le + ouvre le formulaire avec cet actif déjà choisi. Une vente plus grande que ta quantité est refusée.</p> },
      { target: 'replace-asset', icon: ArrowLeftRight, title: 'Mauvais actif ?',
        body: <>
          <p>Même action, autre place de cotation ?</p>
          <Example>Ferrari choisie à New York (RACE) au lieu de Milan (RACE.MI) dans un PEA.</Example>
          <p>« Changer d'actif » déplace toutes les opérations vers le bon titre, sans rien ressaisir.</p>
        </> },
      helpStep,
    ],
  },

  markets: {
    key: 'markets', title: 'Marchés', icon: Globe,
    summary: 'Suivre des actions, ETF, cryptos et indices, que tu les possèdes ou non.',
    steps: [
      { target: 'markets-follow', icon: Plus, title: 'Suis ce que tu veux',
        body: <p>Une action, un ETF, une crypto ou un indice, détenu ou non. Tape simplement son nom : Apple, Bitcoin, MSCI World…</p> },
      { target: 'markets-list', icon: ChartNoAxesCombined, title: 'Ta liste de suivi',
        body: <p>Chaque actif et sa tendance sur 30 jours. Sa fiche montre le graphique jusqu'à 5 ans, sa position entre ses plus bas et plus hauts sur un an, et des alertes en un geste.</p> },
      { target: 'markets-suggestions', icon: Sparkles, title: 'En panne d\'idées ?',
        body: <p>Les grands indices et cryptos en un clic, pour suivre la tendance du marché.</p> },
      helpStep,
    ],
  },

  alerts: {
    key: 'alerts', title: 'Alertes', icon: BellRing,
    summary: 'Être prévenu d\'une hausse, d\'une baisse ou d\'un record, et recevoir un bilan.',
    steps: [
      { target: 'alerts-tabs', icon: BellRing, title: 'Trois onglets', interactive: true,
        body: <>
          <Def term="Reçues">tes notifications.</Def>
          <Def term="Mes alertes">tes règles, à créer et à mettre en pause.</Def>
          <Def term="Rapport">un bilan régulier de ton patrimoine par email.</Def>
        </> },
      { icon: SlidersHorizontal, title: 'Des alertes sur mesure',
        body: <>
          <p>Tu complètes une phrase :</p>
          <Example>
            « Quand Bitcoin baisse de 5 % en 24 h »<br />
            « Quand mon patrimoine dépasse 50 000 € »<br />
            « Quand Air Liquide atteint un plus haut sur 1 an »
          </Example>
          <p>Notification sur ton téléphone ou email. Les heures calmes se règlent dans Réglages.</p>
        </> },
      helpStep,
    ],
  },

  income: {
    key: 'income', title: 'Revenus passifs', icon: Coins,
    summary: 'Dividendes et intérêts : reçus, attendus, et leur rendement.',
    steps: [
      { target: 'income-hero', icon: Coins, title: 'Ce que tes placements te versent',
        body: <>
          <p>Une estimation par mois, d'après les dividendes des 12 derniers mois et le taux de tes livrets.</p>
          <Def term="Rendement sur prix de revient">tes revenus annuels divisés par ce que tu as payé.</Def>
          <Example>Payé 1 000 €, 40 € de dividendes par an : 4 %.</Example>
        </> },
      { target: 'income-chart', icon: ChartNoAxesCombined, title: 'Mois par mois', interactive: true,
        body: <p>Touche une barre pour voir le détail du mois : dividendes et intérêts.</p> },
      { target: 'income-lines', icon: ListChecks, title: 'Qui te verse quoi',
        body: <p>Le détail par ligne. Un ETF « capitalisant » réinvestit ses dividendes : il ne verse rien, c'est normal.</p> },
      { target: 'income-upcoming', icon: CalendarClock, title: 'Les prochains versements',
        body: <p>Un calendrier estimé à partir des dates des versements passés.</p> },
      helpStep,
    ],
  },

  goals: {
    key: 'goals', title: 'Projection et objectifs', icon: Target,
    summary: 'Voir où tu en seras dans 10 ou 20 ans, et fixer des objectifs.',
    steps: [
      { target: 'goals-hero', icon: TrendingUp, title: 'Ton patrimoine demain',
        body: <p>Trois scénarios : prudent, médian, dynamique. Personne ne connaît l'avenir : c'est une fourchette, pas une promesse.</p> },
      { target: 'goals-sliders', icon: SlidersHorizontal, title: 'Joue avec les curseurs', interactive: true,
        body: <>
          <p>Durée, versement mensuel, rendement : regarde l'effet des intérêts composés (tes gains produisent eux-mêmes des gains).</p>
          <Example>200 € par mois à 5 % pendant 20 ans ≈ 81 000 €, dont 48 000 € versés.</Example>
        </> },
      { target: 'goals-list', icon: Target, title: 'Tes objectifs',
        body: <p>Fixe une cible (« 100 000 € en 2035 ») : l'app te dit si tu es dans les temps et combien verser par mois pour l'atteindre.</p> },
      helpStep,
    ],
  },

  analysis: {
    key: 'analysis', title: 'Radiographie', icon: ScanSearch,
    summary: 'Où est vraiment ton argent, ce qui a fait ta performance, ton risque et tes frais cachés.',
    steps: [
      { target: 'analysis-headline', icon: ScanSearch, title: 'Ton patrimoine aux rayons X',
        body: <p>Un ETF « Monde » acheté en euros, c'est en réalité surtout des entreprises américaines. L'app regarde à l'intérieur de tes fonds pour te dire où va vraiment ton argent.</p> },
      { target: 'analysis-breakdown', icon: Globe, title: 'Pays, secteurs, devises', interactive: true,
        body: <>
          <p>Passe d'un onglet à l'autre. Les pays des ETF sont estimés d'après leur indice ; les secteurs viennent de Yahoo.</p>
          <Example>Un ETF S&P 500 en euros : 100 % États-Unis, exposé au dollar même s'il cote en euros.</Example>
        </> },
      { target: 'analysis-concentration', icon: TriangleAlert, title: 'Trop d\'œufs dans le même panier ?',
        body: <p>Ta plus grosse ligne et les entreprises auxquelles tu es le plus exposé, fonds compris. Une même action peut se cacher dans plusieurs de tes ETF.</p> },
      { target: 'analysis-period', icon: Timer, title: 'Choisis la période', interactive: true,
        body: <p>La carte des positions, les contributions et le risque suivent cette période.</p> },
      { target: 'analysis-map', icon: LayoutGrid, title: 'La carte des positions',
        body: <p>Chaque tuile est une ligne : plus elle est grande, plus elle pèse ; vert, elle a monté, rouge, elle a baissé. Touche-la pour l'ouvrir.</p> },
      { target: 'analysis-contributions', icon: TrendingUp, title: 'Qui a fait ta performance',
        body: <p>Ce que chaque ligne t'a rapporté ou coûté sur la période, dividendes compris. Souvent, deux ou trois lignes font presque tout.</p> },
      { target: 'analysis-risk', icon: ChartNoAxesCombined, title: 'Ton risque, en clair',
        body: <>
          <Def term="Volatilité">l'amplitude des variations sur un an : 15 % environ pour les actions mondiales.</Def>
          <Def term="Pire baisse">la plus forte chute d'un sommet à un creux. Demande-toi si tu la supporterais deux fois plus fort.</Def>
        </> },
      { target: 'analysis-fees', icon: Receipt, title: 'Les frais cachés',
        body: <>
          <p>Les frais courants des fonds sont prélevés chaque jour, sans ligne sur ton relevé.</p>
          <Example>0,5 % de frais sur 20 000 € pendant 20 ans ≈ 5 000 € de patrimoine en moins.</Example>
          <p>Yahoo ne les connaît pas toujours : renseigne-les avec le crayon (ils sont dans le DIC du fonds).</p>
        </> },
      { target: 'analysis-calendar', icon: CalendarClock, title: 'Le calendrier des performances',
        body: <p>Chaque mois en couleur : repère d'un coup d'œil tes bons et mauvais mois, et ta performance année par année.</p> },
      helpStep,
    ],
  },

  tax: {
    key: 'tax', title: 'Fiscalité', icon: Landmark,
    summary: 'Les cases à remplir sur ta déclaration, calculées depuis tes opérations.',
    steps: [
      { target: 'tax-year', icon: CalendarClock, title: 'Choisis l\'année',
        body: <p>Les revenus d'une année se déclarent au printemps suivant : en mai 2027, tu déclares 2026.</p> },
      { target: 'tax-bracket', icon: SlidersHorizontal, title: 'Ta tranche d\'imposition',
        body: <p>Indique ton taux marginal (sur ton avis d'impôt) : l'app calcule l'impôt économisé grâce à tes versements sur un PER.</p> },
      { target: 'tax-hero', icon: Percent, title: 'L\'impôt estimé',
        body: <>
          <p>La flat tax de 30 % : 12,8 % d'impôt + 17,2 % de prélèvements sociaux, sur tes plus-values et dividendes.</p>
          <p>PEA, livrets, assurance-vie, PER et épargne salariale à part : ils ont leur propre fiscalité, détaillée plus bas.</p>
        </> },
      { target: 'tax-boxes', icon: ScrollText, title: 'Les cases à reporter',
        body: <p>Le code de chaque case et son montant, à copier d'un geste sur impots.gouv.fr. C'est une estimation : vérifie toujours avant de signer.</p> },
      { target: 'tax-export', icon: Download, title: 'Le détail pour tes archives',
        body: <p>Exporte toutes tes cessions en CSV, pour ton comptable ou en cas de question de l'administration.</p> },
      { target: 'tax-pea', icon: ShieldCheck, title: 'Ton PEA',
        body: <p>Après 5 ans, tes gains n'ont plus d'impôt sur le revenu (seulement 17,2 % de prélèvements sociaux). Plafond de versements : 150 000 €.</p> },
      helpStep,
    ],
  },
} satisfies Record<string, Tour>;

export type TourKey = keyof typeof TOURS;
