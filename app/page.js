import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import ToolCard from '@/components/ToolCard';
import { DEFAULT_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { websiteSchema } from '@/lib/schema';
import { getAllTools, getCategories, getTopTools } from '@/lib/tools';

export const metadata = {
  title: `${SITE_NAME} — comparateur d’API IA réelles`,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: '/' }
};

export default function HomePage() {
  const allTools = getAllTools();
  const categories = getCategories().slice(0, 8);
  const topTools = getTopTools(12);
  const apiCount = allTools.length;

  return (
    <>
      <JsonLd data={websiteSchema()} />
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Comparateur SEO programmatique</p>
            <h1>Comparez des API IA réelles, vérifiées et prêtes à intégrer</h1>
            <p className="lead">Catalogue Next.js généré depuis JSON : fiches SEO, alternatives, comparatifs, FAQ, sitemap dynamique et sources officielles.</p>
            <div className="hero-actions">
              <Link href="/api-ia" className="button">Explorer les API IA</Link>
              <Link href="/categories" className="button button-ghost">Voir les catégories</Link>
            </div>
          </div>
          <div className="hero-panel premium-panel">
            <div className="stat-card"><strong>{apiCount.toLocaleString('fr-FR')}</strong><span>API IA réelles</span></div>
            <div className="stat-card"><strong>{categories.length}+</strong><span>catégories SEO</span></div>
            <div className="stat-card"><strong>100%</strong><span>fiches API uniquement</span></div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catégories populaires</p>
            <h2>Parcourez les API IA par intention</h2>
          </div>
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
    </>
  );
}
