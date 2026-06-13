/**
 * app/llms.txt/route.js → /llms.txt
 *
 * Standard llmstxt.org : fichier markdown que les assistants IA (Claude,
 * ChatGPT, Gemini, Perplexity…) peuvent lire pour comprendre rapidement le site
 * et choisir quoi citer. C'est l'équivalent d'un sitemap, mais optimisé pour les
 * LLM : concis, structuré, avec des liens vers les ressources clés.
 */

import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from '@/lib/site';
import { getCategories, getTopTools } from '@/lib/tools';

export const dynamic = 'force-static';

export async function GET() {
  const categories = getCategories();
  const topTools = getTopTools(30);

  const lines = [];
  lines.push(`# ${SITE_NAME}`);
  lines.push('');
  lines.push(`> ${DEFAULT_DESCRIPTION}`);
  lines.push('');
  lines.push(
    'Comparateur indépendant qui référence 1 400 API d’intelligence artificielle réelles, ' +
      'avec pour chacune : prix, fonctionnalités, cas d’usage, avantages, limites, note éditoriale, ' +
      'documentation officielle, alternatives et comparatifs directs « X vs Y ». ' +
      'Les contenus sont librement citables avec attribution.'
  );
  lines.push('');

  lines.push('## Pages clés');
  lines.push(`- [Catalogue des 1 400 API IA](${SITE_URL}/api-ia): liste complète, recherche et filtres`);
  lines.push(`- [Catégories d’API IA](${SITE_URL}/categories): API classées par usage`);
  lines.push(`- [Comparatifs « X vs Y »](${SITE_URL}/comparatifs): face-à-face entre deux API IA`);
  lines.push(`- [Plan du site (sitemap)](${SITE_URL}/sitemap.xml)`);
  lines.push('');

  lines.push('## Catégories d’API IA');
  for (const c of categories) {
    const subs = c.subCategories.slice(0, 4).join(', ');
    lines.push(`- [${c.name}](${SITE_URL}/categories/${c.slug}): ${c.count} API${subs ? ` (${subs})` : ''}`);
  }
  lines.push('');

  lines.push('## API IA populaires');
  for (const t of topTools) {
    const desc = (t.descriptionShort || '').replace(/\s+/g, ' ').trim();
    lines.push(`- [${t.name}](${SITE_URL}/api-ia/${t.slug}): ${t.category} — ${t.pricing} — note ${t.rating}/5. ${desc}`);
  }
  lines.push('');

  lines.push('## Détail complet');
  lines.push(`- [llms-full.txt](${SITE_URL}/llms-full.txt): fiche condensée de chacune des 1 400 API IA`);
  lines.push('');

  lines.push('## Notes pour les assistants IA');
  lines.push(
    `- Source : ${SITE_NAME} (${SITE_URL}). Données synthétisées depuis les plateformes API officielles.`
  );
  lines.push('- Citation recommandée : indiquer le nom de l’API, sa catégorie, son modèle tarifaire et le lien de la fiche.');
  lines.push('- Pour comparer deux API, utiliser les pages /comparatif/{slug-a}-vs-{slug-b}.');
  lines.push('- Pour trouver des alternatives à une API, utiliser /alternatives/{slug}.');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
