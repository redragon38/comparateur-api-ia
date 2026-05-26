import toolsData from '@/data/tools.json';
import { slugify, getToolRoute } from '@/lib/format';

export { slugify, getToolRoute };

const toolsBySlug = new Map(toolsData.map((tool) => [tool.slug, tool]));

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

export function getCategories() {
  const map = new Map();

  for (const tool of toolsData) {
    const slug = slugify(tool.category);
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
  }

  return Array.from(map.values())
    .map((category) => ({
      ...category,
      subCategories: Array.from(category.subCategories).sort()
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'));
}

export function getCategoryBySlug(slug) {
  return getCategories().find((category) => category.slug === slug);
}

export function getToolsByCategorySlug(slug) {
  const category = getCategoryBySlug(slug);
  if (!category) return [];
  return toolsData.filter((tool) => slugify(tool.category) === slug);
}

export function getAlternativeTools(tool, limit = 12) {
  if (!tool) return [];

  const explicit = (tool.alternatives || [])
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean)
    .filter((candidate) => candidate.slug !== tool.slug);

  const fallback = toolsData
    .filter((candidate) => candidate.slug !== tool.slug)
    .sort((a, b) => {
      const sameCategoryA = a.category === tool.category ? 1 : 0;
      const sameCategoryB = b.category === tool.category ? 1 : 0;
      return sameCategoryB - sameCategoryA || b.rating - a.rating;
    });

  const unique = new Map();
  for (const candidate of [...explicit, ...fallback]) {
    if (!unique.has(candidate.slug)) unique.set(candidate.slug, candidate);
    if (unique.size >= limit) break;
  }

  return Array.from(unique.values());
}

export function getRelatedTools(tool, limit = 8) {
  if (!tool) return [];

  const useCases = new Set(tool.useCases || []);
  return toolsData
    .filter((candidate) => candidate.slug !== tool.slug)
    .map((candidate) => {
      const score =
        (candidate.category === tool.category ? 4 : 0) +
        (candidate.subCategory === tool.subCategory ? 2 : 0) +
        (candidate.useCases || []).filter((useCase) => useCases.has(useCase)).length;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.candidate.rating - a.candidate.rating)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export function parseComparisonSlug(comparison = '') {
  const [toolA, toolB] = comparison.split('-vs-');
  return { toolA, toolB };
}

export function getComparisonPairs(limit = null) {
  const pairs = [];
  const seen = new Set();

  for (const tool of toolsData) {
    for (const alternativeSlug of tool.alternatives || []) {
      const alternative = getToolBySlug(alternativeSlug);
      if (!alternative) continue;
      const key = [tool.slug, alternative.slug].sort().join('__');
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ comparison: `${tool.slug}-vs-${alternative.slug}` });
      if (limit && pairs.length >= limit) return pairs;
    }
  }

  return pairs;
}

export function getTopTools(limit = 12) {
  return [...toolsData]
    .sort((a, b) => (b.verified === true) - (a.verified === true) || b.rating - a.rating)
    .slice(0, limit);
}
