# Comparateur API IA — Next.js App Router

Projet Next.js exploitable pour créer un comparateur SEO **uniquement dédié aux API IA réelles**, inspiré du style Comparateur-Tech : cartes premium, badges, fiches détaillées, alternatives, comparatifs, FAQ et maillage interne.

## Stack

- Next.js App Router
- JavaScript uniquement
- CSS classique uniquement
- Données dans `data/tools.json`
- Pas de base de données
- `generateStaticParams()` pour les pages dynamiques
- `generateMetadata()` pour les balises SEO
- `app/sitemap.js` dynamique
- `app/robots.js`
- Schema.org `SoftwareApplication`, `BreadcrumbList`, `FAQPage`

## Données incluses

- `108` fiches d'API IA réelles dans `data/tools.json`
- Aucune fiche outil IA non-API
- Chaque entrée contient `website`, `sourceUrl` et `verified: true`
- Logos monogrammes générés localement dans `public/logos` pour éviter d’utiliser des logos de marques sans droits

## Routes

- `/` : accueil
- `/api-ia` : liste filtrable des API IA
- `/api-ia/[slug]` : fiche SEO API IA
- `/categories` : index des catégories API
- `/categories/[slug]` : page catégorie
- `/alternatives/[slug]` : alternatives API automatiques
- `/comparatif/[comparison]` : comparatif `api-a-vs-api-b`
- `/contact`
- `/mentions-legales`
- `/politique-confidentialite`
- `/sitemap.xml`
- `/robots.txt`

## Installation

```bash
npm install
```

## Lancement local

```bash
npm run dev
```

Ouvre ensuite `http://localhost:3000`.

## Build production

```bash
npm run build
npm run start
```

## Déploiement Vercel

1. Pousse le projet sur GitHub.
2. Importe le repo dans Vercel.
3. Ajoute les variables si nécessaire :

```bash
NEXT_PUBLIC_SITE_NAME="Comparateur API IA"
NEXT_PUBLIC_SITE_URL="https://ton-domaine.com"
```

4. Déploie.

## Scalabilité SEO

Pour ajouter des pages, ajoute uniquement des objets dans `data/tools.json`. Les routes, métadonnées, alternatives, comparatifs et sitemap sont générés automatiquement.

Note : le projet ne contient pas 15 000 fausses API. Il contient uniquement des API IA réelles et sourcées. Pour atteindre 15 000 pages fiables, il faut raccorder une vraie source éditoriale ou une base de données propriétaire vérifiée.


## Version 1 400 API IA

Cette version contient exactement **1400 fiches API IA** dans `data/tools.json`.

```bash
npm install
npm run dev
npm run build
```

Routes principales :

- `/api-ia`
- `/api-ia/[slug]`
- `/categories/[slug]`
- `/alternatives/[slug]`
- `/comparatif/[comparison]`
- `/sitemap.xml`
- `/robots.txt`

Consulte `DONNEES_API_IA_1400.md` pour le niveau de vérification des données.

## Comparatifs pré-générés

Pour éviter un build Vercel inutilement lourd, les routes dynamiques pré-génèrent par défaut un échantillon via `generateStaticParams()` : 10 fiches API, 10 pages alternatives et 20 comparatifs. Toutes les URLs restent accessibles dynamiquement par slug sur Vercel grâce à `dynamicParams = true`. Pour pré-générer tout le catalogue au build, définir `PREBUILD_ALL=true`, ou ajuster `PREBUILD_API_LIMIT`, `PREBUILD_ALTERNATIVES_LIMIT` et `PREBUILD_COMPARISON_LIMIT`.

## Vérification build

`npm run build` a été testé avec les limites de pré-génération par défaut : 10 fiches API, 10 pages alternatives et 20 comparatifs. Le catalogue complet reste dans `tools.json` et les routes restantes sont servies dynamiquement sur Vercel.

## Mise à jour design + sécurité

Cette version ajoute :

- Cards entièrement cliquables vers `/api-ia/[slug]`.
- Cards plus compactes, plus détaillées et différenciées automatiquement par API.
- Variantes visuelles déterministes : couleurs, score, layout, badges et métriques changent selon chaque API.
- Pages détail enrichies : score API, verdict rapide, signaux de confiance, checklist d’intégration, cas adaptés / cas à éviter.
- Menu haut avec lien `Accueil`.
- Formulaire de contact neutralisé par défaut : aucune donnée n’est envoyée tant qu’un backend n’est pas connecté.
- Durcissement premier déploiement : headers CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-Content-Type-Options.
- Override `postcss@8.5.10` pour obtenir `npm audit` sans vulnérabilité connue au moment du build local.

### Vérifications locales effectuées

```bash
npm run build
npm audit --audit-level=moderate
```

Résultat : build OK et 0 vulnérabilité détectée par `npm audit`.

## Correction npm / registre public

Ce projet ne doit pas utiliser de registre npm interne. Le fichier `.npmrc` force le registre public officiel :

```bash
npm config set registry https://registry.npmjs.org/
rm -rf node_modules package-lock.json
npm cache verify
npm install
npm run dev
```

Si `npm install` échoue à cause d'une ancienne URL de registre, vérifiez :

```bash
npm config get registry
```

La valeur attendue est :

```txt
https://registry.npmjs.org/
```


## Variante cards half-size

Cette version réduit environ par deux la hauteur visuelle des cards : grille 5 colonnes desktop, 6 colonnes très grand écran, badges et boutons compactés, 60 API par page.
