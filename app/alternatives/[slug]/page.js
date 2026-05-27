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
import JsonLd from '@/components/JsonLd';
import ToolCard from '@/components/ToolCard';
import { breadcrumbListSchema } from '@/lib/schema';
import { getAllTools, getAlternativeTools, getToolBySlug, getToolRoute } from '@/lib/tools';
import { validateSlug, sanitizeText } from '@/lib/validation';

export const dynamicParams = true;

export function generateStaticParams() {
  const limit =
    process.env.PREBUILD_ALL === 'true'
      ? Infinity
      : Number(process.env.PREBUILD_ALTERNATIVES_LIMIT || 10);
  return getAllTools().slice(0, limit).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!validateSlug(slug).valid) return {};

  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const toolName = sanitizeText(tool.name, 80);

  return {
    title: sanitizeText(
      `Alternatives à ${toolName} : comparatif des meilleurs concurrents`,
      120
    ),
    description: sanitizeText(
      `Découvrez les meilleures alternatives à ${toolName}, avec prix, fonctionnalités, cas d'usage, avantages, limites et comparatifs.`,
      200
    ),
    alternates: { canonical: `/alternatives/${tool.slug}` },
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

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Alternatives automatiques</p>
        <h1>Meilleures alternatives à {tool.name}</h1>
        <p className="lead">
          Comparez {tool.name} avec des solutions proches selon la catégorie, le type,
          la note, les cas d&apos;usage et les fonctionnalités.
        </p>

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
      </div>
    </>
  );
}
