/**
 * app/alternatives/[slug]/page.js — Page d'alternatives à un outil
 *
 * CORRECTIONS DE SÉCURITÉ :
 *  - validateSlug() sur params.slug
 *  - sanitizeText() sur les champs metadata
 *  - notFound() pour les slugs invalides
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import ToolCard from '@/components/ToolCard';
import { breadcrumbListSchema, faqPageSchema } from '@/lib/schema';
import { getAlternativesContent } from '@/lib/content';
import { getAllTools, getAlternativeTools, getToolBySlug, getToolRoute } from '@/lib/tools';
import { validateSlug, sanitizeText } from '@/lib/validation';

export const dynamicParams = true;
// Revalidation ISR : pages servies en cache, rafraîchies périodiquement.
export const revalidate = 86400;

export function generateStaticParams() {
  // Par défaut : pré-génère toutes les pages alternatives au build.
  // Surchargeable via PREBUILD_ALTERNATIVES_LIMIT pour borner le temps de build.
  const limit = process.env.PREBUILD_ALTERNATIVES_LIMIT
    ? Number(process.env.PREBUILD_ALTERNATIVES_LIMIT)
    : Infinity;
  return getAllTools().slice(0, limit).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!validateSlug(slug).valid) return {};

  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const toolName = sanitizeText(tool.name, 80);
  const title = sanitizeText(
    `Alternatives à ${toolName} : comparatif des meilleurs concurrents`,
    120
  );
  const description = sanitizeText(
    `Découvrez les meilleures alternatives à ${toolName}, avec prix, fonctionnalités, cas d'usage, avantages, limites et comparatifs.`,
    200
  );

  return {
    title,
    description,
    keywords: [
      `alternative ${toolName}`,
      `alternatives ${toolName}`,
      `${toolName} concurrent`,
      `${toolName} équivalent`,
      `meilleure alternative ${toolName}`,
      'API IA',
    ],
    alternates: { canonical: `/alternatives/${tool.slug}` },
    openGraph: { title, description, type: 'article', url: `/alternatives/${tool.slug}` },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function AlternativesPage({ params }) {
  const { slug } = await params;

  if (!validateSlug(slug).valid) notFound();

  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const alternatives = getAlternativeTools(tool, 24);
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: tool.name, url: getToolRoute(tool) },
    { name: `Alternatives à ${tool.name}`, url: `/alternatives/${tool.slug}` },
  ];

  const content = getAlternativesContent(tool, alternatives);

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <JsonLd data={faqPageSchema(content.faq)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Alternatives automatiques</p>
        <h1>Meilleures alternatives à {tool.name}</h1>
        <p className="lead">{content.intro}</p>

        <section className="section-block">
          <h2>Critères pour bien choisir une alternative à {tool.name}</h2>
          <ul className="check-list dense-list">
            {content.criteria.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>

        <div className="tool-grid">
          {alternatives.map((alternative) => (
            <ToolCard key={alternative.slug} tool={alternative} />
          ))}
        </div>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Comparatifs directs</p>
            <h2>{tool.name} vs alternatives</h2>
          </div>
          <div className="link-grid">
            {alternatives.slice(0, 12).map((alternative) => (
              <Link
                key={alternative.slug}
                href={`/comparatif/${tool.slug}-vs-${alternative.slug}`}
                className="comparison-link"
              >
                {tool.name} vs {alternative.name}
              </Link>
            ))}
          </div>
        </section>

        <Faq faq={content.faq} />
      </div>
    </>
  );
}
