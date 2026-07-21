import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { BrandValues } from '@/components/home/BrandValues';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromotionalBanners } from '@/components/home/PromotionalBanners';
import { InspirationSection } from '@/components/home/InspirationSection';
import { SupportSection } from '@/components/home/SupportSection';

export const metadata: Metadata = {
  title: 'Eletrodomésticos de Cozinha & Lavandaria | Teka Angola',
  description: 'Fornos, Placas, Exaustores, Frigoríficos, Máquinas de Lavar — Eletrodomésticos Teka de qualidade alemã. Entrega em Angola. Distribuído por MDV.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <div className="-mt-[54px]">
        <HeroSection />
      </div>
      <BrandValues />
      <CategoriesSection />
      <FeaturedProducts />
      <PromotionalBanners />
      <InspirationSection />
      <SupportSection />
    </>
  );
}
