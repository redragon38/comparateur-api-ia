import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Accueil">
          <span className="brand-mark">API</span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <Link href="/">Accueil</Link>
          <Link href="/api-ia">API IA</Link>
          <Link href="/categories">Catégories</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
