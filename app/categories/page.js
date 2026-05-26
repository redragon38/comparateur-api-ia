import Link from 'next/link';
import { getCategories } from '@/lib/tools';

export const metadata = {
  title: 'Catégories API IA : APIs par usage',
  description: 'Toutes les catégories d’API IA : LLM, image, vidéo, voix, OCR, embeddings, agents, cloud AI, recherche, vision, modération et plus.',
  alternates: { canonical: '/categories' }
};

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <div className="container page-shell">
      <p className="eyebrow">Taxonomie SEO API</p>
      <h1>Catégories d’API IA</h1>
      <p className="lead">Explorez les API IA par besoin, cas d’usage et intention de recherche.</p>
      <div className="category-grid large-grid">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categories/${category.slug}`} className="category-card">
            <span>{category.name}</span>
            <strong>{category.count.toLocaleString('fr-FR')} API</strong>
            <small>{category.subCategories.slice(0, 3).join(' · ')}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
