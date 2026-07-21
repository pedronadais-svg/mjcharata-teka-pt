import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faqs } from '@/data/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | FAQ Teka Angola',
  description: 'Respostas às perguntas mais frequentes sobre produtos, garantias e assistência Teka em Angola. Encontre a solução para a sua dúvida.',
  alternates: { canonical: '/suporte/faq' },
  openGraph: {
    title: 'Perguntas Frequentes | FAQ Teka Angola',
    description: 'Respostas às perguntas mais frequentes sobre produtos, garantias e assistência Teka em Angola. Encontre a solução para a sua dúvida.',
  },
};

export default function FAQPage() {
  const faqCategories = [...new Set(faqs.map((f) => f.category))];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="relative bg-teka-dark py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Perguntas Frequentes
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">
            Encontre respostas rápidas às dúvidas mais comuns.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Suporte', href: '/suporte' }, { label: 'FAQ' }]} />

        <div className="max-w-3xl mx-auto py-8 pb-16 space-y-10">
          {faqCategories.map((category) => (
            <div key={category}>
              <h2 className="font-heading font-bold text-xl text-teka-dark mb-4">{category}</h2>
              <Accordion className="space-y-3">
                {faqs
                  .filter((f) => f.category === category)
                  .map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border border-teka-border rounded px-5 data-[state=open]:border-teka-red/30 transition-all"
                    >
                      <AccordionTrigger className="text-sm font-semibold text-teka-dark hover:text-teka-red py-4 [&[data-state=open]]:text-teka-red">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-teka-gray pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
