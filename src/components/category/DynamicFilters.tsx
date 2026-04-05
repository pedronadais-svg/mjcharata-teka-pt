'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Product, FilterConfig } from '@/lib/types';

interface DynamicFiltersProps {
  products: Product[];
  filters: FilterConfig[];
  onFilter: (filtered: Product[]) => void;
}

export function DynamicFilters({ products, filters, onFilter }: DynamicFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleFilters = showMore ? filters : filters.filter(f => !f.hidden);
  const hiddenCount = filters.filter(f => f.hidden).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique values for each filter from products
  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    filters.forEach(filter => {
      const values = new Set<string>();
      products.forEach(product => {
        let val: string | undefined;
        if (filter.extractFrom === 'field') {
          val = (product as unknown as Record<string, unknown>)[filter.field] as string | undefined;
        } else if (filter.extractFrom === 'specs' && filter.specLabel) {
          val = product.specifications.find(s => s.label === filter.specLabel)?.value;
        }
        if (val && val.trim()) values.add(val.trim());
      });
      options[filter.id] = [...values].sort();
    });
    return options;
  }, [products, filters]);

  const applyFilters = useCallback((newFilters: Record<string, string[]>) => {
    const filtered = products.filter(product => {
      return Object.entries(newFilters).every(([filterId, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const filterConfig = filters.find(f => f.id === filterId);
        if (!filterConfig) return true;

        let productValue: string | undefined;
        if (filterConfig.extractFrom === 'field') {
          productValue = (product as unknown as Record<string, unknown>)[filterConfig.field] as string | undefined;
        } else if (filterConfig.extractFrom === 'specs' && filterConfig.specLabel) {
          productValue = product.specifications.find(s => s.label === filterConfig.specLabel)?.value;
        }
        return productValue ? selectedValues.includes(productValue.trim()) : false;
      });
    });
    onFilter(filtered);
  }, [products, filters, onFilter]);

  const toggleValue = (filterId: string, value: string) => {
    setActiveFilters(prev => {
      const current = prev[filterId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      const next = { ...prev, [filterId]: updated };
      applyFilters(next);
      return next;
    });
  };

  const clearAll = () => {
    setActiveFilters({});
    onFilter(products);
  };

  const totalActive = Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="mb-6" ref={dropdownRef}>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {visibleFilters.map(filter => {
          const options = filterOptions[filter.id] || [];
          if (options.length === 0) return null;
          const isOpen = openDropdown === filter.id;
          const activeCount = (activeFilters[filter.id] || []).length;

          return (
            <div key={filter.id} className="relative">
              <button
                onClick={() => setOpenDropdown(isOpen ? null : filter.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded text-sm transition-colors ${
                  activeCount > 0
                    ? 'border-teka-blue bg-teka-blue/5 text-teka-blue'
                    : 'border-teka-border text-teka-charcoal hover:border-teka-gray'
                }`}
              >
                {filter.label}
                {activeCount > 0 && (
                  <span className="bg-teka-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-teka-border rounded shadow-lg p-4 min-w-[220px] max-h-[300px] overflow-y-auto">
                  <div className="space-y-2">
                    {options.map(value => {
                      const isChecked = (activeFilters[filter.id] || []).includes(value);
                      return (
                        <label key={value} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-teka-blue border-teka-blue' : 'border-teka-border group-hover:border-teka-gray'
                          }`}>
                            {isChecked && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleValue(filter.id, value)}
                            className="sr-only"
                          />
                          <span className="text-sm text-teka-charcoal">{value}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setOpenDropdown(null)}
                    className="mt-4 w-full bg-teka-dark text-white text-sm font-medium py-2 rounded hover:bg-teka-charcoal transition-colors"
                  >
                    FECHAR
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {totalActive > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-teka-gray hover:text-teka-dark underline transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Ver mais / menos filtros */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-3 text-sm text-teka-gray hover:text-teka-dark transition-colors flex items-center gap-1"
        >
          {showMore ? 'Ver menos filtros' : 'Ver mais filtros'}
          <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
