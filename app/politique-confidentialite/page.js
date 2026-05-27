export const metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du Comparateur API IA — données collectées, cookies, droits RGPD et contact DPO.',
  alternates: { canonical: '/politique-confidentialite' }
};

export default function PrivacyPage() {
  return (
    <div className="container page-shell narrow-page legal-content">
      <p className="eyebrow">Confidentialité</p>
      <h1>Politique de confidentialité</h1>
      <p className="lead" style={{ fontSize: '1rem' }}>
        Le Comparateur API IA s'engage à protéger votre vie privée conformément au
        Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la
        loi Informatique et Libertés modifiée.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des données est l'éditeur du site Comparateur API IA.
        Pour toute question relative à vos données personnelles, utilisez le{' '}
        <a href="/contact">formulaire de contact</a>.
      </p>

      <h2>2. Données collectées</h2>
      <h3>2.1 Données de navigation (Analytics)</h3>
      <p>
        Le Site utilise <strong>Google Analytics 4</strong> pour mesurer l'audience. Cet outil
        collecte de manière anonyme :
      </p>
      <ul>
        <li>Les pages visitées et leur durée de consultation</li>
        <li>Le type d'appareil, navigateur et système d'exploitation</li>
        <li>Le pays d'origine (basé sur l'IP, anonymisée)</li>
        <li>La source du trafic (recherche, lien direct, référent)</li>
      </ul>
      <p>
        L'adresse IP est anonymisée avant tout stockage. Aucune donnée permettant
        d'identifier personnellement un visiteur n'est collectée par cet outil.
      </p>
      <p>
        Base légale : intérêt légitime (amélioration du service, article 6.1.f du RGPD).
      </p>

      <h3>2.2 Formulaire de contact</h3>
      <p>
        Lorsque vous utilisez le formulaire de contact, nous collectons :
      </p>
      <ul>
        <li>Votre adresse e-mail</li>
        <li>Votre nom (facultatif)</li>
        <li>Le contenu de votre message</li>
      </ul>
      <p>
        Ces données sont utilisées exclusivement pour répondre à votre demande. Elles ne
        sont pas cédées à des tiers et sont conservées le temps nécessaire au traitement
        de votre demande, au maximum 12 mois.<br />
        Base légale : exécution de mesures précontractuelles / consentement (article 6.1.b et 6.1.a).
      </p>

      <h2>3. Cookies</h2>
      <p>Le Site utilise les types de cookies suivants :</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.9rem', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ background: 'var(--surface-soft)' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid var(--border)' }}>Cookie</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid var(--border)' }}>Finalité</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', border: '1px solid var(--border)' }}>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>_ga, _ga_*</td>
            <td style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>Google Analytics — mesure d'audience anonyme</td>
            <td style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>13 mois</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>_gid</td>
            <td style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>Google Analytics — session utilisateur</td>
            <td style={{ padding: '8px 12px', border: '1px solid var(--border)' }}>24 heures</td>
          </tr>
        </tbody>
      </table>
      <p>
        Aucun cookie publicitaire ou de pistage tiers n'est déposé sur ce site.
        Vous pouvez refuser les cookies Analytics via les paramètres de votre navigateur
        ou en installant le{' '}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          module de désactivation Google Analytics
        </a>.
      </p>

      <h2>4. Partage des données</h2>
      <p>
        Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées
        uniquement avec :
      </p>
      <ul>
        <li><strong>Google LLC</strong> — pour les statistiques Analytics (données anonymisées)</li>
        <li><strong>Vercel Inc.</strong> — pour l'hébergement du Site (logs serveur techniques, conservés 30 jours)</li>
      </ul>
      <p>
        Ces sous-traitants opèrent sous des garanties contractuelles conformes au RGPD
        (clauses contractuelles types ou décision d'adéquation).
      </p>

      <h2>5. Vos droits (RGPD)</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d'accès</strong> — connaître les données vous concernant</li>
        <li><strong>Droit de rectification</strong> — corriger des données inexactes</li>
        <li><strong>Droit à l'effacement</strong> — demander la suppression de vos données</li>
        <li><strong>Droit d'opposition</strong> — vous opposer à un traitement</li>
        <li><strong>Droit à la limitation</strong> — restreindre l'utilisation de vos données</li>
        <li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format lisible</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous via le{' '}
        <a href="/contact">formulaire de contact</a>. Nous répondrons dans un délai maximum
        d'un mois.
      </p>
      <p>
        Vous avez également le droit d'introduire une réclamation auprès de la{' '}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">CNIL</a>{' '}
        (Commission Nationale de l'Informatique et des Libertés).
      </p>

      <h2>6. Sécurité des données</h2>
      <p>
        Le Site est servi exclusivement en HTTPS. Des mesures techniques appropriées sont
        mises en place pour protéger vos données contre l'accès non autorisé, la divulgation
        ou la destruction, notamment :
      </p>
      <ul>
        <li>Chiffrement des communications (TLS 1.2+)</li>
        <li>En-têtes de sécurité HTTP (HSTS, CSP, X-Frame-Options)</li>
        <li>Aucune base de données côté serveur accessible publiquement</li>
      </ul>

      <h2>7. Transferts hors UE</h2>
      <p>
        Google Analytics et Vercel peuvent traiter certaines données hors de l'Union
        Européenne (notamment aux États-Unis). Ces transferts sont encadrés par des
        clauses contractuelles types approuvées par la Commission Européenne.
      </p>

      <h2>8. Modifications</h2>
      <p>
        Cette politique peut être mise à jour pour refléter des changements légaux ou
        techniques. La date de dernière mise à jour est indiquée ci-dessous. L'utilisation
        continue du Site après modification vaut acceptation de la nouvelle politique.
      </p>

      <p style={{ marginTop: '2rem', color: 'var(--muted)', fontSize: '.85rem' }}>
        Dernière mise à jour : mai 2025
      </p>
    </div>
  );
}
