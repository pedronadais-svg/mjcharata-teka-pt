import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CategoryPageClient } from '@/components/category/CategoryPageClient';
import { categories, getProductsBySubcategory } from '@/data/products';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps { params: Promise<{ subcategoria: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategoria } = await params;
  const sub = categories.find(c => c.slug === 'lavandaria')?.subcategories.find(s => s.slug === subcategoria);
  if (!sub) return {};
  return { title: sub.name + ' — Lavandaria', description: sub.description, alternates: { canonical: '/lavandaria/' + subcategoria }, openGraph: { title: sub.name + ' — Lavandaria' } };
}

export function generateStaticParams() {
  return (categories.find(c => c.slug === 'lavandaria')?.subcategories ?? []).map(s => ({ subcategoria: s.slug }));
}

export default async function Page({ params }: PageProps) {
  const { subcategoria } = await params;
  const sub = categories.find(c => c.slug === 'lavandaria')?.subcategories.find(s => s.slug === subcategoria);
  if (!sub) notFound();
  const products = getProductsBySubcategory(sub.slug);
  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-7xl mx-auto px-6">
          <span className="text-teka-red text-sm font-semibold uppercase tracking-wider">Lavandaria</span>
          <h1 className="font-heading font-bold text-3xl lg:text-5xl text-white mt-2">{sub.name}</h1>
          <p className="text-white/60 mt-3 max-w-lg">{sub.description}</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Lavandaria', href: '/lavandaria' }, { label: sub.name }]} />
        <CategoryPageClient products={products} title={sub.name} />
      </div>
    </>
  );
}
