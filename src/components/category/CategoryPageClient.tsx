'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { CategorySidebar } from './CategorySidebar';
import { DynamicFilters } from './DynamicFilters';
import { ProductGrid } from './ProductGrid';
import { getFiltersForFamily } from '@/data/filter-config';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Product } from '@/lib/types';

interface CategoryPageClientProps {
  products: Product[];
  title: string;
  categorySlug?: string;
  familySlug?: string;
}

export function CategoryPageClient({ products, title, categorySlug, familySlug }: CategoryPageClientProps) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [mobileOpen, setMobileOpen] = useState(false);
  const filters = familySlug ? getFiltersForFamily(familySlug) : [];

  return (
    <div className="flex gap-8 pb-16">
      {categorySlug && <CategorySidebar categorySlug={categorySlug} />}

      <div className="flex-1 min-w-0">
        {categorySlug && (
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teka-dark text-white rounded text-sm font-medium"
            >
              <SlidersHorizontal className="h-4 w-4" />
              FILTROS
            </button>
          </div>
        )}

        {filters.length > 0 && (
          <div className="hidden lg:block">
            <DynamicFilters
              products={products}
              filters={filters}
              onFilter={setFilteredProducts}
            />
          </div>
        )}

        <p className="text-sm text-teka-gray mb-4">
          {filteredProducts.length} artigo{filteredProducts.length !== 1 ? 's' : ''}
        </p>

        <ProductGrid products={filteredProducts} title={title} />
      </div>

      {categorySlug && (
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6 space-y-6">
              <CategorySidebar categorySlug={categorySlug} mobile />
              {filters.length > 0 && (
                <>
                  <hr className="border-teka-border" />
                  <DynamicFilters
                    products={products}
                    filters={filters}
                    onFilter={setFilteredProducts}
                  />
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
