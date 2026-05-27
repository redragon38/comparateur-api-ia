import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://comparateur-api-ia.vercel.app';

const staticPages = [
  '/',
  '/api-ia',
  '/categories',
  '/contact',
  '/mentions-legales',
  '/politique-confidentialite',
];

const urls = new Set(staticPages);

function add(url) {
  if (!url.startsWith('/')) url = '/' + url;
  urls.add(url);
}

try {
  const toolsModule = await import('../lib/tools.js');

  if (toolsModule.getAllTools) {
    const tools = toolsModule.getAllTools();

    for (const tool of tools) {
      if (tool.slug) {
        add(`/api-ia/${tool.slug}`);
        add(`/alternatives/${tool.slug}`);
      }
    }
  }

  if (toolsModule.getCategories) {
    const categories = toolsModule.getCategories();

    for (const category of categories) {
      if (category.slug) {
        add(`/categories/${category.slug}`);
      }
    }
  }

  if (toolsModule.getComparisonPairs) {
    const comparisons = toolsModule.getComparisonPairs(null);

    for (const comparison of comparisons) {
      if (comparison.comparison) {
        add(`/comparatif/${comparison.comparison}`);
      }
    }
  }
} catch (e) {
  console.log('Auto sitemap fallback:', e.message);
}

const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(urls).map((url) => `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(
  path.join(process.cwd(), 'public', 'sitemap.xml'),
  xml,
  'utf8'
);

console.log(`Generated sitemap with ${urls.size} URLs`);
