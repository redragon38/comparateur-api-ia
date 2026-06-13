import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ToolCard from '@/components/ToolCard';
import Faq from '@/components/Faq';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site';
import { websiteSchema, faqPageSchema } from '@/lib/schema';
import { getAllTools, getCategories, getComparisonPairs, getToolBySlug, getTopTools } from '@/lib/tools';

export const metadata = {
  title: `${SITE_NAME} — comparez 1 400 API IA réelles`,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: '/' },
};

const HOME_FAQ = [
  {
    question: 'Comment choisir la meilleure API IA pour mon projet ?',
    answer:
      'Identifiez votre cas d’usage (texte, image, voix, OCR, embeddings, agents), puis comparez les API IA selon le prix, les fonctionnalités, la documentation officielle et les notes. Chaque fiche du comparateur synthétise ces critères et propose des alternatives directes.',
  },
  {
    question: 'Quelles sont les meilleures alternatives aux grandes API IA ?',
    answer:
      'Pour chaque API, la page “alternatives” liste les concurrents les plus proches par catégorie, note et cas d’usage, avec des comparatifs “X vs Y” détaillés pour décider rapidement.',
  },
  {
    question: 'Les données du comparateur sont-elles à jour ?',
    answer:
      'Le catalogue référence 1 400 API IA réelles avec leur source officielle et une date de vérification. Les fiches sont régénérées et le sitemap est actualisé automatiquement à chaque déploiement.',
  },
  {
    question: 'Le comparateur d’API IA est-il gratuit ?',
    answer:
      'Oui, la consultation des fiches, catégories, alternatives et comparatifs est entièrement gratuite. Les tarifs indiqués sont ceux des plateformes API officielles.',
  },
];

export default function HomePage() {
  const allTools = getAllTools();
  const categories = getCategories();
  const topTools = getTopTools(12);
  const apiCount = allTools.length;

  // Comparatifs populaires : vrais liens crawlables vers la longue traîne "X vs Y".
  const popularComparisons = getComparisonPairs(24)
    .map(({ comparison }) => {
      const [a, b] = comparison.split('-vs-');
      const first = getToolBySlug(a);
      const second = getToolBySlug(b);
      if (!first || !second) return null;
      return { comparison, firstName: first.name, secondName: second.name };
    })
    .filter(Boolean);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top API IA',
    itemListElement: topTools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/api-ia/${tool.slug}`,
      name: tool.name,
    })),
  };

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqPageSchema(HOME_FAQ)} />

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Comparateur SEO programmatique</p>
            <h1>Comparez {apiCount.toLocaleString('fr-FR')} API IA réelles, vérifiées et prêtes à intégrer</h1>
            <p className="lead">
              Le comparateur d&apos;API IA de référence : LLM, vision, audio, OCR, embeddings, RAG et
              agents. Prix, fonctionnalités, alternatives, comparatifs et sources officielles, en un coup d&apos;œil.
            </p>
            <div className="hero-actions">
              <Link href="/api-ia" className="button">Explorer les API IA</Link>
              <Link href="/categories" className="button button-ghost">Voir les catégories</Link>
            </div>
          </div>
          <div className="hero-panel premium-panel">
            <div className="stat-card"><strong>{apiCount.toLocaleString('fr-FR')}</strong><span>API IA réelles</span></div>
            <div className="stat-card"><strong>{categories.length}</strong><span>catégories SEO</span></div>
            <div className="stat-card"><strong>100%</strong><span>fiches API uniquement</span></div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catégories populaires</p>
            <h2>Parcourez les API IA par intention de recherche</h2>
          </div>
          <Link href="/categories" className="comparison-link subtle-link">Toutes les catégories</Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="category-card">
              <span>{category.name}</span>
              <strong>{category.count.toLocaleString('fr-FR')} API</strong>
              <small>{category.subCategories.slice(0, 2).join(' · ')}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Top API vérifiées</p>
            <h2>API IA à comparer maintenant</h2>
          </div>
          <Link href="/api-ia" className="comparison-link subtle-link">Catalogue complet</Link>
        </div>
        <div className="tool-grid">
          {topTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      </section>

      {popularComparisons.length > 0 && (
        <section className="container section-block">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Comparatifs populaires</p>
              <h2>Comparatifs d&apos;API IA &laquo; X vs Y &raquo;</h2>
            </div>
          </div>
          <div className="link-grid">
            {popularComparisons.map((c) => (
              <Link key={c.comparison} href={`/comparatif/${c.comparison}`} className="comparison-link">
                {c.firstName} vs {c.secondName}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="container">
        <Faq faq={HOME_FAQ} />
      </div>
    </>
  );
}
