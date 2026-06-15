import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema } from '@/lib/schema';
import { getUseCases } from '@/lib/tools';

export const metadata = {
  title: "Cas d'usage des API IA : trouvez l'API adaptée à votre besoin",
  description:
    "Parcourez les API IA par cas d'usage : chatbots, agents, automatisation, analyse documentaire, génération, vision, voix et bien plus.",
  alternates: { canonical: '/cas-usage' },
};

export default function UseCasesIndexPage() {
  const useCases = getUseCases();
  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: "Cas d'usage", url: '/cas-usage' },
  ];

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Cas d'usage</p>
        <h1>Trouvez une API IA par cas d'usage</h1>
        <p className="lead">
          {useCases.length} cas d'usage référencés à partir de {useCases.reduce((s, u) => s + u.count, 0)} associations
          dans notre catalogue d'API IA réelles.
        </p>

        <nav className="sitemap-links" aria-label="Tous les cas d'usage">
          <ul className="link-columns">
            {useCases.map((useCase) => (
              <li key={useCase.slug}>
                <Link href={`/cas-usage/${useCase.slug}`}>
                  {useCase.name} ({useCase.count})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
