'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/lib/types';

interface InspirationCardProps {
  article: Article;
  index: number;
}

export function InspirationCard({ article, index }: InspirationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        href={`/inspiracao/${article.slug}`}
        className="group block bg-white rounded border border-teka-border hover:border-teka-blue/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
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
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
            <span className="flex items-center gap-1 text-xs text-teka-gray">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </span>
          </div>
          <h3 className="font-heading font-semibold text-lg text-teka-dark group-hover:text-teka-blue transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-teka-gray mt-2 line-clamp-2">
            {article.excerpt}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
