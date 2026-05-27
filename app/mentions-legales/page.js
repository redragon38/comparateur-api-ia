export const metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du Comparateur API IA — éditeur, hébergeur, propriété intellectuelle et responsabilité.',
  alternates: { canonical: '/mentions-legales' }
};

export default function LegalPage() {
  return (
    <div className="container page-shell narrow-page legal-content">
      <p className="eyebrow">Légal</p>
      <h1>Mentions légales</h1>
      <p className="lead" style={{ fontSize: '1rem' }}>
        Conformément aux articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la
        Confiance dans l'Économie Numérique (LCEN), nous portons à la connaissance des
        utilisateurs les informations suivantes.
      </p>

      <h2>1. Éditeur du site</h2>
      <p>
        Le site <strong>Comparateur API IA</strong> (ci-après « le Site ») est édité à titre
        personnel par un développeur indépendant.<br />
        <strong>Adresse e-mail de contact :</strong>{' '}
        <a href="/contact">via le formulaire de contact</a>
      </p>
      <p>
        Le Site est un comparateur éditorial et informatif sur les API d'intelligence
        artificielle disponibles sur le marché. Il ne constitue pas un service de conseil
        financier, juridique ou technique.
      </p>

      <h2>2. Hébergement</h2>
      <p>
        Le Site est hébergé par :<br />
        <strong>Vercel Inc.</strong><br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
        Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a>
      </p>

      <h2>3. Propriété intellectuelle</h2>
      <p>
        L'ensemble du contenu éditorial du Site (textes, structure, fiches comparatives,
        présentation des données) est la propriété de l'éditeur et est protégé par le droit
        d'auteur français et international.
      </p>
      <p>
        Les marques, logos, noms de produits et API mentionnés sur le Site (OpenAI, Anthropic,
        Google, Mistral, etc.) sont la propriété exclusive de leurs détenteurs respectifs.
        Leur mention sur ce Site est purement informative et ne constitue en aucun cas une
        affiliation, un partenariat ou un accord commercial.
      </p>
      <p>
        Toute reproduction, représentation, modification ou exploitation du contenu éditorial
        du Site sans autorisation écrite préalable est interdite.
      </p>

      <h2>4. Exactitude des informations</h2>
      <p>
        Les données relatives aux API IA (tarifs, fonctionnalités, disponibilité) sont fournies
        à titre indicatif et peuvent évoluer sans préavis. L'éditeur s'efforce de maintenir ces
        informations à jour mais ne garantit pas leur exactitude ni leur exhaustivité.
      </p>
      <p>
        Toute décision d'intégration ou d'achat doit être basée sur une vérification directe
        auprès des fournisseurs concernés. L'éditeur décline toute responsabilité pour les
        décisions prises sur la base des informations publiées.
      </p>

      <h2>5. Liens hypertextes</h2>
      <p>
        Le Site peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre
        informatif uniquement. L'éditeur n'exerce aucun contrôle sur ces sites et décline
        toute responsabilité quant à leur contenu ou leur disponibilité.
      </p>

      <h2>6. Droit applicable</h2>
      <p>
        Les présentes mentions légales sont soumises au droit français. En cas de litige, les
        tribunaux français seront compétents.
      </p>

      <p style={{ marginTop: '2rem', color: 'var(--muted)', fontSize: '.85rem' }}>
        Dernière mise à jour : mai 2025
      </p>
    </div>
  );
}
