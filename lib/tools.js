import toolsData from '@/data/tools.json';
import { slugify, getToolRoute } from '@/lib/format';

export { slugify, getToolRoute };

/**
 * lib/tools.js — Couche données avec INDEX MÉMOIRE.
 *
 * PROBLÈME CORRIGÉ (timeout de build > 60 s) :
 *  Les anciennes fonctions getCategories / getUseCases / getCategoryBySlug /
 *  getUseCaseBySlug reconstruisaient leur résultat à CHAQUE appel, en
 *  re-slugifiant les 1400 outils. Or `slugify` fait .normalize('NFD') + 5
 *  regex → coûteux. Sur 79 pages cas-usage, cela représentait ~1,3 MILLION
 *  d'appels slugify. De même getAlternativeTools / getRelatedTools
 *  re-filtraient + re-triaient les 1400 outils pour chacune des ~2800 fiches.
 *
 *  SOLUTION : tous les regroupements sont calculés UNE SEULE FOIS, en lazy
 *  (au premier accès), puis mis en cache au niveau module. Les recherches
 *  par slug deviennent O(1) via Map.
 */

// ─── Index de base : slug → tool (O(1)) ──────────────────────────────────────
const toolsBySlug = new Map(toolsData.map((tool) => [tool.slug, tool]));

// ─── Mémoïsation paresseuse ──────────────────────────────────────────────────
// Chaque index n'est construit qu'au premier appel, puis réutilisé.
let _categories = null;
let _categoryBySlug = null;
let _toolsByCategorySlug = null;
let _useCases = null;
let _useCaseBySlug = null;
let _toolsByUseCaseSlug = null;
let _toolSlugToCategorySlug = null; // cache slugify(category) par outil
let _topToolsSorted = null;

// Pré-calcule, pour chaque outil, le slug de sa catégorie (évite de re-slugifier).
function getToolCategorySlugMap() {
  if (_toolSlugToCategorySlug) return _toolSlugToCategorySlug;
  _toolSlugToCategorySlug = new Map();
  for (const tool of toolsData) {
    _toolSlugToCategorySlug.set(tool.slug, slugify(tool.category));
  }
  return _toolSlugToCategorySlug;
}

// ─── Accès simples ───────────────────────────────────────────────────────────
export function getAllTools() {
  return toolsData;
}

export function getPublicTool(tool) {
  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    type: 'api',
    category: tool.category,
    subCategory: tool.subCategory,
    descriptionShort: tool.descriptionShort,
    pricing: tool.pricing,
    rating: tool.rating,
    logo: tool.logo,
    verified: tool.verified,
    verificationStatus: tool.verificationStatus,
    sourceUrl: tool.sourceUrl,
    docsUrl: tool.docsUrl,
    dataSourceType: tool.dataSourceType,
    lastVerified: tool.lastVerified,
    features: tool.features,
    useCases: tool.useCases
  };
}

export function getPublicTools(tools = toolsData) {
  return tools.map(getPublicTool);
}

export function getToolBySlug(slug) {
  return toolsBySlug.get(slug);
}

export function getToolsByType(type) {
  return type === 'api' ? toolsData : [];
}

// ─── Catégories (index calculé une fois) ─────────────────────────────────────
function buildCategoryIndexes() {
  if (_categories) return;

  const catSlugOf = getToolCategorySlugMap();
  const map = new Map();
  const toolsBy = new Map();

  for (const tool of toolsData) {
    const slug = catSlugOf.get(tool.slug);

    const existing = map.get(slug) || {
      name: tool.category,
      slug,
      count: 0,
      apiCount: 0,
      subCategories: new Set()
    };
    existing.count += 1;
    existing.apiCount += 1;
    if (tool.subCategory) existing.subCategories.add(tool.subCategory);
    map.set(slug, existing);

    if (!toolsBy.has(slug)) toolsBy.set(slug, []);
    toolsBy.get(slug).push(tool);
  }

  _categories = Array.from(map.values())
    .map((category) => ({
      ...category,
      subCategories: Array.from(category.subCategories).sort()
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'));

  _categoryBySlug = new Map(_categories.map((c) => [c.slug, c]));
  _toolsByCategorySlug = toolsBy;
}

export function getCategories() {
  buildCategoryIndexes();
  return _categories;
}

export function getCategoryBySlug(slug) {
  buildCategoryIndexes();
  return _categoryBySlug.get(slug); // O(1) au lieu de rebuild + find
}

export function getToolsByCategorySlug(slug) {
  buildCategoryIndexes();
  return _toolsByCategorySlug.get(slug) || []; // O(1) au lieu de re-filter + re-slugify
}

// ─── Alternatives / outils liés (O(1) grâce à l'index trié) ───────────────────
// Tri "fallback" pré-calculé une seule fois par catégorie pour ne pas re-trier
// 1400 outils à chaque fiche.
let _fallbackByCategory = null;
function getFallbackSortedAll() {
  if (_topToolsSorted) return _topToolsSorted;
  _topToolsSorted = [...toolsData].sort((a, b) => b.rating - a.rating);
  return _topToolsSorted;
}

export function getAlternativeTools(tool, limit = 12) {
  if (!tool) return [];

  const explicit = (tool.alternatives || [])
    .map((slug) => toolsBySlug.get(slug))
    .filter(Boolean)
    .filter((candidate) => candidate.slug !== tool.slug);

  const unique = new Map();
  for (const candidate of explicit) {
    if (!unique.has(candidate.slug)) unique.set(candidate.slug, candidate);
    if (unique.size >= limit) break;
  }

  // Complément : outils de la même catégorie (déjà groupés), puis top global.
  if (unique.size < limit) {
    const catSlug = getToolCategorySlugMap().get(tool.slug);
    const sameCategory = getToolsByCategorySlug(catSlug);
    for (const candidate of sameCategory) {
      if (candidate.slug === tool.slug) continue;
      if (!unique.has(candidate.slug)) unique.set(candidate.slug, candidate);
      if (unique.size >= limit) break;
    }
  }
  if (unique.size < limit) {
    for (const candidate of getFallbackSortedAll()) {
      if (candidate.slug === tool.slug) continue;
      if (!unique.has(candidate.slug)) unique.set(candidate.slug, candidate);
      if (unique.size >= limit) break;
    }
  }

  return Array.from(unique.values()).slice(0, limit);
}

// Index inversé useCase (valeur brute) → liste d'outils, calculé une fois.
let _toolsByRawUseCase = null;
function getToolsByRawUseCase() {
  if (_toolsByRawUseCase) return _toolsByRawUseCase;
  _toolsByRawUseCase = new Map();
  for (const tool of toolsData) {
    for (const u of tool.useCases || []) {
      if (!_toolsByRawUseCase.has(u)) _toolsByRawUseCase.set(u, []);
      _toolsByRawUseCase.get(u).push(tool);
    }
  }
  return _toolsByRawUseCase;
}

export function getRelatedTools(tool, limit = 8) {
  if (!tool) return [];

  const useCases = new Set(tool.useCases || []);
  const ucIndex = getToolsByRawUseCase();
  const catSlugOf = getToolCategorySlugMap();
  const toolCatSlug = catSlugOf.get(tool.slug);

  // Ensemble RESTREINT de candidats : uniquement les outils qui partagent
  // au moins une catégorie OU un useCase avec `tool`. On ne scanne donc plus
  // les 1400 outils, mais seulement ceux réellement reliés (via index O(1)).
  const candidateMap = new Map();
  // même catégorie
  for (const c of getToolsByCategorySlug(toolCatSlug)) {
    if (c.slug !== tool.slug) candidateMap.set(c.slug, c);
  }
  // partage d'un useCase (couvre le cross-catégorie, comme l'ancienne version)
  for (const u of tool.useCases || []) {
    for (const c of ucIndex.get(u) || []) {
      if (c.slug !== tool.slug) candidateMap.set(c.slug, c);
    }
  }

  const scored = [];
  for (const candidate of candidateMap.values()) {
    const score =
      (candidate.category === tool.category ? 4 : 0) +
      (candidate.subCategory === tool.subCategory ? 2 : 0) +
      (candidate.useCases || []).filter((u) => useCases.has(u)).length;
    if (score > 0) scored.push({ candidate, score });
  }

  scored.sort((a, b) => b.score - a.score || b.candidate.rating - a.candidate.rating);
  return scored.slice(0, limit).map(({ candidate }) => candidate);
}

// ─── Comparatifs ─────────────────────────────────────────────────────────────
export function parseComparisonSlug(comparison = '') {
  const [toolA, toolB] = comparison.split('-vs-');
  return { toolA, toolB };
}

export function getComparisonPairs(limit = null) {
  const pairs = [];
  const seen = new Set();

  for (const tool of toolsData) {
    for (const alternativeSlug of tool.alternatives || []) {
      const alternative = toolsBySlug.get(alternativeSlug);
      if (!alternative || alternative.slug === tool.slug) continue;
      const [a, b] = [tool.slug, alternative.slug].sort();
      const key = `${a}-vs-${b}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ comparison: key });
      if (limit && pairs.length >= limit) return pairs;
    }
  }

  return pairs;
}

export function canonicalComparisonSlug(slugA, slugB) {
  const [a, b] = [slugA, slugB].sort();
  return `${a}-vs-${b}`;
}

export function getTopTools(limit = 12) {
  // Réutilise le tri global mémoïsé, puis applique le critère "vérifié d'abord".
  if (!_topToolsSorted) getFallbackSortedAll();
  return [..._topToolsSorted]
    .sort((a, b) => (b.verified === true) - (a.verified === true))
    .slice(0, limit);
}

// ─── Cas d'usage (index calculé une fois) ────────────────────────────────────
function buildUseCaseIndexes() {
  if (_useCases) return;

  const map = new Map();
  const toolsBy = new Map();

  for (const tool of toolsData) {
    // déduplique les slugs d'usecase au sein d'un même outil
    const seenForTool = new Set();
    for (const useCase of tool.useCases || []) {
      const slug = slugify(useCase);
      if (seenForTool.has(slug)) continue;
      seenForTool.add(slug);

      const existing = map.get(slug) || { name: useCase, slug, count: 0 };
      existing.count += 1;
      map.set(slug, existing);

      if (!toolsBy.has(slug)) toolsBy.set(slug, []);
      toolsBy.get(slug).push(tool);
    }
  }

  _useCases = Array.from(map.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr')
  );
  _useCaseBySlug = new Map(_useCases.map((u) => [u.slug, u]));

  // pré-trie les outils de chaque usecase par note
  for (const [slug, list] of toolsBy) {
    list.sort((a, b) => b.rating - a.rating);
  }
  _toolsByUseCaseSlug = toolsBy;
}

export function getUseCases() {
  buildUseCaseIndexes();
  return _useCases;
}

export function getUseCaseBySlug(slug) {
  buildUseCaseIndexes();
  return _useCaseBySlug.get(slug); // O(1) au lieu de rebuild + find
}

export function getToolsByUseCaseSlug(slug) {
  buildUseCaseIndexes();
  return _toolsByUseCaseSlug.get(slug) || []; // O(1), déjà trié
}
