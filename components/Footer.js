import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title">{SITE_NAME}</p>
          <p>Comparateur SEO d’API IA réelles, généré automatiquement depuis un fichier JSON.</p>
        </div>
        <div>
          <p className="footer-title">Navigation</p>
          <Link href="/">Accueil</Link>
          <Link href="/api-ia">API IA</Link>
          <Link href="/categories">Catégories</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <p className="footer-title">Légal</p>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/politique-confidentialite">Politique de confidentialité</Link>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
