import { SITE_URL } from '@/lib/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/private/'],
    },
    // sitemap.xml est désormais un INDEX pointant vers les sitemaps thématiques
    // (providers, alternatives, comparisons, categories, usecases…).
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
