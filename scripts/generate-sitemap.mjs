/**
 * scripts/generate-sitemap.mjs — Générateur de sitemaps SCALABLE
 *
 * CORRECTIONS vs version précédente :
 *  - Lit data/tools.json DIRECTEMENT (plus d'import via l'alias @/ qui échouait
 *    silencieusement et produisait un sitemap à 1 URL).
 *  - Génère TOUTES les URLs (fiches, alternatives, comparatifs, catégories,
 *    cas d'usage) au lieu d'un sous-ensemble.
 *  - Découpe en sitemaps thématiques (≤ 45 000 URLs / fichier, sous la limite
 *    officielle de 50 000) + un sitemap index racine.
 *  - Ordre canonique des paires de comparatif (tri alpha) → zéro duplication.
 *  - lastmod basé sur lastVerified réel quand disponible.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://comparateur-api-ia.vercel.app').replace(/\/$/, '');
const MAX_PER_FILE = 45000;

const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tools.json'), 'utf8'));

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toolLastmod(tool) {
  if (tool.lastVerified) {
    const d = new Date(tool.lastVerified);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

const bySlug = new Map(tools.map((t) => [t.slug, t]));

const staticUrls = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/api-ia', changefreq: 'daily', priority: '0.9' },
  { loc: '/categories', changefreq: 'weekly', priority: '0.8' },
  { loc: '/cas-usage', changefreq: 'weekly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.3' },
  { loc: '/mentions-legales', changefreq: 'yearly', priority: '0.2' },
  { loc: '/politique-confidentialite', changefreq: 'yearly', priority: '0.2' },
];

const providerUrls = tools.map((t) => ({
  loc: `/api-ia/${t.slug}`,
  changefreq: 'weekly',
  priority: '0.8',
  lastmod: toolLastmod(t),
}));

const alternativeUrls = tools.map((t) => ({
  loc: `/alternatives/${t.slug}`,
  changefreq: 'monthly',
  priority: '0.6',
  lastmod: toolLastmod(t),
}));

const comparisonSet = new Set();
for (const t of tools) {
  for (const altSlug of t.alternatives || []) {
    if (!bySlug.has(altSlug) || altSlug === t.slug) continue;
    const [a, b] = [t.slug, altSlug].sort();
    comparisonSet.add(`${a}-vs-${b}`);
  }
}
const comparisonUrls = Array.from(comparisonSet).map((pair) => ({
  loc: `/comparatif/${pair}`,
  changefreq: 'monthly',
  priority: '0.7',
}));

const categorySlugs = new Set(tools.map((t) => slugify(t.category)));
const categoryUrls = Array.from(categorySlugs).map((slug) => ({
  loc: `/categories/${slug}`,
  changefreq: 'weekly',
  priority: '0.7',
}));

const useCaseSlugs = new Set();
for (const t of tools) for (const u of t.useCases || []) useCaseSlugs.add(slugify(u));
const useCaseUrls = Array.from(useCaseSlugs).map((slug) => ({
  loc: `/cas-usage/${slug}`,
  changefreq: 'monthly',
  priority: '0.6',
}));

function urlXml(u) {
  const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
  return `  <url>
    <loc>${BASE_URL}${u.loc}</loc>${lastmod}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
}

function writeUrlset(filename, urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(urlXml).join('\n')}
</urlset>
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf8');
}

function writeChunked(baseName, urls) {
  if (urls.length <= MAX_PER_FILE) {
    writeUrlset(`${baseName}.xml`, urls);
    return [`${baseName}.xml`];
  }
  const files = [];
  for (let i = 0; i < urls.length; i += MAX_PER_FILE) {
    const idx = Math.floor(i / MAX_PER_FILE) + 1;
    const name = `${baseName}-${idx}.xml`;
    writeUrlset(name, urls.slice(i, i + MAX_PER_FILE));
    files.push(name);
  }
  return files;
}

const sitemapFiles = [];
sitemapFiles.push(...writeChunked('sitemap-static', staticUrls));
sitemapFiles.push(...writeChunked('sitemap-categories', categoryUrls));
sitemapFiles.push(...writeChunked('sitemap-providers', providerUrls));
sitemapFiles.push(...writeChunked('sitemap-alternatives', alternativeUrls));
sitemapFiles.push(...writeChunked('sitemap-comparisons', comparisonUrls));
sitemapFiles.push(...writeChunked('sitemap-usecases', useCaseUrls));

const now = new Date().toISOString();
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles
  .map(
    (f) => `  <sitemap>
    <loc>${BASE_URL}/${f}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), indexXml, 'utf8');

const total =
  staticUrls.length +
  providerUrls.length +
  alternativeUrls.length +
  comparisonUrls.length +
  categoryUrls.length +
  useCaseUrls.length;

console.log('✓ Sitemaps générés :');
console.log(`  static       : ${staticUrls.length}`);
console.log(`  categories   : ${categoryUrls.length}`);
console.log(`  providers    : ${providerUrls.length}`);
console.log(`  alternatives : ${alternativeUrls.length}`);
console.log(`  comparisons  : ${comparisonUrls.length}`);
console.log(`  usecases     : ${useCaseUrls.length}`);
console.log(`  ───────────────────────`);
console.log(`  TOTAL URLs   : ${total}`);
console.log(`  Fichiers     : sitemap.xml (index) + ${sitemapFiles.length} sous-sitemaps`);
