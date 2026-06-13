import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/site';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Accueil">
          <span className="brand-mark">
            <Image
              src="/logo.png"
              alt={`Logo ${SITE_NAME}`}
              width={32}
              height={32}
              style={{ objectFit: 'contain', display: 'block' }}
              priority
            />
          </span>
          <span>{SITE_NAME}</span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <Link href="/">Accueil</Link>
          <Link href="/api-ia">API IA</Link>
          <Link href="/categories">Catégories</Link>
          <Link href="/comparatifs">Comparatifs</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
