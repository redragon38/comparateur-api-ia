export const metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du comparateur d’API IA.',
  alternates: { canonical: '/politique-confidentialite' }
};

export default function PrivacyPage() {
  return (
    <div className="container page-shell narrow-page legal-content">
      <p className="eyebrow">Confidentialité</p>
      <h1>Politique de confidentialité</h1>
      <p>Le site peut collecter des données techniques anonymes, des données de formulaire et des statistiques d’audience selon les services connectés.</p>
      <p>Aucune donnée sensible ne doit être saisie dans les formulaires sans base légale et consentement explicite.</p>
      <p>Complétez cette page selon votre configuration réelle : analytics, formulaire, newsletter, affiliation, cookies et hébergement.</p>
    </div>
  );
}
