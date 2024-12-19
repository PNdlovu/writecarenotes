import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    return {
      href,
      label: segment.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
    };
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground py-4">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link
            href={breadcrumb.href}
            className={`hover:text-foreground transition-colors ${
              index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
            }`}
          >
            {breadcrumb.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
