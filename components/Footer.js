import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/logo.png" alt={`Logo ${SITE_NAME}`} width={24} height={24} style={{ objectFit: 'contain' }} />
            {SITE_NAME}
          </p>
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
