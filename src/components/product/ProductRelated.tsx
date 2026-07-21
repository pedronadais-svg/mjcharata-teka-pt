import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

interface ProductRelatedProps {
  currentProductId: string;
  relatedIds: string[];
  subcategory?: string;
}

export function ProductRelated({ currentProductId, relatedIds, subcategory }: ProductRelatedProps) {
  // Try explicit related products first
  let related = products.filter(
    (p) => relatedIds.includes(p.id) && p.id !== currentProductId
  );

  // Fallback: same subcategory products
  if (related.length < 3 && subcategory) {
    const sameSubcategory = products.filter(
      (p) => p.subcategory === subcategory && p.id !== currentProductId && !relatedIds.includes(p.id)
    );
    related = [...related, ...sameSubcategory].slice(0, 6);
  }

  if (!related.length) return null;

  return (
    <div>
      <h3 className="font-heading font-bold text-xl text-teka-dark mb-6">
        Produtos Relacionados
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {related.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
