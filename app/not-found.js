import Link from 'next/link';
import { getCategories, getTopTools } from '@/lib/tools';

export const metadata = {
  title: 'Page introuvable (404)',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const categories = getCategories().slice(0, 8);
  const topTools = getTopTools(6);

  return (
    <div className="container page-shell">
      <p className="eyebrow">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p className="lead">
        La page demandée n’existe pas ou n’est plus disponible. Reprenez votre recherche d’API IA
        ci-dessous.
      </p>
      <div className="hero-actions">
        <Link href="/" className="button">Accueil</Link>
        <Link href="/api-ia" className="button button-ghost">Explorer les API IA</Link>
        <Link href="/comparatifs" className="button button-line">Comparatifs</Link>
      </div>

      <section className="section-block">
        <h2>Catégories d’API IA</h2>
        <div className="link-grid">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="comparison-link">
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>API IA populaires</h2>
        <div className="link-grid">
          {topTools.map((tool) => (
            <Link key={tool.slug} href={`/api-ia/${tool.slug}`} className="comparison-link">
              {tool.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
