import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { articles } from '@/data/articles';
import { CategoryFilter } from '@/components/inspiracao/CategoryFilter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dicas, Receitas e Tendências de Cozinha | Inspiração Teka',
  description: 'Artigos, receitas e tendências de cozinha e design em Angola. Inspire-se com guias Teka e transforme os seus espaços. Leia agora!',
  alternates: { canonical: '/inspiracao' },
  openGraph: {
    title: 'Dicas, Receitas e Tendências de Cozinha | Inspiração Teka',
    description: 'Artigos, receitas e tendências de cozinha e design em Angola. Inspire-se com guias Teka e transforme os seus espaços. Leia agora!',
  },
};

const ARTICLES_PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<{ categoria?: string; pagina?: string }>;
}

export default async function InspiracaoPage({ searchParams }: PageProps) {
  const { categoria, pagina } = await searchParams;
  const parsedPage = parseInt(pagina || '1', 10);

  const filtered = categoria && categoria !== 'Todos'
    ? articles.filter((a) => a.category === categoria)
    : articles;

  const totalPages = Math.ceil(filtered.length / ARTICLES_PER_PAGE);
  const page = (!parsedPage || parsedPage < 1) ? 1 : Math.min(parsedPage, totalPages || 1);
  const start = (page - 1) * ARTICLES_PER_PAGE;
  const pageArticles = filtered.slice(start, start + ARTICLES_PER_PAGE);

  const showFeatured = page === 1;
  const featured = showFeatured ? pageArticles[0] : null;
  const rest = showFeatured ? pageArticles.slice(1) : pageArticles;

  // Category counts for filter
  const counts: Record<string, number> = {};
  for (const a of articles) {
    counts[a.category] = (counts[a.category] || 0) + 1;
  }

  // Schema.org CollectionPage
  const listSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Inspiração Teka',
    description: 'Artigos, receitas e tendências de cozinha e design.',
    url: 'https://teka-angola.com/inspiracao',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://teka-angola.com/inspiracao/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
      />

      {/* Banner */}
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Inspiração
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Artigos, guias e projetos para transformar os seus espaços.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Inspiração' }]} />

        {/* Category Filters */}
        <div className="pt-2 pb-6">
          <CategoryFilter counts={counts} total={articles.length} />
        </div>

        {/* Featured Article */}
        {featured && (
          <Link
            href={`/inspiracao/${featured.slug}`}
            className="group block bg-white rounded border border-teka-border hover:border-teka-blue/30 hover:shadow-lg transition-all overflow-hidden mb-10"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-[16/10] md:aspect-auto bg-teka-light overflow-hidden">
                {featured.image ? (
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-full min-h-[250px] object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full min-h-[250px] bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
              </div>
              <div className="p-6 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-teka-blue text-white border-0 text-xs">Destaque</Badge>
                  <Badge variant="secondary" className="text-xs">{featured.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-teka-gray">
                    <Clock className="h-3 w-3" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="font-heading font-bold text-2xl lg:text-3xl text-teka-dark group-hover:text-teka-blue transition-colors">
                  {featured.title}
                </h2>
                <p className="text-teka-gray mt-3 leading-relaxed">{featured.excerpt}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-teka-blue">
                  <span>Ler artigo</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {rest.map((article) => (
            <Link
              key={article.id}
              href={`/inspiracao/${article.slug}`}
              className="group block bg-white rounded border border-teka-border hover:border-teka-blue/30 hover:shadow-lg transition-all overflow-hidden"
            >
              <div className="aspect-[16/10] bg-teka-light overflow-hidden">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                )}
              </div>
              <div className="p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                  <span className="flex items-center gap-1 text-xs text-teka-gray">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-lg text-teka-dark group-hover:text-teka-blue transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-teka-gray mt-2 line-clamp-2">{article.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pb-16">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/inspiracao?pagina=${p}${categoria ? `&categoria=${categoria}` : ''}`}
                className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-teka-blue text-white'
                    : 'bg-teka-light text-teka-gray hover:bg-teka-blue/10'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
