/**
 * components/SeoLinkIndex.js — Index de liens rendu côté serveur (SEO).
 *
 * POURQUOI : la liste principale (ToolBrowser) est un composant client paginé
 * (24 fiches/page). Googlebot n'y voit donc PAS de liens <a> vers les ~1 400
 * fiches : le maillage interne et l'exploration sont cassés.
 *
 * Ce composant rend, côté serveur, de vrais liens HTML vers TOUTES les fiches
 * (et, en option, vers leurs pages "alternatives"). Regroupés par catégorie,
 * ils donnent à Google un chemin d'exploration complet et distribuent le
 * PageRank interne — sans alourdir l'UX (bloc compact en bas de page).
 */

import Link from 'next/link';
import { slugify } from '@/lib/format';

export default function SeoLinkIndex({
  tools = [],
  title = 'Index complet des API IA',
  description = 'Toutes les fiches du catalogue, classées par catégorie, pour une exploration exhaustive.',
  withAlternatives = true,
}) {
  if (!tools.length) return null;

  // Regroupement par catégorie, trié par taille décroissante puis alpha.
  const groups = new Map();
  for (const tool of tools) {
    const cat = tool.category || 'Autres';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(tool);
  }

  const orderedGroups = Array.from(groups.entries())
    .map(([category, items]) => ({
      category,
      slug: slugify(category),
      items: items.slice().sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    }))
    .sort((a, b) => b.items.length - a.items.length || a.category.localeCompare(b.category, 'fr'));

  return (
    <section className="seo-index section-block" aria-label={title}>
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">Maillage interne</p>
          <h2>{title}</h2>
        </div>
      </div>
      <p className="lead">{description}</p>

      {orderedGroups.map((group) => (
        <div key={group.slug} className="seo-index-group">
          <h3>
            <Link href={`/categories/${group.slug}`}>{group.category}</Link>{' '}
            <small>({group.items.length})</small>
          </h3>
          <ul className="seo-index-list">
            {group.items.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/api-ia/${tool.slug}`}>{tool.name}</Link>
                {withAlternatives && (
                  <>
                    {' · '}
                    <Link href={`/alternatives/${tool.slug}`} className="seo-index-alt">
                      alternatives
                    </Link>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
