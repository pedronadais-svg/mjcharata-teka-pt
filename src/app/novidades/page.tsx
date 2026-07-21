import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { getNewProducts } from '@/data/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Novidades e Últimos Lançamentos Teka Angola',
  description: 'Descubra as novidades e últimos lançamentos Teka em Angola. Eletrodomésticos com tecnologia alemã de ponta. Veja os novos produtos agora!',
  alternates: { canonical: '/novidades' },
  openGraph: {
    title: 'Novidades e Últimos Lançamentos Teka Angola',
    description: 'Descubra as novidades e últimos lançamentos Teka em Angola. Eletrodomésticos com tecnologia alemã de ponta. Veja os novos produtos agora!',
  },
};

export default function NovidadesPage() {
  const newProducts = getNewProducts();

  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <span className="inline-block px-3 py-1 bg-teka-red/20 text-teka-red text-xs font-semibold uppercase tracking-wider rounded-full border border-teka-red/30 mb-4">
            Últimos Lançamentos
          </span>
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Novidades Teka
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Os produtos mais recentes com a mais avançada tecnologia alemã.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Novidades' }]} />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 py-8 pb-16">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </>
  );
}
