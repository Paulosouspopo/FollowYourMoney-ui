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

## Points sensibles en cours
- Après l'ajout d'une transaction ancienne (ex: achat BTC en 2023), le
  backend déclenche un backfill de prix + recalcul des snapshots qui peut
  prendre plusieurs secondes. Le front doit gérer cet état (loading /
  refetch après un court délai) plutôt que supposer que le dashboard est
  à jour immédiatement après la mutation.
- Vérifier que le formulaire de transaction n'autorise pas de date future,
  et que le format envoyé au back correspond bien à un `LocalDateTime` ISO
  sans fuseau (`YYYY-MM-DDTHH:mm:ss`).

## Conventions de code à respecter
- Un dossier par domaine (transactions, portfolios, dashboard, assets),
  avec `hooks/`, `types/`, composants dédiés.
- Query keys structurées en objets `xxxKeys` (`all`, `byPortfolio`,
  `bySymbol`, etc.) — garder ce pattern pour toute nouvelle feature.
- Formulaires : Zod schema + `zodResolver`, gestion des erreurs serveur via
  `setError` sur les champs correspondants (`fieldErrors`).

## Ce qu'il ne faut PAS faire
- Ne pas réintroduire de liste d'actifs statique/whitelist.
- Ne pas laisser l'utilisateur taper un symbole libre dans un champ texte.
- Ne pas dupliquer `portfolioId` dans le body des requêtes s'il est déjà
  dans l'URL.
- Ne pas proposer de composants nécessitant des libs non installées
  (vérifier `package.json` avant de suggérer `cmdk`, `Combobox` shadcn, etc.)

## Repo
https://github.com/Paulosouspopo/FollowYourMoney-ui