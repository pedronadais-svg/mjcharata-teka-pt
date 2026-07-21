'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductSpecification, ProductFeature } from '@/lib/types';

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
  features: ProductFeature[];
  featureIcons?: string[];
}

const GROUP_ORDER = [
  'Medidas interiores', 'Medidas gerais', 'Características particulares',
  'Ligação elétrica', 'Consumo de energia', 'Sistema de segurança',
  'Sistema de limpeza', 'Acessórios', 'Eficiência energética',
  'Características técnicas', 'Instalação', 'Geral',
];

function SpecAccordion({ title, specs }: { title: string; specs: ProductSpecification[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-teka-light/50 transition-colors group"
        aria-expanded={isOpen}
      >
        <span className="font-heading font-medium text-sm text-teka-dark group-hover:text-teka-red transition-colors text-left">
          {title}
        </span>
        <span className="shrink-0 ml-4 text-teka-gray group-hover:text-teka-red transition-colors">
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-0 border-t border-teka-border">
              {specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className={`flex items-center justify-between py-2.5 text-sm ${
                    i < specs.length - 1 ? 'border-b border-teka-border/50' : ''
                  }`}
                >
                  <span className="text-teka-gray">{spec.label}</span>
                  <span className="font-medium text-teka-dark text-right ml-4">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductSpecifications({ specifications, features, featureIcons = [] }: ProductSpecificationsProps) {
  const groups = new Map<string, ProductSpecification[]>();
  const ungrouped: ProductSpecification[] = [];

  specifications.forEach((spec) => {
    if (spec.group) {
      if (!groups.has(spec.group)) groups.set(spec.group, []);
      groups.get(spec.group)!.push(spec);
    } else {
      ungrouped.push(spec);
    }
  });

  if (ungrouped.length > 0) {
    groups.set('Geral', ungrouped);
  }

  const sortedGroups = [...groups.entries()].sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a[0]);
    const ib = GROUP_ORDER.indexOf(b[0]);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  return (
    <div className="space-y-8">
      <h2 className="font-heading font-bold text-2xl text-teka-dark">
        Especificações
      </h2>

      {/* Feature bullets em 2 colunas */}
      {features.length > 0 && (
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-1.5">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-2 py-1">
              <span className="text-teka-gray mt-0.5 text-xs">▪</span>
              <span className="text-sm text-teka-dark leading-relaxed">
                {f.title}{f.description ? `: ${f.description}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Ícones de features */}
      {featureIcons.length > 0 && (
        <div className="flex items-center gap-6 py-4 border-t border-b border-teka-border">
          {featureIcons.map((icon, i) => (
            <div key={i} className="w-12 h-12 relative opacity-60 hover:opacity-100 transition-opacity">
              <img src={icon} alt="" width={48} height={48} className="object-contain" />
            </div>
          ))}
        </div>
      )}

      {/* Grid de Acordeões */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-teka-border border border-teka-border">
        {sortedGroups.map(([groupName, specs]) => (
          <SpecAccordion key={groupName} title={groupName} specs={specs} />
        ))}
      </div>
    </div>
  );
}
