'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { categories, products } from '@/data/products';
import type { Category } from '@/lib/types';

interface CategorySidebarProps {
  categorySlug: string;
  mobile?: boolean;
}

function SidebarNav({ category, categorySlug, pathname }: { category: Category; categorySlug: string; pathname: string }) {
  // Only show families that have at least 1 product
  const visibleSubs = category.subcategories.filter(
    sub => products.some(p => p.subcategory === sub.slug)
  );

  return (
    <ul className="space-y-1">
      {visibleSubs.map((sub) => {
        const familyPath = `/${categorySlug}/${sub.slug}`;
        const isActive = pathname.startsWith(familyPath);

        return (
          <li key={sub.slug}>
            <Link
              href={familyPath}
              className={`block py-1.5 text-sm transition-colors ${
                isActive
                  ? 'font-bold text-teka-dark'
                  : 'text-teka-gray hover:text-teka-dark'
              }`}
            >
              {sub.name}
            </Link>

            {isActive && sub.children && sub.children.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1">
                {sub.children.map((child) => {
                  const childPath = `${familyPath}/${child.slug}`;
                  const isChildActive = pathname === childPath;
                  return (
                    <li key={child.slug}>
                      <Link
                        href={childPath}
                        className={`block py-1 text-sm transition-colors ${
                          isChildActive
                            ? 'font-semibold text-teka-dark'
                            : 'text-teka-gray hover:text-teka-dark'
                        }`}
                      >
                        {child.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function CategorySidebar({ categorySlug, mobile }: CategorySidebarProps) {
  const pathname = usePathname();
  const category = categories.find(c => c.slug === categorySlug);
  if (!category) return null;

  if (mobile) {
    return (
      <nav>
        <h3 className="font-heading font-semibold text-base text-teka-dark mb-3">
          {category.name}
        </h3>
        <SidebarNav category={category} categorySlug={categorySlug} pathname={pathname} />
      </nav>
    );
  }

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <nav className="sticky top-24">
        <h2 className="font-heading font-semibold text-lg text-teka-dark mb-4">
          {category.name}
        </h2>
        <SidebarNav category={category} categorySlug={categorySlug} pathname={pathname} />
      </nav>
    </aside>
  );
}
