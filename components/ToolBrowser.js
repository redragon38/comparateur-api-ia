'use client';

import { useMemo, useState } from 'react';
import ToolCard from '@/components/ToolCard';

const PAGE_SIZE = 24;

export default function ToolBrowser({ tools = [], title = 'Catalogue' }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [pricing, setPricing] = useState('all');
  const [rating, setRating] = useState('all');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => [...new Set(tools.map((tool) => tool.category))].sort(), [tools]);
  const pricings = useMemo(() => [...new Set(tools.map((tool) => tool.pricing))].sort(), [tools]);

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minRating = rating === 'all' ? 0 : Number(rating);

    const filtered = tools.filter((tool) => {
      const searchText = [
        tool.name,
        tool.category,
        tool.subCategory,
        tool.descriptionShort,
        tool.pricing,
        ...(tool.features || []),
        ...(tool.useCases || [])
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!normalizedQuery || searchText.includes(normalizedQuery)) &&
        (category === 'all' || tool.category === category) &&
        (pricing === 'all' || tool.pricing === pricing) &&
        tool.rating >= minRating
      );
    });

    return filtered.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'fr');
      if (sort === 'verified') return Number(b.verified) - Number(a.verified) || b.rating - a.rating;
      if (sort === 'category') return a.category.localeCompare(b.category, 'fr') || b.rating - a.rating;
      return b.rating - a.rating || Number(b.verified) - Number(a.verified);
    });
  }, [tools, query, category, pricing, rating, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedTools = filteredTools.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function updateFilter(setter) {
    return (event) => {
      setter(event.target.value);
      setPage(1);
    };
  }

  return (
    <section className="browser" aria-labelledby="browser-title">
      <div className="browser-head compact-heading">
        <div>
          <p className="eyebrow">Catalogue dynamique</p>
          <h2 id="browser-title">{title}</h2>
        </div>
        <p className="result-count">{filteredTools.length.toLocaleString('fr-FR')} API · {PAGE_SIZE} par page</p>
      </div>

      <div className="filters api-only-filters compact-filters">
        <label>
          Recherche
          <input
            type="search"
            placeholder="LLM, OCR, voix, embeddings..."
            value={query}
            onChange={updateFilter(setQuery)}
          />
        </label>

        <label>
          Catégorie
          <select value={category} onChange={updateFilter(setCategory)}>
            <option value="all">Toutes</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Prix
          <select value={pricing} onChange={updateFilter(setPricing)}>
            <option value="all">Tous</option>
            {pricings.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <label>
          Note
          <select value={rating} onChange={updateFilter(setRating)}>
            <option value="all">Toutes</option>
            <option value="4.8">4.8+</option>
            <option value="4.5">4.5+</option>
            <option value="4.0">4.0+</option>
          </select>
        </label>

        <label>
          Tri
          <select value={sort} onChange={updateFilter(setSort)}>
            <option value="rating">Meilleure note</option>
            <option value="verified">Vérifiées d’abord</option>
            <option value="category">Catégorie</option>
            <option value="name">Nom A-Z</option>
          </select>
        </label>
      </div>

      {paginatedTools.length ? (
        <div className="tool-grid dense-tool-grid">
          {paginatedTools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
      ) : (
        <div className="empty-state">Aucune API ne correspond aux filtres actuels.</div>
      )}

      <div className="pagination compact-pagination" aria-label="Pagination">
        <button type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Précédent
        </button>
        <span>Page {safePage} / {totalPages}</span>
        <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
          Suivant
        </button>
      </div>
    </section>
  );
}
