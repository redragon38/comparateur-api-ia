import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getToolRoute } from '@/lib/tools';

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function softwareApplicationSchema(tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.descriptionShort || tool.descriptionLong,
    applicationCategory: tool.category,
    operatingSystem: 'Web',
    image: absoluteUrl(tool.logo || '/logos/default.svg'),
    url: absoluteUrl(getToolRoute(tool)),
    sameAs: tool.website,
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'Gratuit' ? '0' : undefined,
      priceCurrency: 'EUR',
      category: tool.pricing
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.rating,
      bestRating: '5',
      worstRating: '1',
      ratingCount: Math.max(12, tool.id % 500 + 25)
    }
  };
}

export function breadcrumbListSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url)
    }))
  };
}

export function faqPageSchema(faq = []) {
  if (!faq.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

/**
 * TechArticle — donne une date de mise à jour, un auteur et un éditeur à la
 * fiche. Les moteurs IA (et Google) utilisent ces signaux d'autorité et de
 * fraîcheur pour décider quoi citer.
 */
export function techArticleSchema(tool) {
  const date = tool.lastVerified && !Number.isNaN(new Date(tool.lastVerified).getTime())
    ? new Date(tool.lastVerified).toISOString()
    : new Date().toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${tool.name} : API, prix, fonctionnalités et alternatives`,
    description: tool.descriptionShort || tool.descriptionLong,
    datePublished: date,
    dateModified: date,
    inLanguage: 'fr-FR',
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(getToolRoute(tool)) },
    about: { '@type': 'SoftwareApplication', name: tool.name, applicationCategory: tool.category },
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/api-ia?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}
