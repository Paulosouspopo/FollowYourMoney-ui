/** Contenu du Guide d'utilisation : lexique, quiz et questions fréquentes. */

export interface GlossaryEntry { term: string; definition: string; example?: string; }

export const GLOSSARY: { title: string; entries: GlossaryEntry[] }[] = [
  {
    title: 'Valeur et gains',
    entries: [
      { term: 'Patrimoine', definition: 'La valeur de tous tes comptes au dernier cours connu, convertie en euros.' },
      { term: 'Investi', definition: "L'argent que tu as mis dans tes lignes actuelles, frais compris. La ligne en pointillés sur les courbes." },
      { term: 'PRU (prix de revient unitaire)', definition: 'Le prix moyen payé pour une action, frais compris, pondéré par les quantités. Une vente ne le change pas.',
        example: '10 actions à 50 € puis 10 à 70 € → PRU = 60 €.' },
      { term: 'Plus-value latente', definition: 'Le gain (ou la perte) sur ce que tu détiens encore : valeur actuelle − prix de revient. Il bouge avec les cours.',
        example: '10 actions de PRU 50 € qui valent 60 € → +100 € latents.' },
      { term: 'Plus-value réalisée', definition: 'Le gain empoché lors d\'une vente : prix de vente net de frais − PRU × quantité vendue.',
        example: 'Tu vends 4 actions de PRU 50 € à 60 € → +40 € réalisés.' },
      { term: 'Dividende', definition: 'La part des bénéfices qu\'une entreprise verse à ses actionnaires, en général une à quatre fois par an.' },
      { term: 'ETF capitalisant', definition: 'Un fonds qui réinvestit lui-même ses dividendes : il ne te verse rien, mais sa valeur en profite.' },
      { term: 'Liquidités', definition: "L'argent non investi qui attend sur un compte. Suivies si tu actives le suivi des liquidités du portefeuille." },
      { term: 'Fonds euros', definition: "La partie garantie d'une assurance-vie ou d'un PER : le capital ne baisse pas, les intérêts sont versés une fois par an (taux connu en janvier)." },
      { term: 'Unités de compte (UC)', definition: 'Les fonds (actions, ETF, immobilier…) d\'une assurance-vie ou d\'un PER : plus de potentiel, mais pas de garantie.' },
      { term: 'Actif non coté', definition: "Un fonds absent de Yahoo (FCPE d'entreprise, UC maison) : tu reportes sa valeur liquidative depuis tes relevés, l'app fait le reste." },
      { term: 'Compte multidevise', definition: 'Un compte où tes dollars restent des dollars : le solde USD est valorisé chaque jour au taux de change du jour.' },
      { term: 'Prix estimé', definition: "Aucun cours de marché n'est disponible : la ligne est valorisée au prix de ta dernière opération, jamais à 0." },
    ],
  },
  {
    title: 'Performance',
    entries: [
      { term: 'Performance (TWR)', definition: "La performance de tes choix, indépendamment du moment et du montant de tes versements. C'est celle des fonds : elle se compare à un indice.",
        example: 'Tu verses beaucoup juste avant une baisse : ton TWR ne te pénalise pas pour ce timing.' },
      { term: 'Rendement de ton argent (XIRR)', definition: 'Le taux annuel réellement obtenu sur tes euros, en tenant compte des dates et montants de chaque versement. Affiché au-delà d\'un an.' },
      { term: 'Volatilité', definition: "L'amplitude des variations d'un placement, sur un an. Plus elle est forte, plus le chemin est chahuté (actions mondiales ≈ 15 %, crypto > 50 %)." },
      { term: 'Pire baisse (drawdown)', definition: "La plus forte chute d'un plus haut à un plus bas. En 2008 comme en 2020, les actions mondiales ont perdu plus de 30 % avant de remonter." },
      { term: 'Ratio de Sharpe', definition: "Le rendement obtenu au-delà d'un placement sans risque, divisé par la volatilité : le rendement par unité de risque. Au-dessus de 1, c'est très bon." },
      { term: 'Frais courants (TER)', definition: 'Les frais annuels d\'un fonds ou d\'un ETF, prélevés chaque jour dans sa valeur. Un ETF monde coûte 0,1 à 0,4 % par an, un fonds actif souvent plus de 1,5 %.' },
      { term: 'Indice de référence', definition: 'Un panier d\'actions qui représente un marché (CAC 40, MSCI World, S&P 500). Le battre sur la durée est difficile !' },
      { term: 'Intérêts composés', definition: 'Tes gains produisent eux-mêmes des gains : l\'effet boule de neige, d\'autant plus fort que la durée est longue.',
        example: '200 € par mois à 5 % pendant 20 ans ≈ 81 000 €, dont 48 000 € versés.' },
      { term: 'Investissement programmé (DCA)', definition: 'Investir le même montant à intervalle régulier, quel que soit le cours : on lisse son prix d\'achat.' },
    ],
  },
  {
    title: 'Comptes et fiscalité',
    entries: [
      { term: 'PEA', definition: "Plan d'épargne en actions : actions européennes. Après 5 ans, les gains ne supportent plus que les prélèvements sociaux (18,6 % depuis 2026). Versements plafonnés à 150 000 €." },
      { term: 'Compte-titres (CTO)', definition: 'Le compte sans limite : actions du monde entier, ETF, obligations. Gains et dividendes soumis à la flat tax.' },
      { term: 'Assurance-vie', definition: "Enveloppe souple : fonds euros + unités de compte. Après 8 ans, 4 600 € de gains retirés par an (9 200 € pour un couple) sont exonérés d'impôt." },
      { term: 'PER', definition: "Plan d'épargne retraite : tes versements se déduisent de ton revenu imposable (économie = versement × ta tranche), l'argent est bloqué jusqu'à la retraite (sauf achat de la résidence principale)." },
      { term: 'Épargne salariale et abondement', definition: "PEE, PERCO : ton employeur complète tes versements (l'abondement). Les gains sont exonérés d'impôt, seuls les prélèvements sociaux s'appliquent au déblocage." },
      { term: 'Tranche marginale (TMI)', definition: "Le taux d'imposition de ton dernier euro gagné : 0, 11, 30, 41 ou 45 %. Il figure sur ton avis d'impôt." },
      { term: 'Flat tax (PFU)', definition: '31,4 % sur les plus-values et dividendes depuis 2026 : 12,8 % d\'impôt + 18,6 % de prélèvements sociaux (30 % avant 2026, et toujours 30 % en assurance-vie).' },
      { term: 'Moins-value reportable', definition: 'Une perte sur un compte-titres vient réduire tes plus-values de la même année, puis des 10 années suivantes.' },
      { term: 'Crypto : franchise de 305 €', definition: "Si le total de tes ventes de crypto contre des euros ne dépasse pas 305 € dans l'année, rien n'est imposable. Échanger une crypto contre une autre n'est pas imposable." },
      { term: 'Symbole', definition: 'Le code d\'un actif sur une place de cotation (AI.PA = Air Liquide à Paris). Une même entreprise peut en avoir plusieurs, un par place.' },
    ],
  },
];

export interface QuizQuestion { question: string; options: string[]; answer: number; explanation: string; }

export const QUIZ: QuizQuestion[] = [
  {
    question: 'Tu achètes 10 actions à 50 €, puis 10 à 70 € (sans frais). Quel est ton PRU ?',
    options: ['50 €', '60 €', '70 €'], answer: 1,
    explanation: 'Le PRU est la moyenne pondérée : (10 × 50 + 10 × 70) / 20 = 60 €.',
  },
  {
    question: 'Tu verses 1 000 € : ton patrimoine passe de 5 000 € à 6 000 €. Combien as-tu gagné ?',
    options: ['1 000 €', '0 €', '20 %'], answer: 1,
    explanation: "Un versement n'est pas un gain : c'est ton propre argent. L'app ne le compte jamais dans ta variation.",
  },
  {
    question: 'Tu vends 4 de tes 10 actions (PRU 50 €) à 60 € pièce. Quelle plus-value réalisée ?',
    options: ['40 €', '100 €', '240 €'], answer: 0,
    explanation: '4 × (60 − 50) = 40 €. Les 6 actions restantes gardent leur PRU de 50 €.',
  },
  {
    question: 'Pour savoir si tu fais mieux qu\'un ETF MSCI World, quel chiffre regarder ?',
    options: ['La plus-value latente', 'La performance (TWR)', 'Le patrimoine'], answer: 1,
    explanation: 'Le TWR neutralise l\'effet de tes versements : c\'est la seule mesure comparable à celle d\'un fonds ou d\'un indice.',
  },
  {
    question: 'Au bout de combien de temps les gains d\'un PEA échappent-ils à l\'impôt sur le revenu ?',
    options: ['2 ans', '5 ans', '8 ans'], answer: 1,
    explanation: 'Après 5 ans, seuls les prélèvements sociaux (18,6 % depuis 2026) restent dus sur les gains.',
  },
];

export interface FaqEntry { question: string; answer: string; link?: { to: string; label: string }; }

export const FAQ: FaqEntry[] = [
  { question: 'Comment créer un portefeuille ?', answer: 'Onglet Portefeuilles, bouton « Nouveau ». Choisis le type de compte (PEA, compte-titres, crypto, livret) et, si tu le souhaites, active le suivi des liquidités.',
    link: { to: '/portfolios', label: 'Mes portefeuilles' } },
  { question: 'Comment ajouter un achat, une vente ou un dividende ?', answer: 'Ouvre le portefeuille et touche le bouton + en bas à droite. Cherche l\'actif par son nom : il n\'y a jamais de code à taper.' },
  { question: 'Comment importer le relevé de mon courtier ?', answer: 'Dans un portefeuille, touche l\'icône d\'import en haut à droite et dépose le fichier CSV exporté depuis ton courtier. Les doublons sont ignorés.' },
  { question: "J'ai choisi le mauvais actif, que faire ?", answer: "Ouvre la ligne concernée et touche « Changer d'actif » : toutes ses opérations passent sur le bon titre." },
  { question: 'Pourquoi ma courbe met-elle quelques secondes à se mettre à jour ?', answer: "Après une opération ancienne, l'app télécharge les cours de l'époque puis recalcule chaque jour de ton historique." },
  { question: 'Comment suivre une action sans la posséder ?', answer: 'Onglet Marchés, bouton Suivre : cours, graphique et alertes, sans rien acheter.',
    link: { to: '/markets', label: 'Marchés' } },
  { question: "Comment être prévenu d'une forte hausse ou baisse ?", answer: 'Onglet Alertes → Mes alertes, ou en un geste depuis la fiche d\'un actif. Active les notifications de ce téléphone dans Réglages.',
    link: { to: '/alerts', label: 'Alertes' } },
  { question: 'Comment suivre mon assurance-vie ou mon PER ?', answer: "Crée un portefeuille « Assurance-vie » ou « PER » avec le taux du fonds euros. Tes versements alimentent le fonds euros, les achats d'unités de compte en sortent. Un fonds introuvable dans la recherche ? Choisis « Saisis sa valeur toi-même »." },
  { question: "Mon FCPE d'entreprise n'est pas sur Yahoo, je fais comment ?", answer: "Lors de l'achat, choisis « Actif introuvable ? Saisis sa valeur toi-même », puis reporte sa valeur liquidative depuis ta fiche de la ligne à chaque relevé." },
  { question: 'Comment cacher mes montants ?', answer: "Touche l'œil à côté de ton patrimoine : les montants sont masqués partout, les pourcentages restent visibles." },
  { question: 'Que dois-je déclarer aux impôts ?', answer: 'La page Fiscalité liste les cases et leurs montants pour une année, calculés depuis tes opérations. Estimation indicative : vérifie toujours avant de signer.',
    link: { to: '/tax', label: 'Fiscalité' } },
];
