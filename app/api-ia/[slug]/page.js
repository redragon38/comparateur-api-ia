import { notFound } from 'next/navigation';
import ToolDetail from '@/components/ToolDetail';
import { SITE_NAME } from '@/lib/site';
import { getToolBySlug, getToolsByType, getToolRoute } from '@/lib/tools';

export const dynamicParams = true;

export function generateStaticParams() {
  const limit = process.env.PREBUILD_ALL === 'true' ? Infinity : Number(process.env.PREBUILD_API_LIMIT || 10);
  return getToolsByType('api').slice(0, limit).map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || tool.type !== 'api') return {};

  return {
    title: tool.metaTitle || `${tool.name} : avis, prix, fonctionnalités et alternatives`,
    description: tool.metaDescription || tool.descriptionShort,
    alternates: { canonical: getToolRoute(tool) },
    openGraph: {
      title: tool.metaTitle || tool.name,
      description: tool.metaDescription || tool.descriptionShort,
      type: 'article',
      siteName: SITE_NAME,
      images: [tool.logo || '/logos/default.svg']
    }
  };
}

export default async function ApiDetailPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool || tool.type !== 'api') notFound();

  return <ToolDetail tool={tool} />;
}
