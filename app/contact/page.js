import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Contactez l’équipe du comparateur API IA pour proposer une API, signaler une erreur ou demander une correction.',
  alternates: { canonical: '/contact' }
};

export default function ContactPage() {
  return (
    <div className="container page-shell narrow-page">
      <p className="eyebrow">Contact sécurisé</p>
      <h1>Contact</h1>
      <p className="lead">Proposez une API IA, signalez une donnée à corriger ou demandez une intégration éditoriale.</p>
      <ContactForm />
      <p className="form-note">Pour un premier déploiement, le formulaire ne transmet rien tant qu’un backend n’est pas branché. Cela évite d’exposer des données dans l’URL ou dans des logs inutiles.</p>
    </div>
  );
}
