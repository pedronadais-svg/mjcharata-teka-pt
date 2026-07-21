import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { categories, getProductsBySubcategory } from '@/data/products';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps { params: Promise<{ subcategoria: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategoria } = await params;
  const sub = categories.find(c => c.slug === 'ar-condicionado')?.subcategories.find(s => s.slug === subcategoria);
  if (!sub) return {};
  return { title: sub.name + ' — Ar Condicionado AUREA', description: sub.description, alternates: { canonical: '/ar-condicionado/' + subcategoria }, openGraph: { title: sub.name + ' — Ar Condicionado AUREA' } };
}

export function generateStaticParams() {
  return (categories.find(c => c.slug === 'ar-condicionado')?.subcategories ?? []).map(s => ({ subcategoria: s.slug }));
}

export default async function Page({ params }: PageProps) {
  const { subcategoria } = await params;
  const sub = categories.find(c => c.slug === 'ar-condicionado')?.subcategories.find(s => s.slug === subcategoria);
  if (!sub) notFound();
  const products = getProductsBySubcategory(sub.slug);
  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-7xl mx-auto px-6">
          <span className="text-teka-red text-sm font-semibold uppercase tracking-wider">Ar Condicionado AUREA</span>
          <h1 className="font-heading font-bold text-3xl lg:text-5xl text-white mt-2">{sub.name}</h1>
          <p className="text-white/60 mt-3 max-w-lg">{sub.description}</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Ar Condicionado', href: '/ar-condicionado' }, { label: sub.name }]} />
        <div className="py-8 pb-16">
          <p className="text-sm text-teka-gray mb-6">{products.length} produtos</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </div>
    </>
  );
}
