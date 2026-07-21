import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CategoryPageClient } from '@/components/category/CategoryPageClient';
import { categories, products as allProducts } from '@/data/products';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ subcategoria: string; subfamilia: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subcategoria, subfamilia } = await params;
  const category = categories.find((c) => c.slug === 'cozinha');
  const sub = category?.subcategories.find((s) => s.slug === subcategoria);
  const child = sub?.children?.find((c) => c.slug === subfamilia);
  if (!sub || !child) return {};
  return {
    title: `${child.name} — ${sub.name} — Cozinha`,
    description: `${child.name} da família ${sub.name} Teka`,
    alternates: { canonical: `/cozinha/${subcategoria}/${subfamilia}` },
  };
}

export function generateStaticParams() {
  const category = categories.find((c) => c.slug === 'cozinha');
  const params: { subcategoria: string; subfamilia: string }[] = [];
  for (const sub of category?.subcategories ?? []) {
    for (const child of sub.children ?? []) {
      params.push({ subcategoria: sub.slug, subfamilia: child.slug });
    }
  }
  return params;
}

export default async function SubfamilyPage({ params }: PageProps) {
  const { subcategoria, subfamilia } = await params;
  const category = categories.find((c) => c.slug === 'cozinha');
  const sub = category?.subcategories.find((s) => s.slug === subcategoria);
  const child = sub?.children?.find((c) => c.slug === subfamilia);

  if (!sub || !child) notFound();

  const products = allProducts.filter(
    (p) => p.subcategory === sub.slug && p.subfamily === child.slug
  );

  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6">
          <span className="text-teka-red text-sm font-semibold uppercase tracking-wider">Cozinha &gt; {sub.name}</span>
          <h1 className="font-heading font-bold text-3xl lg:text-5xl text-white mt-2">{child.name}</h1>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[
          { label: 'Cozinha', href: '/cozinha' },
          { label: sub.name, href: `/cozinha/${subcategoria}` },
          { label: child.name },
        ]} />
        <CategoryPageClient
          products={products}
          title={child.name}
          categorySlug="cozinha"
          familySlug={sub.slug}
        />
      </div>
    </>
  );
}
