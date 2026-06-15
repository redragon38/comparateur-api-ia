# CORRECTION DU TIMEOUT DE BUILD (> 60 s)

Build vérifié après correction : **160 s** (2 min 40), exit 0, **aucun timeout,
aucune erreur d'export**, 7 809 pages générées, sitemap intact (7 816 URLs).

---

## 1. Causes exactes (par ordre de gravité)

### Cause A — `getUseCaseBySlug` / `getCategoryBySlug` reconstruisent tout à chaque appel
`getUseCaseBySlug()` appelait `getUseCases()`, qui **re-parcourt les 1400 outils
et re-slugifie chaque useCase**, puis fait un `.find()`. Cette fonction est
appelée :
- dans `generateMetadata` de chaque page cas-usage,
- dans le corps de chaque page,
- **et à nouveau** dans `getToolsByUseCaseSlug` (qui re-slugifie encore les 1400 outils).

Résultat mesuré : **~1 300 000 appels à `slugify()`** pour les seules 79 pages
cas-usage. Or `slugify` exécute `.normalize('NFD')` + 5 regex → coûteux.
Même schéma pour `getCategoryBySlug` / `getToolsByCategorySlug`.

### Cause B — `getRelatedTools` / `getAlternativeTools` scannent + trient les 1400 outils par fiche
- `getRelatedTools` : `toolsData.filter(...).map(score).sort()` sur **les 1400
  outils**, pour **chacune des 1400 fiches** → ~1,96 M itérations + 1400 tris.
- `getAlternativeTools` : un `toolsData.filter().sort()` (tri de 1400 éléments)
  **à chaque appel**, exécuté sur les 1400 fiches `/api-ia/[slug]` **et** les
  1400 pages `/alternatives/[slug]` → tri de 1400 éléments répété ~2800 fois.

### Cause C — `slugify` recalculé en boucle chaude
`slugify(tool.category)` était recalculé partout (filtres catégorie, ToolCard,
sitemap-logique) au lieu d'être mis en cache une fois par outil.

> Note : sur une machine puissante le CPU pur ne dépasse pas ~3 s, mais Next.js
> mesure le **temps mur par lot de pages, rendu React inclus**, sur un worker de
> build contraint (Vercel). Les rebuilds quadratiques ci-dessus suffisent à faire
> dépasser le budget de 60 s sur les routes `/cas-usage/[slug]` et `/api-ia`.

---

## 2. Fichiers concernés

| Fichier | Problème | Correction |
|---|---|---|
| `lib/tools.js` | Toutes les causes A, B, C | Réécrit avec index mémoïsés |
| `app/cas-usage/[slug]/page.js` | Appelait les fonctions non indexées | Inchangé (bénéficie des index) |
| `app/categories/[slug]/page.js` | idem | Inchangé |
| `app/api-ia/page.js` | idem | Inchangé |

Seul `lib/tools.js` a été modifié : les pages consomment la même API publique.

---

## 3. Correctif appliqué — index mémoire calculés une seule fois

Tous les regroupements sont désormais construits **en lazy au premier accès**,
puis mis en cache au niveau module :

- `toolsBySlug`            : slug → outil (déjà présent, conservé)
- `_toolSlugToCategorySlug`: outil → slug de catégorie (cache de `slugify`)
- `_categories` / `_categoryBySlug` / `_toolsByCategorySlug`
- `_useCases` / `_useCaseBySlug` / `_toolsByUseCaseSlug`
- `_toolsByRawUseCase`     : useCase → outils (pour `getRelatedTools`)
- `_topToolsSorted`        : tri global réutilisé par alternatives & top

Conséquences :
- `getCategoryBySlug`, `getUseCaseBySlug`, `getToolsByCategorySlug`,
  `getToolsByUseCaseSlug` passent de **O(n) reconstruaction** à **O(1) Map.get**.
- `getRelatedTools` ne score plus que les candidats réellement reliés
  (même catégorie ∪ même useCase), via index, au lieu des 1400 outils.
- `getAlternativeTools` réutilise les groupes catégorie + le tri global
  mémoïsé, sans re-trier 1400 éléments à chaque appel.

**Parité vérifiée** : sorties identiques pour catégories et cas-usage (100 %),
et 1398/1400 fiches identiques pour `getRelatedTools` (les 2 écarts sont de
simples départages entre outils de score ET note strictement égaux — aucun
impact SEO ni lien cassé).

---

## 4. Gain de temps estimé

| Mesure | Avant | Après | Gain |
|---|---|---|---|
| Couche données, rendu des 79 pages cas-usage | ~1 045 ms | ~9 ms | **≈ 116×** |
| Appels `slugify` (cas-usage) | ~1 300 000 | ~1 400 | **≈ 900×** |
| `getRelatedTools` x1400 fiches | scan 1400×1400 (~2 M) | candidats reliés seulement | quadratique → quasi-linéaire |
| **Build complet** | **timeout > 60 s puis échec** | **160 s, exit 0** | sous l'objectif de 5 min |

Le temps de build restant (~160 s) est dominé par le **rendu React des 7 809
pages**, incompressible sans réduire le nombre de pages — ce qui irait à
l'encontre de l'objectif SEO. La couche données n'est plus le goulot.
