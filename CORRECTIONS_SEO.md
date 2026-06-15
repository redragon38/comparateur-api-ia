# CORRECTIONS SEO APPLIQUÉES

Toutes les corrections critiques de l'audit ont été appliquées. Le build a été
vérifié : **7817 pages HTML prérendues** et **7816 URLs dans le sitemap**
(contre ~63 pages et 1 URL auparavant).

## Résumé chiffré

| Avant | Après |
|-------|-------|
| ~63 pages prérendues | **7 817 pages** |
| Sitemap : 1 URL | **Sitemap : 7 816 URLs** (index + 6 fichiers) |
| Catalogue : 24 liens visibles par Google | **1 432 liens HTML en dur** |

## Détail des corrections

### 🔴 C1 — Plafond de pré-rendu supprimé (cause racine)
`generateStaticParams` ne tronque plus à 10/20 pages.
- `app/api-ia/[slug]/page.js` → 1400 fiches prérendues
- `app/alternatives/[slug]/page.js` → 1400 pages prérendues
- `app/comparatif/[comparison]/page.js` → 4911 comparatifs prérendus

### 🔴 C2 — Générateur de sitemap réécrit
`scripts/generate-sitemap.mjs` lit désormais `data/tools.json` **directement**
(l'ancien import via l'alias `@/` échouait silencieusement → sitemap à 1 URL).
Produit un **index** + 6 sitemaps thématiques, découpés à 45 000 URLs/fichier :
- `sitemap.xml` (index)
- `sitemap-static.xml`, `sitemap-categories.xml`, `sitemap-providers.xml`,
  `sitemap-alternatives.xml`, `sitemap-comparisons.xml`, `sitemap-usecases.xml`

### 🔴 C3 — Catalogue rendu crawlable
`/api-ia` et `/categories/[slug]` exposaient seulement 24 liens (pagination
client `ToolBrowser`). Ajout d'un **index HTML complet rendu côté serveur**
listant toutes les fiches en `<a href>` réels. Le composant interactif est
conservé pour l'UX.

### 🔴 C4 — Conflit robots résolu
Suppression de `public/robots.txt` (qui masquait `app/robots.js`).
`app/robots.js` est désormais l'unique source, pointant vers l'index sitemap.

### 🟠 I1 — X-Robots-Tag global retiré
`next.config.js` ne force plus `index, follow` sur toutes les routes.
L'indexation se gère page par page via `metadata.robots`.

### 🟠 I4 — Comparatifs canonicalisés
`getComparisonPairs` trie les slugs par ordre alphabétique (paire unique).
La page comparatif redirige (301) `b-vs-a` → `a-vs-b`. Zéro duplication.

### ➕ Nouvelles pages programmatiques : cas d'usage
79 pages `/cas-usage/[slug]` + hub `/cas-usage`, construites sur des données
réelles (`useCases`). Liées depuis le footer pour éviter les pages orphelines.

## ⚠️ Volontairement NON généré
Les pages `/pricing/[m]`, `/context-window/[m]` et `/benchmarks/[m]` n'ont
PAS été créées : les données correspondantes n'existent pas dans le dataset
(le champ `pricing` ne compte que 8 valeurs distinctes ; aucune donnée de
context window ni de benchmark). Les générer produirait du thin content qui
ferait *baisser* l'indexation. À construire seulement après enrichissement
du dataset.

## Prochaines étapes (manuelles)
1. Déployer.
2. Dans Google Search Console : soumettre `https://<domaine>/sitemap.xml`.
3. Demander l'indexation manuelle des 50 meilleures fiches pour amorcer le crawl.
4. Surveiller le taux d'indexation avant d'enrichir le dataset.
