'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  reference: string;
  subcategory: string;
  image: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const doSearch = useCallback((q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(res => res.json())
      .then(data => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 bg-white z-50 shadow-xl">
            <div className="max-w-[1440px] mx-auto px-6 py-4">
              <div className="relative flex items-center gap-3">
                <Search className="h-5 w-5 text-teka-gray shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Pesquisar por nome, referência, EAN ou categoria..."
                  aria-label="Pesquisar produtos"
                  className="flex-1 py-3 text-base bg-transparent focus:outline-none placeholder:text-teka-gray/60"
                />
                <button aria-label="Fechar pesquisa" onClick={onClose} className="p-2 hover:bg-teka-light rounded transition-colors">
                  <X className="h-5 w-5 text-teka-gray" />
                </button>
              </div>

              {query.length >= 2 && (
                <div className="border-t border-teka-border mt-2 pt-4 pb-2 max-h-[60vh] overflow-y-auto">
                  {loading ? (
                    <p className="text-sm text-teka-gray py-4 text-center">A pesquisar...</p>
                  ) : results.length === 0 ? (
                    <p className="text-sm text-teka-gray py-4 text-center">
                      Nenhum resultado para &ldquo;{query}&rdquo;
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-teka-gray mb-3">{results.length} resultado{results.length !== 1 ? 's' : ''}</p>
                      <div className="space-y-1">
                        {results.map((product) => (
                          <Link key={product.id} href={`/produto/${product.slug}`} onClick={onClose}
                            className="flex items-center gap-4 p-3 rounded hover:bg-teka-light transition-colors group">
                            <div className="relative w-12 h-12 bg-teka-light rounded shrink-0 overflow-hidden">
                              {product.image ? (
                                <Image src={product.image} alt="" fill sizes="48px" className="object-contain p-1" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-teka-gray/30 text-[8px]">—</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-teka-dark group-hover:text-teka-red transition-colors truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-teka-gray">{product.reference} · {product.subcategory}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-teka-gray/30 group-hover:text-teka-red shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
