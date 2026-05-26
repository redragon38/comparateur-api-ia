# Qualité des données API IA

Ce projet contient exactement **1400 entrées** dans `data/tools.json`, toutes avec `type: "api"`.

## Niveaux de vérification

- `verified_direct_official_source` : API individuelle issue du dataset vérifié initial, avec une URL officielle.
- `provider_official_api_platform` : fiche d'accès API rattachée à une plateforme IA officielle réelle. La plateforme est réelle et documentée, mais la disponibilité exacte du modèle/end-point doit être revérifiée avant publication SEO finale.

## Pourquoi cette distinction ?

Un catalogue de 1 400 fiches API IA peut être utile pour tester le SEO programmatique, le maillage interne, les sitemaps et la génération statique Next.js. En revanche, avant mise en production éditoriale, il faut valider :

- disponibilité exacte de chaque modèle/API chez le provider ;
- URL officielle spécifique du modèle quand elle existe ;
- prix, quotas, régions et conditions d’usage ;
- descriptions uniques, non dupliquées et utiles.

## Recommandation SEO

Pour éviter du contenu thin ou doorway, enrichis progressivement les fiches qui génèrent des impressions dans Google Search Console : benchmarks, exemples de payload, limites, prix, latence, SDK, alternatives réellement testées.
