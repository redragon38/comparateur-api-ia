import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import ToolCard from '@/components/ToolCard';
import { breadcrumbListSchema } from '@/lib/schema';
import { getUseCases, getUseCaseBySlug, getToolsByUseCaseSlug } from '@/lib/tools';
import { validateSlug, sanitizeText } from '@/lib/validation';

export const dynamicParams = true;

export function generateStaticParams() {
  return getUseCases().map((useCase) => ({ slug: useCase.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!validateSlug(slug).valid) return {};

  const useCase = getUseCaseBySlug(slug);
  if (!useCase) return {};

  const name = sanitizeText(useCase.name, 100);
  return {
    title: sanitizeText(`API IA pour ${name} : comparatif des meilleures solutions`, 120),
    description: sanitizeText(
      `Découvrez les meilleures API IA pour ${name} : prix, fonctionnalités, documentation officielle, alternatives et comparatifs.`,
      200
    ),
    alternates: { canonical: `/cas-usage/${useCase.slug}` },
  };
}

export default async function UseCasePage({ params }) {
  const { slug } = await params;
  if (!validateSlug(slug).valid) notFound();

  const useCase = getUseCaseBySlug(slug);
  if (!useCase) notFound();

  const tools = getToolsByUseCaseSlug(slug);
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: "Cas d'usage", url: '/cas-usage' },
    { name: useCase.name, url: `/cas-usage/${useCase.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Cas d'usage</p>
        <h1>API IA pour {useCase.name}</h1>
        <p className="lead">
          {tools.length.toLocaleString('fr-FR')} API IA adaptées au cas d'usage « {useCase.name} »,
          triées par note. Comparez prix, fonctionnalités, alternatives et documentation officielle.
        </p>

        <div className="tool-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>

        {/* Index crawlable complet */}
        <nav className="sitemap-links section-block" aria-label={`Toutes les API IA pour ${useCase.name}`}>
          <h2>Toutes les API IA pour {useCase.name}</h2>
          <ul className="link-columns">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/api-ia/${tool.slug}`}>{tool.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
