import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { articles } from '@/data/articles';
import { InspirationCard } from './InspirationCard';

export function InspirationSection() {
  const displayArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-teka-dark">
              Inspiração
            </h2>
            <p className="mt-3 text-teka-gray">
              Artigos, guias e tendências para o seu espaço.
            </p>
          </div>
          <Link
            href="/inspiracao"
            className="inline-flex items-center gap-2 text-sm font-medium text-teka-red hover:text-teka-red-dark transition-colors"
          >
            Ver todos os artigos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {displayArticles.map((article, i) => (
            <InspirationCard key={article.id} article={article} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
