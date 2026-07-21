'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const banners = [
  {
    title: 'Cozinha de Sonho',
    description: 'Descubra como criar a cozinha perfeita com os eletrodomésticos Teka.',
    cta: 'Explorar Cozinha',
    href: '/cozinha',
    accent: 'bg-teka-red',
  },
  {
    title: 'Eficiência Energética',
    description: 'Produtos com a melhor classe energética para reduzir o consumo.',
    cta: 'Saber mais',
    href: '/guia-compras',
    accent: 'bg-teka-charcoal',
  },
];

export function PromotionalBanners() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-6">
          {banners.map((banner, i) => (
            <motion.div
              key={banner.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <Link
                href={banner.href}
                className="group relative block rounded-md overflow-hidden bg-teka-dark aspect-[2/1] min-h-[220px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
                <div className={`absolute top-0 right-0 w-1/2 h-full ${banner.accent} opacity-10 group-hover:opacity-15 transition-opacity`} />

                <div className="relative h-full flex flex-col justify-center p-8 lg:p-10">
                  <h3 className="font-heading font-bold text-2xl lg:text-3xl text-white">
                    {banner.title}
                  </h3>
                  <p className="mt-2 text-white/60 max-w-sm">
                    {banner.description}
                  </p>
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-teka-red group-hover:text-white transition-colors">
                      {banner.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
