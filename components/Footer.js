import Link from 'next/link';
import Image from 'next/image';
import { SITE_NAME } from '@/lib/site';
import { getCategories, getTopTools } from '@/lib/tools';

export default function Footer() {
  const categories = getCategories().slice(0, 8);
  const topTools = getTopTools(8);

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image src="/logo.png" alt={`Logo ${SITE_NAME}`} width={24} height={24} style={{ objectFit: 'contain' }} />
            {SITE_NAME}
          </p>
          <p>Comparateur d’API IA réelles : 1 400 fiches, prix, alternatives et comparatifs, avec sources officielles.</p>
        </div>
        <div>
          <p className="footer-title">Navigation</p>
          <Link href="/">Accueil</Link>
          <Link href="/api-ia">API IA</Link>
          <Link href="/categories">Catégories</Link>
          <Link href="/comparatifs">Comparatifs</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <p className="footer-title">Catégories d’API IA</p>
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`}>{category.name}</Link>
          ))}
        </div>
        <div>
          <p className="footer-title">API IA populaires</p>
          {topTools.map((tool) => (
            <Link key={tool.slug} href={`/api-ia/${tool.slug}`}>{tool.name}</Link>
          ))}
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
