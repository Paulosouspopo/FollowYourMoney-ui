# FollowYourMoney — Frontend

## Contexte général
Frontend de l'application de suivi de portefeuille d'investissement
(voir backend `FollowYourMonney` pour le contexte produit complet).
Réécriture complète d'un ancien projet front abandonné.

Objectif : UI moderne, propre, avec de beaux graphiques et des vues claires
(portefeuille / actions / transactions / bénéfices / évolution dans le temps),
alors que les apps bancaires/investissement existantes manquent de clarté.

## Stack
- React + TypeScript
- Vite (`npm run dev`)
- TanStack Query (React Query) pour le data-fetching/cache
- React Hook Form + Zod pour les formulaires/validation
- Tailwind (composants type `Button`, `Input`, `BottomSheet`, `SegmentedControl`)
- Lucide-react pour les icônes (⚠️ attention aux imports, ex: `Link` vs le
  composant de routing — piège déjà rencontré)

## Décisions importantes (ne pas revenir en arrière dessus)
- **Recherche d'actif en live**, pas de liste statique :
  `useAssetSearch` interroge `GET /api/assets/search?query=...` (proxy back
  vers Yahoo `/v1/finance/search`), avec debounce. L'utilisateur ne saisit
  jamais de symbole à la main, il choisit dans les résultats.
- Le `symbol` stocké et envoyé au back est **exactement** celui retourné
  par Yahoo (ex: `BTC-EUR`, `TTE.PA`) — jamais reconstruit côté front.
- `AssetPicker` statique + `useAvailableAssets` + `AvailableAssetResponse`
  → **supprimés/remplacés** par `AssetSearchCombobox` + `useAssetSearch` +
  `AssetSearchResult`.
- Le back gère la logique métier de validation (`validateBusinessRules`) :
  le schéma Zod côté front n'est qu'un **miroir** pour le feedback immédiat,
  pas la source de vérité.
- Toute mutation de transaction (create/update/delete) doit invalider :
  les transactions du portefeuille, le détail portefeuille, **et** tout le
  dashboard (`dashboardKeys.all`) — la valorisation dépend de tout.

## Contrat avec le back (points non évidents)
- Une mutation de transaction attend, AVANT la réponse, le backfill Yahoo +
  la reconstruction des snapshots : timeout dédié (`MUTATION_TIMEOUT`,
  120 s) et message d'attente dans le formulaire. À la réponse, le dashboard
  est à jour : une simple invalidation suffit.
- Dates : `LocalDateTime` sans fuseau (`YYYY-MM-DDTHH:mm:ss`) construit en
  heure LOCALE — jamais `toISOString()` (UTC, décale le jour).
- Dividende : le formulaire saisit le montant total et envoie
  `quantity = 1` (le back calcule `totalAmount = quantity × pricePerUnit`).
- La devise d'une transaction n'est pas modifiable après création.
- `priceMissing` = pas de cours de marché, position estimée au prix de la
  dernière transaction (afficher « Prix estimé », pas 0).

## Liquidités et livrets
- `features/cash` : mouvements d'argent (versement, retrait, intérêts,
  frais), API `/portfolios/{id}/cash-movements`, invalidation des mouvements
  du portefeuille + `dashboardKeys.all`.
- Page portefeuille en 3 formes : livret (`LivretHero`, `livretKpis`,
  mouvements), compte avec `cashTracking` (positions + `CashSection`, le
  bouton + propose opération ou mouvement via `AddEntrySheet`), compte sans
  suivi (positions et opérations).
- Livret : pas d'opération sur actif, solde jamais négatif (avertissement
  avant envoi, le back refuse). Compte-titres : solde négatif affiché avec
  une invitation à saisir les versements.
- Répartition : `AllocationSliceDTO.category` (types d'actifs + `LIQUIDITES`),
  libellés/couleurs `ALLOCATION_LABEL` / `ALLOCATION_COLOR`.
- Dates : `shared/lib/dates` (`todayLocal`, `nowLocalDateTime`), jamais
  `toISOString()`.

## Import de relevés
- Page `/portfolios/:id/import` (`features/imports`), accès via l'icône
  d'import du menu du portefeuille. Étapes : fichier → association des
  colonnes si format inconnu (`ColumnMappingForm`) → aperçu → validation.
- Aperçu : actifs à valider (`AssetMappingList` : REMEMBERED/CERTAIN acceptés
  d'office, les autres à confirmer ou à choisir via `AssetSearchCombobox`),
  lignes par statut (à importer, doublons, ignorées, erreurs), activation du
  suivi des liquidités si le relevé contient des versements.
- Erreur de validation : `fieldErrors` `row:<id>` → message sur la ligne.
- L'aperçu et la validation peuvent être longs (Yahoo, recalcul) : timeouts
  dédiés dans `import.api.ts`.

## Investissements programmés
- `features/plans` : `PlansSection` sur la page portefeuille (budget mensuel,
  liste, bouton « Programmer »), `UpcomingPlansCard` sur le dashboard.
- `PlanFormSheet` : types possibles selon le compte (livret → versement ;
  sans suivi des liquidités → achat), actif via `AssetSearchCombobox`,
  avertissement si la 1re échéance est passée (historique recréé), champs
  figés après une échéance, pause.
- Une mutation de plan peut créer des transactions : invalider plans,
  transactions, liquidités et dashboard.

## Notifications
- Onglet « Alertes » (`/alerts`, `features/notifications`) : notifications
  reçues (`InboxList`, clic = lu + ouverture du lien), règles
  (`AlertRulesList`, `AlertRuleFormSheet` : la phrase « Quand … » à
  compléter), rapport périodique (`ReportSettingsCard`, aperçu).
- Compteur de non-lues dans la barre du bas (`useUnreadCount`, rafraîchi
  chaque minute).
- Formulaire d'alerte : conditions proposées selon le périmètre
  (`CONDITIONS_BY_SCOPE`), seuil absent pour un record (NEW_HIGH/NEW_LOW),
  périodes selon la condition (`periodsFor`), nom libre, canaux push/email,
  préréglage `preset` (fiche d'un actif). Liste : sourdine 24 h, `toRequest`
  pour renvoyer une règle existante.

## Push et PWA
- `public/sw.js` : service worker SANS cache (les chiffres viennent toujours
  du serveur) : affiche le push `{ title, body, link, tag }`, clic = focus
  d'un onglet + `postMessage` de navigation (routeur, `main.tsx`) ou
  ouverture. `public/manifest.webmanifest` + icônes `public/icons/`.
- `shared/pwa/push.ts` : support (iOS : app ajoutée à l'écran d'accueil
  obligatoire), abonnement avec la clé VAPID du back. Réglages →
  `PushSettingsCard` (cet appareil, test, tous les appareils, heures calmes).

## Marchés
- Onglet `/markets` (`features/markets`) : actifs suivis (détenus ou non),
  mini-courbe 30 j (`Sparkline`), suggestions d'indices/cryptos.
- Fiche `/markets/:symbol` (symbole encodé, `marketPath`) : cours, graphique
  1M→5A (`MarketChart`), position dans le range 1 an (`RangeBar`), mes lignes,
  alertes en un geste (−5 %, +5 %, plus haut 1 an) ou personnalisées.
- Les mutations d'alerte invalident aussi `['markets']` (fiche et compteurs).

## Performance et devise d'affichage
- `features/performance` : `PerformanceCard` (dashboard et portefeuille) :
  TWR, rendement de l'argent (XIRR au-delà d'un an), gain, apports nets,
  courbe comparée à un indice (`BenchmarkPicker` : raccourcis ou recherche,
  choix mémorisé par `useBenchmarkStore`), classement des portefeuilles.
  Clés sous `dashboardKeys.all` : les invalidations existantes suffisent.
- Devise d'affichage (`shared/currency`) : préférence de l'appareil,
  `DisplayCurrencyScope` règle `formatEur` (montant EUR converti au taux du
  jour) et remonte l'arbre au changement. `MoneyValue` SANS `currency` =
  montant EUR converti ; AVEC `currency` = affiché tel quel (cours, saisie).
  La courbe arrive convertie du back (`curveCurrency`, taux historiques) :
  `EvolutionChart` la formate avec `formatMoney`, sans reconvertir.

## Interface (système visuel)
- Tokens dans `src/index.css` (oklch) : neutres bleutés, UN accent
  (`--primary`, indigo), `--positive` / `--negative`, `--glow`. Aucune
  couleur en dur (sauf les couleurs de catégories dans `shared/model/enums`).
- Signature : `ValueHero` (dashboard, portefeuille) = montant en
  `.text-display` animé (`useCountUp`) + courbe ; glisser sur la courbe met à
  jour l'en-tête (date, valeur, variation de plus-value depuis le début de la
  période). Halo : classe `.glow` (pseudo-élément, une seule par écran).
- Graphiques maison, sans librairie (recharts retiré, −100 Ko gzip) :
  `shared/charts/TimeSeriesChart` (aire / ligne / pointillés, curseur
  souris-doigt-clavier, bulle optionnelle, axe % optionnel), `DonutChart`,
  géométrie testée dans `geometry.ts` (courbe monotone : pas de faux pic).
  Tracé animé via `pathLength` + `.chart-draw` ; l'animation se termine sans
  tirets (robuste si `pathLength` est ignoré). Mémoriser `series`/`dates`
  (`useMemo`) : le composant est `memo`.
- Mise en page : mobile une colonne + barre du bas collée (`BottomNav`, `MOBILE_NAV_ITEMS`) ; ≥ lg
  barre latérale (`Sidebar`, liste commune `app/layout/nav.ts`) et grille
  12 colonnes (8 + 4) sur l'accueil, un portefeuille, une fiche actif. Pages
  de formulaire bornées (`lg:max-w-2xl` / `3xl`). `BottomSheet` = fenêtre
  centrée sur grand écran.
- Titres de page `text-2xl font-semibold tracking-tight`, de section
  `SectionHeader` ; tuiles de chiffres sans « 0,00 € » inutiles.
- Éléments fixes (`BottomSheet`, `Fab`) rendus en portail dans `<body>` ;
  `.animate-rise` en `backwards` (jamais `both`/`forwards`) : un ancêtre qui
  garde une animation de transform devient le repère des `position: fixed`.
  Rien ne doit déborder à droite (sinon la page s'élargit sur mobile et la
  barre du bas se décale) : `overflow-x: clip` sur html/body en filet.
- Lignes modifiables : `EditHint` (crayon) ; fenêtres de modification :
  `onBack` + Annuler + Enregistrer.
- Tuile de portefeuille : tendance 30 j (`trends` du dashboard), principales
  lignes ou taux du livret.
- Premier lancement (aucun portefeuille) : `Welcome`. Démarrage : écran de
  marque dans `index.html` puis `Splash` (même rendu).
- Perf : pages préchargées à l'inactivité (`app/pages.ts`), données d'un
  portefeuille préchargées au survol (`usePrefetchPortfolio`).
- Vérifier visuellement : captures Playwright (Chrome installé) en mobile
  390 px et bureau 1440 px, thèmes clair et sombre. Attention : la connexion
  est limitée (10 / email, 20 / IP par 15 min) et le cookie de session
  tourne à chaque renouvellement (ne pas le rejouer entre contextes).

## Confort et analyse (v2)
- Mode confidentialité (`shared/privacy`) : `formatEur`, `formatQty`,
  `formatPrivateMoney`, `MoneyValue personal` masquent (••••) ;
  pourcentages, cours et `formatMoney` (prix, saisie) restent visibles.
  Appliqué par `DisplayCurrencyScope` (clé de remontage).
- Qualité des saisies (`features/quality`) : `TransactionCheckHint` dans le
  formulaire (débounce 500 ms, « Utiliser <cours> »), `DataQualityBanner`
  sur l'accueil (corriger / « c'est normal »). Les tests du formulaire
  simulent `useTransactionCheck`.
- Revenus (`/income`, `features/income`) : `BarChart` maison, calendrier,
  détail par ligne ; `IncomeCard` sur l'accueil.
- Objectifs (`/goals`, `features/goals`) : `projection.ts` pur et testé
  (taux mensuel équivalent, délai, effort) ; simulateur 3 scénarios,
  `GoalVerdict`, `GoalsCard`. Montants projetés arrondis (`formatEurRounded`).
- Barre latérale : section « Analyse » (`SECONDARY_NAV_ITEMS`). Mobile :
  barre du bas = 4 onglets + « Plus » (`/more`, `MorePage`) qui liste
  `MORE_SECTIONS` (Analyse, Compte) ; « Plus » reste actif sur ses pages
  (`isNavActive`). Nouvelle page secondaire = une entrée dans `nav.ts`. Clés de requête de ces features sous
  `dashboardKeys.all` (rafraîchies par toute mutation d'opération).

## Fiscalité et corrections
- `/tax` (`features/tax`) : année (défaut : écoulée), impôt estimé, cases à
  reporter (copie du montant), cessions titres / crypto, PEA (5 ans, plafond),
  export CSV (`taxCsv.ts`, « ; » et virgule décimale), rappels. `TaxCard` sur
  l'accueil. Date d'ouverture d'un portefeuille dans son formulaire.
- « Changer d'actif » sur la fiche d'une position (`ReplaceAssetSheet`) ;
  l'alerte PEA ouvre la fenêtre directement (`?changer=1`).

## Visites guidées et guide (v4)
- Moteur maison `shared/tour` (sans librairie) : `TourOverlay` (portail,
  dans AppShell) éclaire l'élément `[data-tour="…"]` (première visée visible :
  barre du bas OU barre latérale), bulle placée par `placement.ts` (testé),
  suivi à chaque image (défilement, animations). Étapes dont la visée manque
  au lancement : sautées. `interactive` : l'élément reste utilisable.
  Échap / flèches ; changement de page = arrêt sans compter comme vue.
- État par compte (`tour.api.ts`, `/api/tutorials`) : visite terminée OU
  fermée = vue ; case « Ne plus afficher » coupe l'affichage automatique.
- `usePageTour(tour, ready)` : lance la visite à la 1re ouverture d'une page
  (après 900 ms, une fois par session) ou via `?tour=<clé>` (page Guide).
  `ready` = données chargées et aucune fenêtre ouverte. `TourButton` (« ? »)
  dans l'en-tête de chaque page.
- Contenu : `features/guide/tours.tsx` (une visite par page, textes
  tutoyés, exemples chiffrés `Example`/`Def`). Nouvelle fonction importante =
  un attribut `data-tour` + une étape. Page `/guide` : visites (progression,
  lancement selon les données du compte, `guideEntries`), quiz, lexique, FAQ
  (`model/guide.content.ts`), préférences. Accès : « Plus » → Aide, barre
  latérale, Réglages.
- Tests : `src/test/setup.ts` simule `tour.api` (tout vu, auto coupé) pour
  que les tests de pages n'aient pas besoin de QueryClient.

## Enveloppes, actifs non cotés, devises (v5, lot A)
- `shared/model/portfolioRules.ts` : miroir de `PortfolioRules` (enveloppes,
  fonds euros, libellé du solde `cashLabel`, types de mouvement proposés,
  `isManualSymbol` / `displaySymbol` / `iconLabel`). Le symbole interne « ~… »
  d'un actif non coté ne s'affiche jamais (« non coté », initiales du nom).
- Formulaire de portefeuille : phrase d'aide par type, taux du fonds euros
  (AV, PER), suivi des liquidités forcé pour livret et enveloppes, « Compte
  multidevise » si le suivi est actif, date d'ouverture = 8 ans d'une AV.
- `CashMovementFormSheet` : types selon le compte (abondement, change),
  devise et montant reçu (multidevise), `prefill` (intérêts à créditer).
  `CashSection` : libellé du solde, soldes par devise, `InterestHint`
  (intérêts courus de l'année + « Créditer les intérêts N-1 »).
- Actifs non cotés : `ManualAssetPicker` sous la recherche du formulaire
  d'opération (existants + création par nom), `ValuationsSection` sur la fiche
  de la ligne (valeurs liquidatives). Clés sous `dashboardKeys.all`.
- Fiscalité : `TaxBracketCard` (tranche marginale), économie PER dans l'en-tête,
  case 6NS, cartes assurance-vie (8 ans, rachats) et épargne salariale.

## Authentification
- Jeton d'accès (JWT 15 min) **en mémoire uniquement** (`shared/auth/auth.store`,
  jamais de localStorage). Session longue = cookie HttpOnly `fym_refresh`
  géré par le navigateur (`withCredentials: true`).
- Au démarrage, `RequireAuth` / `GuestOnly` appellent `refreshSession()`
  (`shared/auth/session.ts`) : statut `loading` → `authenticated` / `anonymous`.
- Sur 401, l'intercepteur axios renouvelle UNE fois (appel unique partagé
  entre requêtes simultanées, second essai différé pour le cas multi-onglets)
  puis rejoue la requête. Les appels `/auth/*` passent `skipAuthRefresh`.
- Pages publiques : `/login`, `/register` (→ « vérifie ta boîte mail »),
  `/forgot-password`, `/verify-email?token=`, `/reset-password?token=`.
  Erreur `code === 'EMAIL_NOT_VERIFIED'` → proposer le renvoi de l'email.
- En dev sans serveur mail, les liens des emails sont dans les logs du backend.

## Conventions de code à respecter
- Un dossier par domaine dans `src/features/` (assets, auth, cash, dashboard,
  imports, markets, notifications, plans, portfolios, positions, settings,
  transactions) avec `api/` (hooks React
  Query + query keys), `model/` (types), `components/`, `pages/`.
- `src/shared/` : `api/` (client axios, erreurs normalisées en `ApiError`,
  `queryClient`), `ui/` (primitives), `components/data/` (affichage de
  montants), `model/` (enums, libellés, couleurs par type — source unique),
  `theme/` (clair/sombre/système).
- Feedback : `toast` (`shared/ui/toast.store`) après une mutation,
  `ConfirmDialog` pour toute action destructive (pas de `window.confirm`).
- Couleurs : tokens CSS (`text-muted-foreground`, `text-gain`, `text-loss`,
  `text-warning`, `bg-primary text-primary-foreground`…), jamais de couleur
  en dur ni `hsl(var(--x))` (le thème est en oklch : `var(--x)`).
- Champs numériques de formulaire : valeur par défaut vide + placeholder
  `0` (sinon taper « 1 » donne « 01 »).
- Tests : Vitest + Testing Library (`npm test`, `npm run test:watch`),
  fichiers `*.test.ts(x)` à côté du code testé. Les hooks d'API sont
  mockés (`vi.mock`) : on teste le body envoyé au back et la gestion de ses
  réponses. Fuseau forcé à `Europe/Paris` (vite.config.ts) pour les dates.
- CI : GitHub Actions (`.github/workflows/ci.yml`) : lint, tests, build.
- Query keys structurées en objets `xxxKeys` (`all`, `byPortfolio`,
  `bySymbol`, etc.) — garder ce pattern pour toute nouvelle feature.
- Formulaires : Zod schema + `zodResolver`, gestion des erreurs serveur via
  `setError` sur les champs correspondants (`fieldErrors`).

## Ce qu'il ne faut PAS faire
- Ne pas réintroduire de liste d'actifs statique/whitelist.
- Ne pas laisser l'utilisateur taper un symbole libre dans un champ texte.
- Ne pas dupliquer `portfolioId` dans le body des requêtes : il est dans
  l'URL (le back ne l'accepte plus dans `TransactionCreateRequest`).
- Ne pas proposer de composants nécessitant des libs non installées
  (vérifier `package.json` avant de suggérer `cmdk`, `Combobox` shadcn, etc.)

## Repo
https://github.com/Paulosouspopo/FollowYourMoney-ui