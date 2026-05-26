# Données réelles API IA uniquement

Ce projet contient **108 fiches d'API IA réelles** dans `data/tools.json`.

Chaque entrée contient :

- `website` : documentation ou page officielle.
- `sourceUrl` : source utilisée pour vérifier l’existence de l’API.
- `verified: true` : l’existence de l’API a été vérifiée par une source officielle au moment de la constitution du seed.
- `type: "api"` : aucune fiche outil IA non-API n’est incluse.

## Note sur les 15 000 entrées

Je n’ai pas rempli le JSON avec 15 000 fiches inventées. Pour un projet SEO sérieux, mieux vaut publier moins de pages mais avec des données exactes, vérifiables et utiles.

Le code est prêt à scaler : quand tu ajoutes une API dans `data/tools.json`, Next.js génère automatiquement :

- sa fiche `/api-ia/[slug]`,
- sa page alternatives,
- ses comparatifs,
- les entrées de sitemap,
- ses métadonnées SEO,
- ses Schema.org.
