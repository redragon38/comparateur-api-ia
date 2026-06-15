/**
 * app/categories/[slug]/page.js — Page de catégorie
 *
 * CORRECTIONS DE SÉCURITÉ :
 *  - validateSlug() sur params.slug avant toute utilisation
 *  - sanitizeText() sur les champs metadata
 *  - notFound() pour les slugs invalides (pas de 500)
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ToolBrowser from '@/components/ToolBrowser';
import { breadcrumbListSchema } from '@/lib/schema';
import { getCategories, getCategoryBySlug, getPublicTools, getToolsByCategorySlug } from '@/lib/tools';
import { validateSlug, sanitizeText } from '@/lib/validation';

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;

  if (!validateSlug(slug).valid) return {};

  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const categoryName = sanitizeText(category.name, 100);

  return {
    title: sanitizeText(`${categoryName} : meilleures API IA`, 120),
    description: sanitizeText(
      `Comparez les meilleures API IA de la catégorie ${categoryName} : prix, fonctionnalités, documentation officielle, alternatives et comparatifs.`,
      200
    ),
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  if (!validateSlug(slug).valid) notFound();

  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getPublicTools(getToolsByCategorySlug(slug));
  const rawTools = getToolsByCategorySlug(slug);
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Catégories', url: '/categories' },
    { name: category.name, url: `/categories/${category.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Catégorie API IA</p>
        <h1>{category.name}</h1>
        <p className="lead">
          {category.count.toLocaleString('fr-FR')} API IA disponibles dans cette catégorie.
        </p>
        <ToolBrowser tools={tools} title={`API IA : ${category.name}`} />

        {/* Index HTML complet rendu côté serveur — voir /api-ia pour la raison. */}
        <nav className="sitemap-links section-block" aria-label={`Toutes les API IA : ${category.name}`}>
          <h2>Toutes les API IA : {category.name}</h2>
          <ul className="link-columns">
            {rawTools.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/api-ia/${tool.slug}`}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
