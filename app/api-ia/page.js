import Link from 'next/link';
import ToolBrowser from '@/components/ToolBrowser';
import { getPublicTools, getToolsByType, getCategories, slugify } from '@/lib/tools';

export const metadata = {
  title: 'API IA : comparatif, prix, documentation et alternatives',
  description: 'Comparez uniquement des API IA réelles pour texte, image, voix, embeddings, agents, OCR, vision, recherche vectorielle et automatisation.',
  alternates: { canonical: '/api-ia' }
};

export default function ApiPage() {
  const allTools = getToolsByType('api');
  const tools = getPublicTools(allTools);
  const categories = getCategories();

  return (
    <div className="container page-shell">
      <p className="eyebrow">Catalogue API IA</p>
      <h1>API IA</h1>
      <p className="lead">Trouvez une API IA réelle et sourcée pour vos projets : LLM, génération, analyse, vision, speech, embeddings, RAG, agents et automatisation.</p>
      <ToolBrowser tools={tools} title="Liste des API IA" />

      {/*
        Index HTML COMPLET rendu côté serveur.
        ToolBrowser est un composant client paginé (24/page) : Google n'y voit
        que 24 liens. Cet index statique expose les liens vers les 1400 fiches
        ET les catégories, garantissant que chaque page est atteignable par un
        <a href> réel — condition indispensable au crawl et à l'indexation.
      */}
      <section className="section-block" aria-label="Index complet des API IA">
        <div className="section-heading">
          <p className="eyebrow">Index complet</p>
          <h2>Toutes les API IA ({allTools.length.toLocaleString('fr-FR')})</h2>
        </div>

        <nav className="sitemap-links" aria-label="Catégories">
          <h3>Par catégorie</h3>
          <ul className="link-columns">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/categories/${category.slug}`}>
                  {category.name} ({category.count})
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="sitemap-links" aria-label="Toutes les fiches API IA">
          <h3>Toutes les fiches</h3>
          <ul className="link-columns">
            {allTools.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/api-ia/${tool.slug}`}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </div>
  );
}
