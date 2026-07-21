import Link from 'next/link';
import { HelpCircle, Shield, Wrench, FileText, Mail, Phone, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { faqs, supportSections } from '@/data/articles';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suporte ao Cliente — FAQ, Garantias, Assistência',
  description: 'Centro de suporte Teka Angola. Consulte FAQ, garantias, assistência técnica e manuais. Resolva as suas dúvidas de forma rápida.',
  alternates: { canonical: '/suporte' },
  openGraph: {
    title: 'Suporte ao Cliente — FAQ, Garantias, Assistência',
    description: 'Centro de suporte Teka Angola. Consulte FAQ, garantias, assistência técnica e manuais. Resolva as suas dúvidas de forma rápida.',
  },
};

const iconMap: Record<string, React.ElementType> = { HelpCircle, Shield, Wrench, FileText, Mail };

export default function SuportePage() {
  return (
    <>
      {/* Banner */}
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Suporte ao Cliente
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Estamos aqui para ajudar. Encontre respostas, documentação e assistência.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Suporte' }]} />

        {/* Support Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-8">
          {supportSections.map((section) => {
            const Icon = iconMap[section.icon] || HelpCircle;
            return (
              <Link
                key={section.id}
                href={section.href}
                className="group flex flex-col items-center text-center p-6 bg-white rounded border border-teka-border hover:border-teka-red/30 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-teka-red/10 flex items-center justify-center mb-4 group-hover:bg-teka-red/20 transition-colors">
                  <Icon className="h-6 w-6 text-teka-red" />
                </div>
                <h2 className="font-heading font-semibold text-sm text-teka-dark group-hover:text-teka-red transition-colors">
                  {section.title}
                </h2>
                <p className="text-xs text-teka-gray mt-1">{section.description}</p>
              </Link>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="py-12 lg:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-teka-dark text-center mb-8">
              Perguntas Frequentes
            </h2>
            <Accordion className="space-y-3">
              {faqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border border-teka-border rounded px-5 data-[state=open]:border-teka-red/30 data-[state=open]:shadow-sm transition-all"
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
        </div>

        {/* Contact Block */}
        <div className="py-12 lg:py-16 border-t border-teka-border">
          <div className="bg-teka-dark rounded-md p-8 lg:p-12 text-center">
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-white">
              Precisa de ajuda adicional?
            </h2>
            <p className="text-white/60 mt-3 max-w-lg mx-auto">
              A nossa equipa de suporte está disponível para ajudar com qualquer questão.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+244933302752"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded-lg transition-colors"
              >
                <Phone className="h-4 w-4" />
                +244 933 302 752
              </a>
              <Link
                href="/suporte/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-medium rounded-lg transition-colors"
              >
                <Mail className="h-4 w-4" />
                Enviar mensagem
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
