import Link from 'next/link';
import { getApiProfile } from '@/lib/presentation';
import { getToolRoute, slugify } from '@/lib/format';

function getDisplayParts(name = '', sourceLabel = 'API IA') {
  const parts = name.includes(' - ') ? name.split(' - ') : [];
  return {
    providerName: parts.length > 1 ? parts[0] : sourceLabel,
    displayName: parts.length > 1 ? parts.slice(1).join(' - ') : name
  };
}

function getShortBadge(category = 'API IA') {
  if (category.includes('Image')) return 'IA générative';
  if (category.includes('Audio') || category.includes('voix')) return 'IA vocale';
  if (category.includes('Vision')) return 'Vision IA';
  if (category.includes('OCR') || category.includes('documents')) return 'Document IA';
  if (category.includes('Recherche')) return 'Recherche IA';
  if (category.includes('Embeddings') || category.includes('RAG')) return 'RAG API';
  if (category.includes('Agents')) return 'Agents IA';
  if (category.includes('Modèles')) return 'LLM API';
  return category;
}

function getStars(rating = 0) {
  const rounded = Math.round(Number(rating || 0));
  return Array.from({ length: 5 }, (_, index) => index < rounded ? '★' : '★');
}

export default function ToolCard({ tool }) {
  const route = getToolRoute(tool);
  const categoryRoute = `/categories/${slugify(tool.category)}`;
  const profile = getApiProfile(tool);
  const { providerName, displayName } = getDisplayParts(tool.name, profile.sourceLabel);
  const features = (tool.features || []).slice(0, 2);
  const useCases = (tool.useCases || []).slice(0, 1);
  const firstAlternative = tool.alternatives?.[0];
  const compareRoute = firstAlternative ? `/comparatif/${tool.slug}-vs-${firstAlternative}` : `/alternatives/${tool.slug}`;
  const docsHref = tool.docsUrl || tool.sourceUrl || tool.website;

  return (
    <article className={`tool-card reference-tool-card premium-card ${profile.cardClass}`}>
      <Link href={route} className="card-click-zone" aria-label={`Voir la fiche détaillée de ${tool.name}`} />
      <div className="reference-card-glow" />

      <div className="reference-card-head">
        <div className="reference-logo-box">
          <img src={tool.logo || '/logos/default.svg'} alt="" className="tool-logo" loading="lazy" />
          <span className="reference-star" aria-hidden="true">★</span>
        </div>

        <div className="reference-badge-stack" aria-label="Signaux principaux">
          <Link href={categoryRoute} className="reference-pill reference-pill-main">{getShortBadge(tool.category)}</Link>
          <span className="reference-pill reference-pill-verified">✓ Vérifié</span>
          <span className="reference-pill reference-pill-free">⚡ {tool.pricing}</span>
        </div>
      </div>

      <div className="reference-card-body">
        <span className="reference-provider">{providerName}</span>
        <h3><Link href={route} title={tool.name}>{displayName}</Link></h3>
        <p>{tool.descriptionShort}</p>
      </div>

      <div className="reference-feature-list" aria-label="Fonctionnalités clés">
        {features.map((feature) => <span key={feature}>{feature}</span>)}
      </div>

      <div className="reference-rating-row" aria-label={`Note ${tool.rating} sur 5`}>
        <span className="reference-stars" aria-hidden="true">
          {getStars(tool.rating).map((star, index) => <b key={index} className={index < Math.round(Number(tool.rating || 0)) ? '' : 'muted'}>{star}</b>)}
        </span>
        <strong>{tool.rating}</strong>
        <span>Note éditoriale</span>
      </div>

      <div className="reference-mini-specs" aria-label="Résumé API">
        <span>{profile.categoryCode}</span>
        <span>{profile.complexity}</span>
        <span>{useCases.join(' · ') || tool.subCategory}</span>
      </div>

      <div className="reference-actions card-actions">
        <Link className="button reference-button reference-button-muted" href={route}>Fiche</Link>
        <Link className="button reference-button reference-button-compare" href={compareRoute}>Comparer</Link>
        {docsHref && (
          <a className="button reference-button reference-button-primary" href={docsHref} target="_blank" rel="nofollow noopener noreferrer">
            Site ↗
          </a>
        )}
      </div>
    </article>
  );
}
