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

## Conventions de code à respecter
- Un dossier par domaine dans `src/features/` (assets, auth, dashboard,
  portfolios, positions, settings, transactions) avec `api/` (hooks React
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