/**
 * app/api-ia/[slug]/page.js — Page de détail d'une API IA
 *
 * CORRECTIONS DE SÉCURITÉ :
 *
 * 1. Validation du slug avant toute utilisation (validateSlug)
 *    → Bloque path traversal, injections HTML, caractères hors-whitelist
 *
 * 2. sanitizeText() sur les champs qui alimentent les metadata
 *    → Empêche l'injection de balises dans le title/description OG
 *
 * 3. sanitizeExternalUrl() sur le logo OG
 *    → Évite les URLs javascript: ou data: dans les metadata openGraph
 *
 * 4. notFound() en cas de slug invalide (pas de 500 exposant une stack trace)
 *
 * IMPACT SEO : aucun — les metadata restent identiques pour les slugs valides.
 */

import { notFound } from 'next/navigation';
import ToolDetail from '@/components/ToolDetail';
import { SITE_NAME } from '@/lib/site';
import { getToolBySlug, getToolsByType, getToolRoute } from '@/lib/tools';
import { validateSlug, sanitizeText, sanitizeExternalUrl } from '@/lib/validation';

// Toutes les fiches sont prérendues au build (SSG). dynamicParams reste true
// pour servir d'éventuels nouveaux slugs ajoutés au dataset sans rebuild.
export const dynamicParams = true;

export function generateStaticParams() {
  // Prérendu COMPLET de toutes les fiches API IA.
  // (L'ancien slice(0, 10) limitait le build à 10 pages → cause racine du
  //  faible taux d'indexation : les 1390 autres n'existaient pas pour Google.)
  return getToolsByType('api').map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  // Validation stricte avant tout usage du slug
  const validation = validateSlug(slug);
  if (!validation.valid) return {};

  const tool = getToolBySlug(slug);
  if (!tool || tool.type !== 'api') return {};

  // Sanitisation des champs exposés dans les metadata
  const title = sanitizeText(
    tool.metaTitle || `${tool.name} : avis, prix, fonctionnalités et alternatives`,
    120
  );
  const description = sanitizeText(
    tool.metaDescription || tool.descriptionShort,
    200
  );
  const ogTitle = sanitizeText(tool.metaTitle || tool.name, 100);
  const logoUrl = sanitizeExternalUrl(tool.logo || '/logos/default.svg');

  return {
    title,
    description,
    alternates: { canonical: getToolRoute(tool) },
    openGraph: {
      title: ogTitle,
      description,
      type: 'article',
      siteName: SITE_NAME,
      images: [logoUrl],
    },
  };
}

export default async function ApiDetailPage({ params }) {
  const { slug } = await params;

  // Validation — notFound() renvoie une 404 propre, pas une 500
  const validation = validateSlug(slug);
  if (!validation.valid) notFound();

  const tool = getToolBySlug(slug);
  if (!tool || tool.type !== 'api') notFound();

  return <ToolDetail tool={tool} />;
}
