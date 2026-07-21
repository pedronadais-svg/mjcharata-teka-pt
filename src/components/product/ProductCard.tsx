'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const thumbnail = product.thumbnail || product.images?.[0] || '';

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block bg-white hover:opacity-95 transition-opacity duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-teka-light overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-teka-gray/30">
            <span className="text-xs text-center px-4">{product.name}</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {product.isNew && (
            <Badge className="bg-teka-red text-white border-0 text-[10px] rounded">NOVO</Badge>
          )}
          {product.energyRating && (
            <Badge variant="secondary" className="text-xs font-semibold">
              <Zap className="h-3 w-3 mr-1" />
              {product.energyRating}
            </Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 lg:p-5">
        <p className="text-xs text-teka-gray font-medium uppercase tracking-wide">
          {product.subcategory}
        </p>
        <h3 className="font-heading font-semibold text-teka-dark mt-1 group-hover:text-teka-red transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-teka-gray mt-2 line-clamp-2">
          {product.shortDescription}
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-teka-red">
          <span>Ver detalhes</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
