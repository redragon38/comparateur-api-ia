import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { breadcrumbListSchema } from '@/lib/schema';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { slugify } from '@/lib/format';
import { getComparisonPairs, getToolBySlug } from '@/lib/tools';

export const metadata = {
  title: 'Comparatifs d’API IA : tous les face-à-face « X vs Y »',
  description:
    'Tous les comparatifs d’API IA : prix, fonctionnalités, notes et cas d’usage en face-à-face. Trouvez le bon outil IA en comparant directement deux API.',
  keywords: ['comparatif API IA', 'comparateur API IA', 'API IA versus', 'comparaison API IA'],
  alternates: { canonical: '/comparatifs' },
  openGraph: {
    title: 'Comparatifs d’API IA « X vs Y »',
    description: 'Tous les face-à-face d’API IA : prix, fonctionnalités, notes et cas d’usage.',
    url: `${SITE_URL}/comparatifs`,
    type: 'website',
  },
};

const PER_CATEGORY = 36;

const FAQ = [
  {
    question: 'Comment comparer deux API IA ?',
    answer:
      'Comparez-les sur cinq critères : la catégorie et les cas d’usage couverts, le modèle de prix, les fonctionnalités, la note éditoriale et la qualité de la documentation. Chaque comparatif « X vs Y » du site met ces éléments en face-à-face automatiquement.',
  },
  {
    question: 'Quel est le meilleur comparateur d’API IA ?',
    answer:
      'Ce comparateur référence 1 400 API IA réelles avec sources officielles et propose des milliers de comparatifs directs ainsi que des pages d’alternatives, pour décider rapidement selon votre besoin.',
  },
];

export default function ComparatifsPage() {
  const pairs = getComparisonPairs(null);

  // Regroupe les comparatifs par catégorie du premier outil.
  const byCategory = new Map();
  for (const { comparison } of pairs) {
    const [a, b] = comparison.split('-vs-');
    const first = getToolBySlug(a);
    const second = getToolBySlug(b);
    if (!first || !second) continue;
    const cat = first.category || 'Autres';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    const list = byCategory.get(cat);
    if (list.length < PER_CATEGORY) {
      list.push({ comparison, firstName: first.name, secondName: second.name });
    }
  }

  const groups = Array.from(byCategory.entries())
    .map(([category, items]) => ({ category, slug: slugify(category), items }))
    .sort((a, b) => b.items.length - a.items.length || a.category.localeCompare(b.category, 'fr'));

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Comparatifs', url: '/comparatifs' },
  ];

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Comparatifs d’API IA',
    description: metadata.description,
    url: `${SITE_URL}/comparatifs`,
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <JsonLd data={breadcrumbListSchema(breadcrumbs)} />
      <JsonLd data={collectionSchema} />
      <div className="container page-shell">
        <Breadcrumbs items={breadcrumbs} />
        <p className="eyebrow">Comparatifs API IA</p>
        <h1>Comparatifs d’API IA : tous les face-à-face « X vs Y »</h1>
        <p className="lead">
          Hésitation entre deux API IA ? Comparez-les directement : prix, fonctionnalités, notes,
          cas d’usage, avantages et limites en un coup d’œil. {pairs.length.toLocaleString('fr-FR')}{' '}
          comparatifs disponibles, classés par catégorie.
        </p>

        {groups.map((group) => (
          <section key={group.slug} className="seo-index-group section-block">
            <h2>
              <Link href={`/categories/${group.slug}`}>{group.category}</Link>
            </h2>
            <div className="link-grid">
              {group.items.map((c) => (
                <Link key={c.comparison} href={`/comparatif/${c.comparison}`} className="comparison-link">
                  {c.firstName} vs {c.secondName}
                </Link>
              ))}
            </div>
          </section>
        ))}

        <Faq faq={FAQ} />
      </div>
    </>
  );
}
