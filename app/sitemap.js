/**
 * app/sitemap.js — Sitemap dynamique natif Next.js (App Router)
 *
 * Remplace l'ancien public/sitemap.xml (qui ne contenait QUE la page d'accueil)
 * et le script scripts/generate-sitemap.mjs (cassé : l'alias @/ ne se résout
 * pas en Node pur, le sitemap retombait donc sur un stub vide).
 *
 * Couvre la TOTALITÉ des pages réelles du site (~7 700 URLs) :
 *   - pages statiques (accueil, api-ia, catégories, contact, légal)
 *   - 1 400 fiches      /api-ia/[slug]
 *   - 1 400 alternatives /alternatives/[slug]
 *   - 19 catégories      /categories/[slug]
 *   - ~4 900 comparatifs /comparatif/[a-vs-b]
 *
 * Tout tient dans un seul fichier /sitemap.xml : la limite Google est de
 * 50 000 URLs / 50 Mo par sitemap, on reste très en dessous. Un fichier unique
 * garantit que robots.txt (qui pointe vers /sitemap.xml) reste valide.
 *
 * IMPORTANT : ce fichier s'exécute dans le contexte de build Next.js, donc
 * l'alias @/ et l'import du JSON fonctionnent (contrairement au script .mjs).
 */

import { SITE_URL } from '@/lib/site';
import {
  getAllTools,
  getCategories,
  getComparisonPairs,
} from '@/lib/tools';

export default function sitemap() {
  const now = new Date();
  const entries = [];

  const push = (path, { priority = 0.7, changeFrequency = 'weekly', lastModified = now, images } = {}) => {
    const entry = {
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    };
    // Sitemap images → éligibilité Google Images (impressions supplémentaires).
    if (images && images.length) entry.images = images;
    entries.push(entry);
  };

  // 1. Pages statiques stratégiques
  push('/', { priority: 1.0, changeFrequency: 'daily' });
  push('/api-ia', { priority: 0.95, changeFrequency: 'daily' });
  push('/categories', { priority: 0.9, changeFrequency: 'weekly' });
  push('/comparatifs', { priority: 0.9, changeFrequency: 'weekly' });
  push('/contact', { priority: 0.4, changeFrequency: 'monthly' });
  push('/mentions-legales', { priority: 0.2, changeFrequency: 'yearly' });
  push('/politique-confidentialite', { priority: 0.2, changeFrequency: 'yearly' });

  // 2. Catégories — pages hub à fort potentiel SEO
  for (const category of getCategories()) {
    if (category.slug) {
      push(`/categories/${category.slug}`, { priority: 0.85, changeFrequency: 'weekly' });
    }
  }

  // 3. Fiches API — le cœur du catalogue (intention transactionnelle forte)
  const tools = getAllTools();
  for (const tool of tools) {
    if (!tool.slug) continue;
    // lastVerified fournit un lastmod plus crédible quand il est disponible
    const parsed = tool.lastVerified ? new Date(tool.lastVerified) : now;
    const lastModified = Number.isNaN(parsed.getTime()) ? now : parsed;
    const images = tool.logo ? [`${SITE_URL}${tool.logo}`] : undefined;
    push(`/api-ia/${tool.slug}`, { priority: 0.8, changeFrequency: 'weekly', lastModified, images });
  }

  // 4. Pages alternatives — capte les recherches "alternative à X"
  for (const tool of tools) {
    if (tool.slug) {
      push(`/alternatives/${tool.slug}`, { priority: 0.7, changeFrequency: 'weekly' });
    }
  }

  // 5. Comparatifs "X vs Y" — longue traîne très qualifiée
  for (const pair of getComparisonPairs(null)) {
    if (pair.comparison) {
      push(`/comparatif/${pair.comparison}`, { priority: 0.6, changeFrequency: 'monthly' });
    }
  }

  return entries;
}
