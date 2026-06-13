import Link from 'next/link';
import ToolBrowser from '@/components/ToolBrowser';
import SeoLinkIndex from '@/components/SeoLinkIndex';
import JsonLd from '@/components/JsonLd';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { getCategories, getPublicTools, getToolsByType } from '@/lib/tools';

export const metadata = {
  title: 'API IA : comparatif de 1 400 API, prix, documentation et alternatives',
  description:
    'Comparez 1 400 API IA réelles pour texte, image, voix, embeddings, agents, OCR, vision, recherche vectorielle et automatisation. Prix, notes, documentation officielle et alternatives.',
  keywords: [
    'comparatif API IA',
    'liste API IA',
    'meilleures API IA',
    'API LLM',
    'API vision',
    'API OCR',
    'API embeddings',
    'API génération image',
  ],
  alternates: { canonical: '/api-ia' },
  openGraph: {
    title: 'API IA : comparatif de 1 400 API réelles',
    description:
      'Comparez 1 400 API IA réelles : texte, image, voix, embeddings, agents, OCR, vision. Prix, notes et alternatives.',
    url: `${SITE_URL}/api-ia`,
    type: 'website',
  },
};

export default function ApiPage() {
  const tools = getPublicTools(getToolsByType('api'));
  const categories = getCategories();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Catalogue des API IA',
    description: metadata.description,
    url: `${SITE_URL}/api-ia`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tools.length,
      itemListElement: tools.slice(0, 100).map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/api-ia/${tool.slug}`,
        name: tool.name,
      })),
    },
  };

  return (
    <div className="container page-shell">
      <JsonLd data={collectionSchema} />
      <p className="eyebrow">Catalogue API IA</p>
      <h1>API IA : comparez {tools.length.toLocaleString('fr-FR')} API réelles</h1>
      <p className="lead">
        Trouvez une API IA réelle et sourcée pour vos projets : LLM, génération, analyse,
        vision, speech, embeddings, RAG, agents et automatisation. Chaque fiche détaille prix,
        fonctionnalités, cas d&apos;usage, avantages, limites et alternatives.
      </p>

      <nav className="category-pills" aria-label="Catégories d'API IA">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="category-pill">
            {category.name} <span>{category.count}</span>
          </Link>
        ))}
      </nav>

      <ToolBrowser tools={tools} title="Liste des API IA" />

      <SeoLinkIndex
        tools={tools}
        title="Index complet des 1 400 API IA"
        description="Accédez directement à n'importe quelle fiche API IA et à ses alternatives, classées par catégorie."
      />
    </div>
  );
}
