export const metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du comparateur d’API IA.',
  alternates: { canonical: '/mentions-legales' }
};

export default function LegalPage() {
  return (
    <div className="container page-shell narrow-page legal-content">
      <p className="eyebrow">Légal</p>
      <h1>Mentions légales</h1>
      <p>Éditeur : à compléter.</p>
      <p>Hébergement : Vercel Inc. ou autre hébergeur à compléter.</p>
      <p>Ce site présente des informations éditoriales sur des API IA. Les marques citées appartiennent à leurs propriétaires respectifs.</p>
      <p>Les informations publiées sur les API IA doivent être vérifiées avant toute décision d’achat ou d’intégration.</p>
    </div>
  );
}
