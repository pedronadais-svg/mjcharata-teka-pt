import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { articles } from '@/data/articles';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getArticleBySlug(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/inspiracao/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const shareUrlRaw = `https://teka-angola.com/inspiracao/${slug}`;
  const shareUrl = encodeURIComponent(shareUrlRaw);
  const shareTitle = encodeURIComponent(article.title);

  // Related articles: same category, excluding current
  const related = articles
    .filter((a) => a.id !== article.id && (a.category === article.category || a.tags.some((t) => article.tags.includes(t))))
    .slice(0, 3);

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Person', name: article.author },
    publisher: { '@type': 'Organization', name: 'Teka Angola' },
    image: article.image || undefined,
  };

  const formattedDate = new Date(article.date).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero image */}
      <div className="relative h-[200px] md:h-[300px] lg:h-[394px] bg-teka-dark overflow-hidden">
        {article.image && (
          <img
            src={article.image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <div className="relative h-full max-w-[1440px] mx-auto px-6 flex items-end pb-8">
          <div>
            <Badge variant="secondary" className="text-xs mb-3">{article.category}</Badge>
            <h1 className="font-heading font-bold text-2xl md:text-3xl lg:text-[30px] text-white leading-tight max-w-3xl">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs
          items={[
            { label: 'Inspiração', href: '/inspiracao' },
            { label: article.category, href: `/inspiracao?categoria=${encodeURIComponent(article.category)}` },
            { label: article.title },
          ]}
        />

        <div className="max-w-3xl mx-auto py-8">
          {/* Article meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-teka-gray mb-8 pb-6 border-b border-teka-border">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{article.readTime} de leitura</span>
            </div>
          </div>

          {/* Article content */}
          <div className="prose max-w-none">
            <p className="text-lg text-teka-charcoal leading-relaxed mb-6">
              {article.excerpt}
            </p>

            {article.content ? (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            ) : (
              <div className="space-y-4 text-teka-gray leading-relaxed">
                <p>
                  Este artigo faz parte da série de conteúdos de inspiração da Teka Angola,
                  dedicada a ajudar os nossos clientes a tirar o máximo partido dos seus
                  eletrodomésticos e a criar espaços funcionais e bonitos.
                </p>
                <p>
                  Para mais informações sobre os produtos mencionados neste artigo,
                  visite as páginas de produto correspondentes ou contacte a nossa equipa
                  de suporte.
                </p>
                <div className="not-prose my-8 p-6 bg-teka-light rounded border border-teka-border">
                  <p className="text-sm font-medium text-teka-dark">Precisa de ajuda?</p>
                  <p className="text-sm text-teka-gray mt-1">
                    Contacte-nos pelo telefone +244 933 302 752 ou por email para
                    teka@mdvmadeiras.com.
                  </p>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-teka-border not-prose">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-teka-border">
            <p className="text-sm font-semibold text-teka-dark mb-3">Partilhar este artigo</p>
            <div className="flex items-center gap-3">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Partilhar no Facebook"
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Partilhar no Twitter"
                className="w-9 h-9 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Partilhar no LinkedIn"
                className="w-9 h-9 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href={`mailto:?subject=${shareTitle}&body=${shareUrl}`} aria-label="Partilhar por email"
                className="w-9 h-9 rounded-full bg-teka-gray text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="py-10 border-t border-teka-border">
            <h2 className="font-heading font-bold text-xl text-teka-dark mb-6">Artigos Relacionados</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/inspiracao/${rel.slug}`}
                  className="group block bg-white rounded border border-teka-border hover:border-teka-red/30 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-teka-light overflow-hidden">
                    {rel.image && (
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{rel.category}</Badge>
                      <span className="text-xs text-teka-gray">{rel.readTime}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-sm text-teka-dark group-hover:text-teka-red transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="pb-10">
          <Link href="/inspiracao" className="inline-flex items-center gap-2 text-sm text-teka-gray hover:text-teka-red transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar à Inspiração
          </Link>
        </div>
      </div>
    </>
  );
}
