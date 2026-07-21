'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { HelpCircle, Shield, Wrench, FileText, Mail, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  HelpCircle, Shield, Wrench, FileText, Mail,
};

const supportItems = [
  { title: 'Perguntas Frequentes', description: 'Encontre respostas rápidas.', icon: 'HelpCircle', href: '/suporte/faq' },
  { title: 'Garantias', description: 'Registe e consulte garantias.', icon: 'Shield', href: '/suporte/garantias' },
  { title: 'Assistência Técnica', description: 'Agende assistência técnica.', icon: 'Wrench', href: '/suporte/assistencia-tecnica' },
  { title: 'Manuais e Downloads', description: 'Descarregue documentação.', icon: 'FileText', href: '/downloads' },
  { title: 'Contacto', description: 'Fale connosco.', icon: 'Mail', href: '/suporte/contacto' },
];

export function SupportSection() {
  return (
    <section className="py-16 lg:py-24 bg-teka-light">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-teka-dark">
            Suporte ao Cliente
          </h2>
          <p className="mt-3 text-teka-gray max-w-xl mx-auto">
            Estamos aqui para ajudar. Encontre assistência, documentação e respostas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {supportItems.map((item, i) => {
            const Icon = iconMap[item.icon] || HelpCircle;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  href={item.href}
                  className="group flex flex-col items-center text-center p-6 bg-white rounded border border-teka-border hover:border-teka-red/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-teka-red/10 flex items-center justify-center mb-4 group-hover:bg-teka-red/20 transition-colors">
                    <Icon className="h-5 w-5 text-teka-red" />
                  </div>
                  <h3 className="font-heading font-semibold text-sm text-teka-dark group-hover:text-teka-red transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-teka-gray mt-1">{item.description}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/suporte"
            className="inline-flex items-center gap-2 text-sm font-medium text-teka-red hover:text-teka-red-dark transition-colors"
          >
            Ver todo o suporte
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
