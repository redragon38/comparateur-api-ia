/**
 * app/comparatif/[comparison]/page.js — Page de comparaison entre deux API IA
 *
 * CORRECTIONS DE SÉCURITÉ :
 *
 * 1. validateComparisonSlug() sur params.comparison
 *    → Valide le format "slug-a-vs-slug-b", longueur max, caractères autorisés,
 *      path traversal, encodages dangereux
 *
 * 2. validateSlug() sur chaque partie du slug de comparaison
 *    → Double validation des sous-slugs extraits par parseComparisonSlug
 *
 * 3. sanitizeText() sur les champs metadata title/description
 *    → Évite l'injection SEO via des noms d'outils malformés dans le dataset
 *
 * 4. notFound() systématique pour tout slug invalide
 *
 * IMPACT SEO : aucun — canonical, title et description restent identiques
 *              pour les paires valides.
 */

import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema } from '@/lib/schema';
import { getComparisonPairs, getToolBySlug, getToolRoute, parseComparisonSlug, canonicalComparisonSlug } from '@/lib/tools';
import { validateComparisonSlug, validateSlug, sanitizeText } from '@/lib/validation';

export const dynamicParams = true;

export function generateStaticParams() {
  // Prérendu COMPLET des paires canoniques (ancien cap de 20 supprimé).
  return getComparisonPairs(null);
}

export async function generateMetadata({ params }) {
  const { comparison } = await params;

  if (!validateComparisonSlug(comparison).valid) return {};

  const { toolA, toolB } = parseComparisonSlug(comparison);
  if (!validateSlug(toolA).valid || !validateSlug(toolB).valid) return {};

  const first = getToolBySlug(toolA);
  const second = getToolBySlug(toolB);
  if (!first || !second) return {};

  const title = sanitizeText(
    `${first.name} vs ${second.name} : comparatif complet`,
    120
  );
  const description = sanitizeText(
    `Comparez ${first.name} et ${second.name} : prix, fonctionnalités, cas d'usage, avantages, limites, notes et alternatives.`,
    200
  );

  return {
    title,
    description,
    alternates: { canonical: `/comparatif/${first.slug}-vs-${second.slug}` },
  };
}

function FeatureList({ title, items = [] }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul className="check-list">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

export default async function ComparisonPage({ params }) {
  const { comparison } = await params;

  // Validation du slug de comparaison complet
  if (!validateComparisonSlug(comparison).valid) notFound();

  const { toolA, toolB } = parseComparisonSlug(comparison);

  // Validation de chaque sous-slug
  if (!validateSlug(toolA).valid || !validateSlug(toolB).valid) notFound();

  const first = getToolBySlug(toolA);
  const second = getToolBySlug(toolB);
  if (!first || !second || first.slug === second.slug) notFound();

  // Canonicalisation : redirige b-vs-a vers a-vs-b (ordre alpha) pour éviter
  // la duplication. Une seule URL indexable par paire.
  const canonical = canonicalComparisonSlug(first.slug, second.slug);
  if (comparison !== canonical) {
    redirect(`/comparatif/${canonical}`);
  }

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Comparatif', url: `/comparatif/${first.slug}-vs-${second.slug}` },
    { name: `${first.name} vs ${second.name}`, url: `/comparatif/${first.slug}-vs-${second.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Comparatif API IA</p>
        <h1>{first.name} vs {second.name} : lequel choisir ?</h1>
        <p className="lead">
          Comparaison automatique basée sur les données JSON : prix, catégorie, note,
          fonctionnalités, cas d&apos;usage, avantages, limites et sources officielles.
        </p>

        <section className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Critère</th>
                <th>{first.name}</th>
                <th>{second.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Type</td><td>API IA</td><td>API IA</td></tr>
              <tr><td>Catégorie</td><td>{first.category}</td><td>{second.category}</td></tr>
              <tr><td>Prix</td><td>{first.pricing}</td><td>{second.pricing}</td></tr>
              <tr><td>Note</td><td>★ {first.rating}/5</td><td>★ {second.rating}/5</td></tr>
              <tr><td>Description</td><td>{first.descriptionShort}</td><td>{second.descriptionShort}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="content-grid section-block">
          <FeatureList title={`Fonctionnalités de ${first.name}`} items={first.features} />
          <FeatureList title={`Fonctionnalités de ${second.name}`} items={second.features} />
        </section>

        <section className="content-grid section-block">
          <FeatureList title={`Avantages de ${first.name}`} items={first.pros} />
          <FeatureList title={`Avantages de ${second.name}`} items={second.pros} />
        </section>

        <section className="section-block cta-box">
          <h2>Verdict rapide</h2>
          <p>
            Choisissez <strong>{first.name}</strong> si votre priorité est alignée avec{' '}
            {first.useCases?.slice(0, 2).join(' et ')}. Choisissez{' '}
            <strong>{second.name}</strong> si vous recherchez plutôt{' '}
            {second.useCases?.slice(0, 2).join(' et ')}.
          </p>
          <div className="hero-actions">
            <Link className="button" href={getToolRoute(first)}>Voir {first.name}</Link>
            <Link className="button button-ghost" href={getToolRoute(second)}>Voir {second.name}</Link>
          </div>
        </section>
      </div>
    </>
  );
}
