import {
  getAllTools,
  getCategories,
  getComparisonPairs,
} from '@/lib/tools';

export async function GET() {
  const baseUrl = 'https://comparateur-api-ia.vercel.app';
  const now = new Date().toISOString();

  const staticPages = [
    '',
    '/api-ia',
    '/categories',
    '/contact',
    '/mentions-legales',
    '/politique-confidentialite',
  ];

  const tools = getAllTools();
  const categories = getCategories();
  const comparisons = getComparisonPairs();

  const urls = [];

  staticPages.forEach((path) => {
    urls.push({
      loc: `${baseUrl}${path}`,
      priority: path === '' ? '1.0' : '0.9',
      changefreq: 'daily',
    });
  });

  categories.forEach((category) => {
    urls.push({
      loc: `${baseUrl}/categories/${category.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    });
  });

  tools.forEach((tool) => {
    urls.push({
      loc: `${baseUrl}/api-ia/${tool.slug}`,
      priority: '0.8',
      changefreq: 'weekly',
    });

    urls.push({
      loc: `${baseUrl}/alternatives/${tool.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  });

  comparisons.forEach((pair) => {
    urls.push({
      loc: `${baseUrl}/comparatif/${pair.comparison}`,
      priority: '0.7',
      changefreq: 'weekly',
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
