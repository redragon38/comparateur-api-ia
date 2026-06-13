/**
 * scripts/indexnow.mjs — Soumission IndexNow (Bing, Yandex, Seznam…).
 *
 * IndexNow permet de notifier instantanément les moteurs qu'une URL est
 * nouvelle ou mise à jour, au lieu d'attendre le prochain crawl. C'est gratuit
 * et accélère fortement l'indexation (Bing/Yandex en minutes/heures).
 *
 * USAGE :
 *   node scripts/indexnow.mjs                 # soumet TOUTES les URLs du site
 *   node scripts/indexnow.mjs /api-ia/openai-api /categories/...   # URLs ciblées
 *
 * Variables d'environnement (facultatives) :
 *   NEXT_PUBLIC_SITE_URL  → host du site (défaut : domaine Vercel)
 *   INDEXNOW_KEY          → clé IndexNow (défaut : clé hébergée dans /public)
 *
 * NB : volontairement autonome (pas d'alias @/, lecture directe du JSON) pour
 * tourner en Node pur, contrairement à l'ancien generate-sitemap.mjs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://comparateur-api-ia.vercel.app').replace(/\/$/, '');
const HOST = new URL(SITE_URL).host;
const KEY = process.env.INDEXNOW_KEY || '271b3d55cd5de582e7aeb107a86cc616';
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const BATCH_SIZE = 10000; // limite IndexNow par requête

function slugify(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' et ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildAllPaths() {
  const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tools.json'), 'utf8'));
  const bySlug = new Map(tools.map((t) => [t.slug, t]));
  const paths = new Set(['/', '/api-ia', '/categories', '/comparatifs', '/contact']);

  for (const tool of tools) {
    if (!tool.slug) continue;
    paths.add(`/api-ia/${tool.slug}`);
    paths.add(`/alternatives/${tool.slug}`);
    paths.add(`/categories/${slugify(tool.category)}`);
  }

  const seen = new Set();
  for (const tool of tools) {
    for (const altSlug of tool.alternatives || []) {
      if (!bySlug.has(altSlug)) continue;
      const key = [tool.slug, altSlug].sort().join('__');
      if (seen.has(key)) continue;
      seen.add(key);
      paths.add(`/comparatif/${tool.slug}-vs-${altSlug}`);
    }
  }

  return Array.from(paths);
}

async function submitBatch(urlList) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  });
  return res.status;
}

async function main() {
  const args = process.argv.slice(2);
  const paths = args.length ? args : buildAllPaths();
  const urls = paths.map((p) => (p.startsWith('http') ? p : `${SITE_URL}${p.startsWith('/') ? p : `/${p}`}`));

  console.log(`IndexNow → ${HOST} : ${urls.length} URL(s), clé ${KEY_LOCATION}`);

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    try {
      const status = await submitBatch(batch);
      // 200 = accepté, 202 = reçu (validation différée). 4xx = problème de clé.
      console.log(`  Lot ${i / BATCH_SIZE + 1} (${batch.length} URLs) → HTTP ${status}`);
    } catch (err) {
      console.error(`  Lot ${i / BATCH_SIZE + 1} échec : ${err.message}`);
    }
  }

  console.log('Terminé. (Bing/Yandex traitent la soumission de leur côté.)');
}

main();
