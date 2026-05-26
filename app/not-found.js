import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container page-shell center-page">
      <p className="eyebrow">Erreur 404</p>
      <h1>Page introuvable</h1>
      <p>La page demandée n’existe pas ou n’est plus disponible.</p>
      <Link href="/" className="button">Retour à l’accueil</Link>
    </div>
  );
}
