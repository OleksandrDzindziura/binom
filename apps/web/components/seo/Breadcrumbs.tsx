import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type BreadcrumbItem = {
  name: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const all = [{ name: 'Головна', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1 text-sm text-slate-400">
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {isLast || !item.href ? (
                <span className={isLast ? 'text-white' : ''}>{item.name}</span>
              ) : (
                <Link href={item.href} className="hover:text-amber-400 transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
