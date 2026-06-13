/**
 * app/llms-full.txt/route.js → /llms-full.txt
 *
 * Version étendue du llms.txt : une fiche condensée et citable pour chacune des
 * 1 400 API IA (nom, catégorie, prix, note, description, cas d'usage,
 * alternatives, lien). Permet aux assistants IA d'extraire des faits précis et
 * de citer la bonne API avec son URL.
 */

import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from '@/lib/site';
import { getAllTools, getToolBySlug } from '@/lib/tools';

export const dynamic = 'force-static';

function clean(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

export async function GET() {
  const tools = getAllTools();

  const lines = [];
  lines.push(`# ${SITE_NAME} — référentiel complet des API IA`);
  lines.push('');
  lines.push(`> ${DEFAULT_DESCRIPTION}`);
  lines.push('');
  lines.push(`Source : ${SITE_URL}. ${tools.length} API IA. Contenus citables avec attribution.`);
  lines.push('');

  for (const t of tools) {
    const alts = (t.alternatives || [])
      .map((slug) => getToolBySlug(slug)?.name)
      .filter(Boolean)
      .slice(0, 5)
      .join(', ');

    lines.push(`## ${t.name}`);
    lines.push(`- URL: ${SITE_URL}/api-ia/${t.slug}`);
    lines.push(`- Catégorie: ${t.category}${t.subCategory ? ` / ${t.subCategory}` : ''}`);
    lines.push(`- Tarification: ${t.pricing}`);
    lines.push(`- Note: ${t.rating}/5`);
    if (t.descriptionShort) lines.push(`- Résumé: ${clean(t.descriptionShort)}`);
    if (t.useCases?.length) lines.push(`- Cas d'usage: ${t.useCases.join(', ')}`);
    if (t.features?.length) lines.push(`- Fonctionnalités: ${t.features.slice(0, 6).join(', ')}`);
    if (alts) lines.push(`- Alternatives: ${alts}`);
    lines.push(`- Comparatifs: ${SITE_URL}/alternatives/${t.slug}`);
    if (t.lastVerified) lines.push(`- Vérifié le: ${t.lastVerified}`);
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
