/**
 * app/categories/[slug]/page.js — Page de catégorie
 *
 * CORRECTIONS DE SÉCURITÉ :
 *  - validateSlug() sur params.slug avant toute utilisation
 *  - sanitizeText() sur les champs metadata
 *  - notFound() pour les slugs invalides (pas de 500)
 */

import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ToolBrowser from '@/components/ToolBrowser';
import SeoLinkIndex from '@/components/SeoLinkIndex';
import { breadcrumbListSchema } from '@/lib/schema';
import { SITE_NAME, SITE_URL } from '@/lib/site';
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
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Catégories', url: '/categories' },
    { name: category.name, url: `/categories/${category.slug}` },
  ];

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} : meilleures API IA`,
    url: `${SITE_URL}/categories/${category.slug}`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tools.length,
      itemListElement: tools.slice(0, 100).map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/api-ia/${tool.slug}`,
        name: tool.name,
      })),
    },
  };

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <JsonLd data={itemListSchema} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Catégorie API IA</p>
        <h1>{category.name} : les meilleures API IA</h1>
        <p className="lead">
          Comparez les {category.count.toLocaleString('fr-FR')} API IA de la catégorie{' '}
          {category.name} : prix, fonctionnalités, cas d&apos;usage, notes, documentation
          officielle et alternatives.
          {category.subCategories.length > 0 && (
            <> Sous-catégories : {category.subCategories.slice(0, 6).join(', ')}.</>
          )}
        </p>
        <ToolBrowser tools={tools} title={`API IA : ${category.name}`} />

        <SeoLinkIndex
          tools={tools}
          title={`Toutes les API IA : ${category.name}`}
          description={`Liste complète des API IA de la catégorie ${category.name}, avec accès direct aux fiches et alternatives.`}
        />
      </div>
    </>
  );
}
