/**
 * scripts/generate-logos.mjs — Génère un logo SVG par outil.
 *
 * POURQUOI : data/tools.json référence /logos/<slug>.svg pour 1 400 outils,
 * mais le dossier public/logos n'existe pas → TOUTES les images étaient cassées
 * (mauvais signal UX/qualité, Core Web Vitals dégradés, OG/Images inexploitables).
 *
 * Ce script crée un avatar SVG déterministe (initiales + dégradé par catégorie)
 * pour chaque outil, plus un default.svg de repli. Léger (~700 o/fichier),
 * sans dépendance réseau ni problème de licence (contrairement au scraping de
 * logos officiels). Exécuté automatiquement avant le build (npm prebuild).
 *
 * Autonome (pas d'alias @/) pour tourner en Node pur.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'logos');

// Palette de dégradés (cohérente avec la charte violet/rose/cyan du site).
const GRADIENTS = [
  ['#7c3aed', '#db2777'], ['#6366f1', '#06b6d4'], ['#db2777', '#f59e0b'],
  ['#0ea5e9', '#7c3aed'], ['#059669', '#06b6d4'], ['#8b5cf6', '#ec4899'],
  ['#f59e0b', '#db2777'], ['#06b6d4', '#3b82f6'], ['#7c3aed', '#2dd4bf'],
  ['#ec4899', '#8b5cf6'], ['#3b82f6', '#6366f1'], ['#10b981', '#0ea5e9'],
  ['#f43f5e', '#7c3aed'], ['#0891b2', '#7c3aed'],
];

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

function fingerprint(value = '') {
  return String(value).split('').reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 1), 0);
}

function initials(name = '') {
  // Retire un éventuel préfixe fournisseur "Provider - Produit".
  const display = name.includes(' - ') ? name.split(' - ').slice(1).join(' ') : name;
  const words = display.replace(/[^a-zA-Z0-9 ]/g, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return 'AI';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function escapeXml(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function svgFor(name, id) {
  const [c1, c2] = GRADIENTS[Math.abs(fingerprint(name) + Number(id || 0)) % GRADIENTS.length];
  const text = escapeXml(initials(name));
  const gid = `g${Math.abs(fingerprint(name)) % 100000}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="${escapeXml(name)}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#${gid})"/>
  <text x="60" y="60" dy="0.35em" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700" fill="#ffffff">${text}</text>
</svg>`;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tools = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'tools.json'), 'utf8'));

  let written = 0;
  for (const tool of tools) {
    const slug = tool.slug || slugify(tool.name);
    if (!slug) continue;
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svgFor(tool.name, tool.id), 'utf8');
    written++;
  }

  // Logo de repli neutre.
  fs.writeFileSync(path.join(OUT_DIR, 'default.svg'), svgFor('AI', 0), 'utf8');

  console.log(`Logos générés : ${written} fichiers + default.svg → public/logos/`);
}

main();
