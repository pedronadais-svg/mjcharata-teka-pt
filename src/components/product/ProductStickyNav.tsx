'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ProductStickyNavProps {
  productName: string;
  sections: { id: string; label: string; hasContent: boolean }[];
  onBuyClick?: () => void;
  showBuy?: boolean;
}

export function ProductStickyNav({ productName, sections, onBuyClick, showBuy }: ProductStickyNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);

      for (const section of sections) {
        if (!section.hasContent) continue;
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-teka-border shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-14">
        <span className="font-heading font-bold text-sm text-teka-dark whitespace-nowrap mr-8 hidden md:block">
          {productName}
        </span>

        <nav className="flex items-center gap-6 overflow-x-auto flex-1">
          {sections.filter(s => s.hasContent).map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={`text-sm whitespace-nowrap py-4 border-b-2 transition-colors ${
                activeSection === section.id
                  ? 'border-teka-red text-teka-dark font-medium'
                  : 'border-transparent text-teka-gray hover:text-teka-dark'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {section.label}
            </a>
          ))}
        </nav>

        {showBuy && (
          <Button
            onClick={onBuyClick}
            className="bg-teka-red hover:bg-teka-red-dark text-white ml-6 shrink-0"
          >
            COMPRAR
          </Button>
        )}
      </div>
    </div>
  );
}
