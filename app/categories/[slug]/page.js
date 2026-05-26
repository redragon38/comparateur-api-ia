import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ToolBrowser from '@/components/ToolBrowser';
import { breadcrumbListSchema } from '@/lib/schema';
import { getCategories, getCategoryBySlug, getPublicTools, getToolsByCategorySlug } from '@/lib/tools';

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: `${category.name} : meilleures API IA`,
    description: `Comparez les meilleures API IA de la catégorie ${category.name} : prix, fonctionnalités, documentation officielle, alternatives et comparatifs.`,
    alternates: { canonical: `/categories/${category.slug}` }
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getPublicTools(getToolsByCategorySlug(slug));
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Catégories', url: '/categories' },
    { name: category.name, url: `/categories/${category.slug}` }
  ];

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Catégorie API IA</p>
        <h1>{category.name}</h1>
        <p className="lead">{category.count.toLocaleString('fr-FR')} API IA disponibles dans cette catégorie.</p>
        <ToolBrowser tools={tools} title={`API IA : ${category.name}`} />
      </div>
    </>
  );
}
