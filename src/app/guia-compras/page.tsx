import Link from 'next/link';
import { ArrowRight, Lightbulb, Zap, Ruler, Palette } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guia de Compras — Como Escolher Eletrodomésticos',
  description: 'Guia de compras Teka Angola. Dicas e conselhos para escolher os eletrodomésticos ideais para a sua casa. Faça a melhor escolha agora!',
  alternates: { canonical: '/guia-compras' },
  openGraph: {
    title: 'Guia de Compras — Como Escolher Eletrodomésticos',
    description: 'Guia de compras Teka Angola. Dicas e conselhos para escolher os eletrodomésticos ideais para a sua casa. Faça a melhor escolha agora!',
  },
};

const guides = [
  {
    icon: Lightbulb,
    title: 'Como Escolher um Forno',
    description: 'Pirolítico ou hidrolítico? Encastrar ou livre instalação? Saiba como escolher o forno ideal para as suas necessidades.',
    href: '/inspiracao',
  },
  {
    icon: Zap,
    title: 'Eficiência Energética',
    description: 'Compreenda as classes energéticas e como podem reduzir o consumo e a fatura de energia.',
    href: '/inspiracao',
  },
  {
    icon: Ruler,
    title: 'Dimensões e Espaço',
    description: 'Guia de medidas para garantir que os eletrodomésticos se integram perfeitamente na sua cozinha.',
    href: '/inspiracao',
  },
  {
    icon: Palette,
    title: 'Design e Acabamentos',
    description: 'Cristal negro, inox ou branco? Descubra os acabamentos disponíveis e como combiná-los.',
    href: '/inspiracao',
  },
];

export default function GuiaComprasPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Guia de Compras
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Conselhos e dicas para escolher os eletrodomésticos certos para a sua casa.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Guia de Compras' }]} />

        <div className="grid md:grid-cols-2 gap-6 py-8 pb-16">
          {guides.map((guide) => (
            <Link
              key={guide.title}
              href={guide.href}
              className="group flex gap-5 p-6 bg-white rounded border border-teka-border hover:border-teka-red/30 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 rounded bg-teka-red/10 flex items-center justify-center shrink-0 group-hover:bg-teka-red/20 transition-colors">
                <guide.icon className="h-6 w-6 text-teka-red" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-lg text-teka-dark group-hover:text-teka-red transition-colors">
                  {guide.title}
                </h2>
                <p className="text-sm text-teka-gray mt-1 leading-relaxed">{guide.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-teka-red mt-3">
                  Ler guia <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
