import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos e Condições',
  description: 'Termos e condições de utilização do website Teka Angola.',
  alternates: { canonical: '/termos' },
  openGraph: {
    title: 'Termos e Condições',
    description: 'Termos e condições de utilização do website Teka Angola.',
  },
};

export default function TermosPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6">
          <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-white">Termos e Condições</h1>
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Termos e Condições' }]} />
        <div className="max-w-3xl py-8 pb-16">
          <p className="text-teka-gray leading-relaxed">
            Os presentes termos regulam a utilização do website Teka Angola. Esta página será
            atualizada com os termos e condições completos antes da entrada em produção.
          </p>
          <h2 className="font-heading font-semibold text-lg text-teka-dark mt-8 mb-3">Propriedade Intelectual</h2>
          <p className="text-teka-gray text-sm leading-relaxed">
            Todo o conteúdo presente neste website, incluindo textos, imagens, logótipos e design,
            é propriedade da Teka e está protegido por direitos de autor.
          </p>
          <h2 className="font-heading font-semibold text-lg text-teka-dark mt-8 mb-3">Utilização do Website</h2>
          <p className="text-teka-gray text-sm leading-relaxed">
            O utilizador compromete-se a usar este website de forma lícita e em conformidade
            com os presentes termos.
          </p>
        </div>
      </div>
    </>
  );
}
