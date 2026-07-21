'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Product } from '@/lib/types';

interface CategoryFiltersProps {
  products: Product[];
  onFilter: (filtered: Product[]) => void;
}

interface FilterState {
  energy: string[];
  color: string[];
}

function extractFilterOptions(products: Product[]) {
  const energySet = new Set<string>();
  const colorSet = new Set<string>();

  products.forEach((p) => {
    if (p.energyRating) energySet.add(p.energyRating);
    const name = p.name.toLowerCase();
    if (name.includes('inox') || name.includes(' ss')) colorSet.add('Aço Inoxidável');
    if (name.includes('preto') || name.includes(' bk') || name.includes('gbk') || name.includes('fbk')) colorSet.add('Preto');
    if (name.includes('branco') || name.includes(' wh')) colorSet.add('Branco');
  });

  return {
    energy: [...energySet].sort(),
    color: [...colorSet].sort(),
  };
}

function FilterPanel({
  options,
  activeFilters,
  onToggle,
  onClear,
}: {
  options: ReturnType<typeof extractFilterOptions>;
  activeFilters: FilterState;
  onToggle: (group: keyof FilterState, value: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ energy: true, color: true });
  const totalActive = Object.values(activeFilters).flat().length;

  const sections = [
    { id: 'energy' as const, label: 'Classe Energética', items: options.energy },
    { id: 'color' as const, label: 'Cor / Acabamento', items: options.color },
  ];

  return (
    <div className="space-y-5">
      {totalActive > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-teka-dark">{totalActive} filtro{totalActive > 1 ? 's' : ''}</span>
          <button onClick={onClear} className="text-xs text-teka-red hover:text-teka-red-dark transition-colors">Limpar</button>
        </div>
      )}
      {sections.map((section) => {
        if (section.items.length === 0) return null;
        return (
          <div key={section.id} className="border-b border-teka-border pb-4 last:border-0">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
              className="w-full flex items-center justify-between py-2"
            >
              <span className="text-sm font-semibold text-teka-dark">{section.label}</span>
              <ChevronDown className={`h-4 w-4 text-teka-gray transition-transform ${expanded[section.id] ? 'rotate-180' : ''}`} />
            </button>
            {expanded[section.id] && (
              <div className="mt-2 space-y-2">
                {section.items.map((value) => {
                  const isActive = activeFilters[section.id].includes(value);
                  return (
                    <button key={value} onClick={() => onToggle(section.id, value)} className="flex items-center gap-3 w-full text-left group">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-teka-red border-teka-red' : 'border-teka-border group-hover:border-teka-gray'}`}>
                        {isActive && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className="text-sm text-teka-charcoal">{value}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CategoryFilters({ products, onFilter }: CategoryFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<FilterState>({ energy: [], color: [] });
  const options = useMemo(() => extractFilterOptions(products), [products]);

  const handleToggle = (group: keyof FilterState, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[group];
      const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      const next = { ...prev, [group]: updated };
      const filtered = products.filter((p) => {
        if (next.energy.length > 0 && (!p.energyRating || !next.energy.includes(p.energyRating))) return false;
        if (next.color.length > 0) {
          const name = p.name.toLowerCase();
          const matchesColor = next.color.some((c) => {
            if (c === 'Aço Inoxidável') return name.includes('inox') || name.includes(' ss');
            if (c === 'Preto') return name.includes('preto') || name.includes(' bk') || name.includes('gbk') || name.includes('fbk');
            if (c === 'Branco') return name.includes('branco') || name.includes(' wh');
            return false;
          });
          if (!matchesColor) return false;
        }
        return true;
      });
      onFilter(filtered);
      return next;
    });
  };

  const handleClear = () => { setActiveFilters({ energy: [], color: [] }); onFilter(products); };
  const totalActive = Object.values(activeFilters).flat().length;

  return (
    <>
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24">
          <h2 className="font-heading font-bold text-base text-teka-dark mb-4">Filtros</h2>
          <FilterPanel options={options} activeFilters={activeFilters} onToggle={handleToggle} onClear={handleClear} />
        </div>
      </aside>
      <div className="lg:hidden mb-4">
        <Sheet>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-teka-border rounded text-sm font-medium hover:bg-teka-light transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {totalActive > 0 && <Badge className="bg-teka-red text-white border-0 text-xs ml-1">{totalActive}</Badge>}
          </button>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader><SheetTitle>Filtros</SheetTitle></SheetHeader>
            <div className="mt-6">
              <FilterPanel options={options} activeFilters={activeFilters} onToggle={handleToggle} onClear={handleClear} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
