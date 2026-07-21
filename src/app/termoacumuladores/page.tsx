import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { getProductsBySubcategory, categories } from '@/data/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termoacumuladores Teka — Água Quente Eficiente',
  description: 'Termoacumuladores Teka em Angola. Soluções de água quente eficientes e fiáveis para toda a casa. Descubra a gama completa e peça o seu orçamento.',
  alternates: { canonical: '/termoacumuladores' },
  openGraph: {
    title: 'Termoacumuladores Teka — Água Quente Eficiente',
    description: 'Termoacumuladores Teka em Angola. Soluções de água quente eficientes e fiáveis para toda a casa. Descubra a gama completa e peça o seu orçamento.',
  },
};

export default function TermoacumuladoresPage() {
  const category = categories.find((c) => c.slug === 'termoacumuladores')!;
  const products = getProductsBySubcategory('termoacumuladores');

  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6">
          <span className="text-teka-red text-sm font-semibold uppercase tracking-wider">Categoria</span>
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white mt-2">
            {category.name}
          </h1>
          <p className="text-white/60 mt-3 max-w-lg text-lg">{category.description}</p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Termoacumuladores' }]} />

        <div className="py-8 pb-16">
          <p className="text-sm text-teka-gray mb-6">{products.length} produtos</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
