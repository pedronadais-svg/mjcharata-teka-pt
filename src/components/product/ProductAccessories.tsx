'use client';

import { products } from '@/data/products';
import { ProductCard } from './ProductCard';

interface ProductAccessoriesProps {
  productId: string;
  subcategory: string;
}

export function ProductAccessories({ productId, subcategory }: ProductAccessoriesProps) {
  // Find accessories: products in 'acessorios-de-cozinha' that are related, or same-category accessories
  const currentProduct = products.find(p => p.id === productId);
  const relatedIds = currentProduct?.relatedProductIds ?? [];

  const accessories = products.filter(p =>
    p.id !== productId &&
    (
      (p.subcategory === 'acessorios-de-cozinha' && relatedIds.includes(p.id)) ||
      (relatedIds.includes(p.id) && p.subcategory !== subcategory)
    )
  ).slice(0, 6);

  if (accessories.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading font-bold text-2xl text-teka-dark mb-6">
        Acessórios Compatíveis
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {accessories.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
