'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { getFeaturedProducts, getNewProducts } from '@/data/products';

export function FeaturedProducts() {
  const featured = getFeaturedProducts();
  const newProducts = getNewProducts();
  const displayProducts = [...new Map([...featured, ...newProducts].map(p => [p.id, p])).values()].slice(0, 4);

  return (
    <section className="py-16 lg:py-24 bg-teka-light">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="font-heading font-bold text-3xl lg:text-4xl text-teka-dark">
              Produtos em Destaque
            </h2>
            <p className="mt-3 text-teka-gray">
              As nossas recomendações e novidades mais recentes.
            </p>
          </div>
          <Link
            href="/novidades"
            className="inline-flex items-center gap-2 text-sm font-medium text-teka-red hover:text-teka-red-dark transition-colors"
          >
            Ver todos os produtos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
