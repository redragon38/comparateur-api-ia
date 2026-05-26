import { SITE_URL } from '@/lib/site';
import { getAllTools, getCategories, getComparisonPairs, getToolRoute } from '@/lib/tools';

export default function sitemap() {
  const now = new Date();
  const staticRoutes = [
    '/',
    '/api-ia',
    '/categories',
    '/contact',
    '/mentions-legales',
    '/politique-confidentialite'
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.8
  }));

  const apiUrls = getAllTools().flatMap((tool) => [
    {
      url: `${SITE_URL}${getToolRoute(tool)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75
    },
    {
      url: `${SITE_URL}/alternatives/${tool.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.65
    }
  ]);

  const categoryUrls = getCategories().map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7
  }));

  const comparisonUrls = getComparisonPairs().map(({ comparison }) => ({
    url: `${SITE_URL}/comparatif/${comparison}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.55
  }));

  return [...staticUrls, ...categoryUrls, ...apiUrls, ...comparisonUrls];
}
