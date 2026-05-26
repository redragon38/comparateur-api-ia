# Architecture complète

- Next.js App Router
- JavaScript uniquement
- CSS classique
- Dataset JSON : 108 API IA réelles dans `data/tools.json`
- Routes statiques générées automatiquement depuis JSON

## Routes

| Route | Rôle |
|---|---|
| `/` | Accueil |
| `/api-ia` | Liste filtrable des API IA |
| `/api-ia/[slug]` | Fiche SEO API IA |
| `/categories` | Index des catégories API IA |
| `/categories/[slug]` | Page catégorie |
| `/alternatives/[slug]` | Alternatives API automatiques |
| `/comparatif/[comparison]` | Comparatif automatique `api-a-vs-api-b` |
| `/contact` | Contact |
| `/mentions-legales` | Mentions légales |
| `/politique-confidentialite` | Confidentialité |
| `/sitemap.xml` | Sitemap dynamique |
| `/robots.txt` | Robots dynamique |

## Volume généré

- Entrées JSON : 108 API IA
- Pages API : 108
- Pages alternatives : 108
- Pages catégorie : générées depuis les catégories du JSON
- Pages comparatif : générées depuis les relations `alternatives`


## Dataset actuel

- `data/tools.json` : 1400 entrées, toutes `type: "api"`.
- Génération statique via `generateStaticParams()`.
- Métadonnées SEO via `generateMetadata()`.
