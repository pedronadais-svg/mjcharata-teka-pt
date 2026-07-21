import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { categories, getProductsBySubcategory } from '@/data/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cozinha — Fornos, Placas, Exaustores e mais',
  description: 'Descubra a gama completa de eletrodomésticos de cozinha Teka. Fornos pirolíticos, placas de indução, exaustores decorativos e muito mais. Qualidade alemã em Angola.',
  alternates: { canonical: '/cozinha' },
  openGraph: {
    title: 'Cozinha — Fornos, Placas, Exaustores | Teka Angola',
    description: 'Gama completa de eletrodomésticos de cozinha Teka. Qualidade alemã em Angola.',
  },
};

export default function CozinhaPage() {
  const category = categories.find((c) => c.slug === 'cozinha')!;
  const visibleSubs = category.subcategories.filter(
    (sub) => getProductsBySubcategory(sub.slug).length > 0
  );

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
        <Breadcrumbs items={[{ label: 'Cozinha' }]} />

        <div className="py-8 lg:py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {visibleSubs.map((sub) => {
              const familyProducts = getProductsBySubcategory(sub.slug);
              const coverImage = familyProducts.find((p) => p.thumbnail)?.thumbnail;
              return (
                <Link
                  key={sub.slug}
                  href={`/cozinha/${sub.slug}`}
                  className="group block bg-white hover:opacity-95 transition-opacity duration-300 overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-teka-light overflow-hidden flex items-center justify-center">
                    {coverImage ? (
                      <Image
                        src={coverImage}
                        alt={sub.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div className="p-4 lg:p-5">
                    <h2 className="font-heading font-semibold text-teka-dark group-hover:text-teka-red transition-colors">
                      {sub.name}
                    </h2>
                    <p className="text-sm text-teka-gray mt-1 line-clamp-2">{sub.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-teka-gray">{familyProducts.length} artigos</span>
                      <ArrowRight className="h-4 w-4 text-teka-red opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
