/**
 * components/ToolDetail.js — Composant de détail d'un outil
 *
 * CORRECTIONS DE SÉCURITÉ :
 *
 * 1. sanitizeExternalUrl() sur tool.docsUrl, tool.website, tool.sourceUrl
 *    → Empêche les URLs javascript:, data:, vbscript: dans les href
 *    → Impact : les liens externes ne peuvent plus servir d'open redirect
 *      ni d'injection XSS via l'attribut href
 *
 * 2. sanitizeExternalUrl() sur tool.logo (attribut src de l'img)
 *    → Inutile en SSR (React échappe les attributs), mais bonne pratique
 *      documentée pour les futurs client components
 *
 * IMPACT SEO : aucun — les rich snippets JSON-LD sont générés par JsonLd.js
 *              (déjà sécurisé), pas par ce composant.
 */

import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import ToolCard from '@/components/ToolCard';
import { breadcrumbListSchema, faqPageSchema, softwareApplicationSchema } from '@/lib/schema';
import { getAlternativeTools, getRelatedTools, getToolRoute, slugify } from '@/lib/tools';
import { getDetailSections } from '@/lib/presentation';
import { sanitizeExternalUrl } from '@/lib/validation';

function MetricBar({ label, value }) {
  return (
    <div className="detail-metric">
      <div><span>{label}</span><strong>{value}/100</strong></div>
      <b style={{ width: `${value}%` }} />
    </div>
  );
}

function CompactList({ title, items = [], tone = 'neutral' }) {
  return (
    <div className={`detail-mini-card ${tone}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default function ToolDetail({ tool }) {
  const route = getToolRoute(tool);
  const listRoute = '/api-ia';
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'API IA', url: listRoute },
    { name: tool.name, url: route },
  ];
  const alternatives = getAlternativeTools(tool, 6);
  const related = getRelatedTools(tool, 6);
  const detail = getDetailSections(tool);
  const { profile } = detail;

  // Sanitisation des URLs externes — bloque javascript:, data:, vbscript:, etc.
  const docsUrl = sanitizeExternalUrl(tool.docsUrl || tool.website);
  const sourceUrl = sanitizeExternalUrl(tool.sourceUrl);

  return (
    <>
      <JsonLd data={softwareApplicationSchema(tool)} />
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <JsonLd data={faqPageSchema(tool.faq || [])} />

      <div className={`detail-page ${profile.detailClass}`}>
        <div className="container page-shell compact-page-shell">
          <Breadcrumbs items={breadcrumbs} />

          <section className="detail-hero detail-hero-premium">
            <div className="detail-main">
              <div className="detail-orb" />
              <div className="detail-hero-grid">
                <div>
                  <div className="tool-card-top detail-title-row">
                    <div className="logo-wrap big-logo-wrap">
                      {/* alt="" intentionnel : image purement décorative (le nom est dans le h1) */}
                      <img
                        src={tool.logo || '/logos/default.svg'}
                        alt=""
                        className="tool-logo tool-logo-large"
                      />
                    </div>
                    <div>
                      <div className="mini-badges">
                        <span className="mini-badge">API IA</span>
                        <span className="mini-badge verified">{profile.sourceLabel}</span>
                        <span className="mini-badge">{tool.pricing}</span>
                        <span className="mini-badge">{profile.complexity}</span>
                      </div>
                      <p className="eyebrow">{tool.category} · {tool.subCategory}</p>
                      <h1>{tool.name} : détails API, prix, usages et alternatives</h1>
                    </div>
                  </div>
                  <p className="lead detail-lead">{tool.descriptionLong}</p>
                  <div className="hero-actions compact-actions">
                    {/* URL externe sanitisée — bloque les protocoles dangereux */}
                    <a
                      href={docsUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="button"
                    >
                      Documentation officielle
                    </a>
                    <Link href={`/alternatives/${tool.slug}`} className="button button-ghost">
                      Alternatives
                    </Link>
                    <Link href={`/categories/${slugify(tool.category)}`} className="button button-line">
                      Catégorie
                    </Link>
                  </div>
                </div>

                <aside className="api-score-card" aria-label="Score API">
                  <div className="api-score-large" style={{ '--api-score': `${profile.score}%` }}>
                    <span>{profile.score}</span>
                    <small>/100</small>
                  </div>
                  <p>
                    Score éditorial généré depuis la note, la documentation, la source
                    et la richesse fonctionnelle.
                  </p>
                  {profile.metrics.map((metric) => (
                    <MetricBar key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </aside>
              </div>
            </div>

            <aside className="detail-aside summary-card">
              <h2>Identité API</h2>
              <dl className="spec-list">
                {detail.stackSignals.map((item) => (
                  <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>
                ))}
                <div><dt>Note</dt><dd>{tool.rating}/5</dd></div>
                {tool.lastVerified && (
                  <div><dt>Vérification</dt><dd>{tool.lastVerified}</dd></div>
                )}
              </dl>
            </aside>
          </section>

          <section className="section-block detail-verdict-grid">
            <div className="verdict-card standout-card">
              <p className="eyebrow">Verdict rapide</p>
              <h2>{detail.verdictTitle}</h2>
              <p>{detail.verdictText}</p>
              <div className="verdict-tags">
                {detail.seoAngles.map((angle) => <span key={angle}>{angle}</span>)}
              </div>
            </div>
            <div className="source-card standout-card">
              <p className="eyebrow">Fiabilité</p>
              <h2>Signaux de confiance</h2>
              <ul className="check-list dense-list">
                {detail.trustItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
              {/* URL source sanitisée */}
              {sourceUrl && sourceUrl !== '#' && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="subtle-link source-link"
                >
                  Ouvrir la source
                </a>
              )}
            </div>
          </section>

          <section className="content-grid section-block compact-content-grid">
            <div>
              <p className="eyebrow">Capacités</p>
              <h2>Fonctionnalités clés</h2>
              <ul className="check-list dense-list">
                {(tool.features || []).map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </div>
            <div>
              <p className="eyebrow">Intentions</p>
              <h2>Cas d&apos;usage</h2>
              <ul className="check-list dense-list">
                {(tool.useCases || []).map((useCase) => <li key={useCase}>{useCase}</li>)}
              </ul>
            </div>
          </section>

          <section className="detail-mini-grid section-block">
            <CompactList title="Très adapté pour" items={detail.bestFor} tone="good" />
            <CompactList title="À éviter si" items={detail.notFor} tone="risk" />
            <CompactList title="Checklist intégration" items={detail.integrationSteps} tone="neutral" />
          </section>

          <section className="content-grid section-block compact-content-grid">
            <div className="pros-card">
              <p className="eyebrow">À retenir</p>
              <h2>Avantages</h2>
              <ul className="dense-list">
                {(tool.pros || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="cons-card">
              <p className="eyebrow">Vigilance</p>
              <h2>Limites</h2>
              <ul className="dense-list">
                {(tool.cons || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>

          <Faq faq={tool.faq || []} />

          <section className="section-block">
            <div className="section-heading compact-heading">
              <div>
                <p className="eyebrow">Alternatives automatiques</p>
                <h2>Meilleures alternatives à {tool.name}</h2>
              </div>
              <Link
                href={`/alternatives/${tool.slug}`}
                className="comparison-link subtle-link"
              >
                Toutes les alternatives
              </Link>
            </div>
            <div className="tool-grid compact-grid">
              {alternatives.map((alternative) => (
                <ToolCard key={alternative.slug} tool={alternative} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading compact-heading">
              <div>
                <p className="eyebrow">Maillage interne</p>
                <h2>Solutions similaires à explorer</h2>
              </div>
            </div>
            <div className="tool-grid compact-grid">
              {related.map((candidate) => (
                <ToolCard key={candidate.slug} tool={candidate} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
