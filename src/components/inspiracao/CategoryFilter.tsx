'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const categories = ['Todos', 'Cozinhar', 'Dicas', 'Inovação', 'Design', 'Curiosidades'] as const;

interface CategoryFilterProps {
  counts: Record<string, number>;
  total: number;
}

function CategoryFilterInner({ counts, total }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get('categoria') || 'Todos';

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            if (cat === 'Todos') {
              params.delete('categoria');
            } else {
              params.set('categoria', cat);
            }
            params.delete('pagina');
            router.push(`/inspiracao?${params.toString()}`);
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-teka-blue text-white'
              : 'bg-teka-light text-teka-gray hover:bg-teka-blue/10 hover:text-teka-blue'
          }`}
        >
          {cat}
          <span className="ml-1.5 text-xs opacity-70">
            ({cat === 'Todos' ? total : (counts[cat] || 0)})
          </span>
        </button>
      ))}
    </div>
  );
}

export function CategoryFilter(props: CategoryFilterProps) {
  return (
    <Suspense fallback={<div className="h-10" />}>
      <CategoryFilterInner {...props} />
    </Suspense>
  );
}
