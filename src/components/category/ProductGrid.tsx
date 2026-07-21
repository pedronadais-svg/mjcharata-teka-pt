'use client';

import { useState } from 'react';
import { LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product } from '@/lib/types';

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export function ProductGrid({ products, title }: ProductGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevancia');

  return (
    <div className="flex-1">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {title && (
            <h2 className="font-heading font-semibold text-lg text-teka-dark">{title}</h2>
          )}
          <span className="text-sm text-teka-gray">
            {products.length} artigo{products.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? 'relevancia')}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
              <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-teka-gray" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevancia">Relevância</SelectItem>
              <SelectItem value="nome-asc">Nome (A-Z)</SelectItem>
              <SelectItem value="nome-desc">Nome (Z-A)</SelectItem>
              <SelectItem value="energy">Classe Energética</SelectItem>
              <SelectItem value="novidades">Novidades</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:flex items-center border border-teka-border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-teka-dark text-white' : 'text-teka-gray hover:text-teka-dark'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 transition-colors ${view === 'list' ? 'bg-teka-dark text-white' : 'text-teka-gray hover:text-teka-dark'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className={
        view === 'grid'
          ? 'grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'
          : 'flex flex-col gap-4'
      }>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load more */}
      {products.length >= 6 && (
        <div className="mt-10 text-center">
          <Button variant="outline" size="lg" className="px-8">
            Carregar mais produtos
          </Button>
        </div>
      )}
    </div>
  );
}
