import Link from 'next/link';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="breadcrumbs" aria-label="Fil d’Ariane">
      {items.map((item, index) => (
        <span key={item.url}>
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          {index === items.length - 1 ? (
            <span aria-current="page">{item.name}</span>
          ) : (
            <Link href={item.url}>{item.name}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
