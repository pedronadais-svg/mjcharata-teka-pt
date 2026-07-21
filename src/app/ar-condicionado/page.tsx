import Link from 'next/link';
import { ArrowRight, Wind, Thermometer, Wifi, Shield, Leaf, Volume2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { categories, getProductsBySubcategory } from '@/data/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ar Condicionado AUREA — Climatização Inteligente',
  description: 'Ar condicionado Teka AUREA em Angola. Mono-Split e Multi-Split com ionizador, HEPA, DC Inverter e Wi-Fi. Peça já o seu orçamento.',
  alternates: { canonical: '/ar-condicionado' },
  openGraph: {
    title: 'Ar Condicionado AUREA — Climatização Inteligente',
    description: 'Ar condicionado Teka AUREA em Angola. Mono-Split e Multi-Split com ionizador, HEPA, DC Inverter e Wi-Fi. Peça já o seu orçamento.',
  },
};

const features = [
  { icon: Wind, title: 'Ionizador + HEPA', desc: 'Ar purificado e saudável' },
  { icon: Thermometer, title: 'DC Inverter', desc: 'Eficiência e silêncio' },
  { icon: Wifi, title: 'Smart Home App', desc: 'Controlo via smartphone' },
  { icon: Shield, title: 'Golden Fin', desc: 'Durabilidade superior' },
  { icon: Leaf, title: 'R32 Ecológico', desc: 'Baixo impacto ambiental' },
  { icon: Volume2, title: 'Desde 19 dB(A)', desc: 'Ultra silencioso' },
];

export default function ArCondicionadoPage() {
  const category = categories.find((c) => c.slug === 'ar-condicionado')!;
  const monoSplit = getProductsBySubcategory('mono-split');
  const multiSplit = getProductsBySubcategory('multi-split');

  return (
    <>
      {/* Hero Banner */}
      <section className="relative bg-teka-dark py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal via-teka-dark to-[#0a1628]" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(46,163,242,0.4) 0%, transparent 50%)',
        }} />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <span className="inline-block px-4 py-1.5 bg-teka-red/20 text-teka-red text-xs font-bold uppercase tracking-widest rounded-full border border-teka-red/30 mb-6">
            Nova Gama
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1]">
            AUREA
          </h1>
          <p className="text-xl text-teka-red font-medium mt-2">Ar Condicionado</p>
          <p className="text-white/60 mt-6 max-w-xl mx-auto text-lg leading-relaxed">
            Harmonia perfeita. Puro conforto. Arrefecimento inteligente para uma vida mais saudável.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a
              href="/documents/ar-condicionado/catalogo-aurea.pdf"
              className="inline-flex items-center gap-2 px-7 py-3 bg-teka-red hover:bg-teka-red-dark text-white text-sm font-semibold rounded transition-colors"
            >
              Descarregar Catálogo
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="#produtos"
              className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white/30 text-white hover:bg-white/10 text-sm font-semibold rounded transition-colors"
            >
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Ar Condicionado' }]} />

        {/* Features Grid */}
        <div className="py-12 border-b border-teka-border">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teka-red/10 mb-3">
                  <f.icon className="h-5 w-5 text-teka-red" />
                </div>
                <h3 className="font-heading font-semibold text-sm text-teka-dark">{f.title}</h3>
                <p className="text-xs text-teka-gray mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Simulator CTA */}
        <div className="py-12 border-b border-teka-border">
          <div className="bg-gradient-to-r from-teka-dark to-teka-charcoal rounded p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="font-heading font-bold text-2xl text-white">
                Não sabe qual escolher?
              </h2>
              <p className="text-white/60 mt-3 text-base">
                Use o nosso simulador gratuito para calcular a potência ideal
                para o seu espaço e receber uma recomendação personalizada.
              </p>
            </div>
            <Link
              href="/ar-condicionado/simulador"
              className="inline-flex items-center gap-2 px-8 py-4 bg-teka-red hover:bg-teka-red-dark text-white text-xs uppercase tracking-wide font-normal rounded transition-colors shrink-0"
            >
              Simular Potência
            </Link>
          </div>
        </div>

        {/* Mono-Split Products */}
        <div id="produtos" className="py-12 border-t border-teka-border">
          <h2 className="font-heading font-bold text-2xl text-teka-dark mb-2">Mono-Split</h2>
          <p className="text-teka-gray mb-8">Sistema individual para climatizar uma divisão.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {monoSplit.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Multi-Split Products */}
        <div className="py-12 border-t border-teka-border">
          <h2 className="font-heading font-bold text-2xl text-teka-dark mb-2">Multi-Split</h2>
          <p className="text-teka-gray mb-8">Uma unidade exterior para várias divisões.</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {multiSplit.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Info Block */}
        <div className="py-12 border-t border-teka-border">
          <div className="bg-teka-dark rounded-md p-8 lg:p-12 text-center">
            <h2 className="font-heading font-bold text-2xl text-white">Precisa de ajuda na escolha?</h2>
            <p className="text-white/60 mt-3 max-w-lg mx-auto">
              A nossa equipa pode ajudá-lo a definir a melhor solução de climatização para o seu espaço.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link
                href="/suporte/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded transition-colors"
              >
                Contactar
              </Link>
              <a
                href="/documents/ar-condicionado/catalogo-aurea.pdf"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-medium rounded transition-colors"
              >
                Catálogo PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
