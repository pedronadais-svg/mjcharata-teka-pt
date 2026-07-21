import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de privacidade do website Teka Angola.',
  alternates: { canonical: '/privacidade' },
  openGraph: {
    title: 'Política de Privacidade',
    description: 'Política de privacidade do website Teka Angola.',
  },
};

export default function PrivacidadePage() {
  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6">
          <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-white">Política de Privacidade</h1>
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Política de Privacidade' }]} />
        <div className="max-w-3xl py-8 pb-16 prose prose-sm prose-gray">
          <p className="text-teka-gray leading-relaxed">
            A Teka Angola, enquanto responsável pelo tratamento, compromete-se a proteger a privacidade
            dos utilizadores do presente website. Esta página será atualizada com a política de privacidade
            completa antes da entrada em produção.
          </p>
          <h2 className="font-heading font-semibold text-lg text-teka-dark mt-8 mb-3">Dados Recolhidos</h2>
          <p className="text-teka-gray text-sm leading-relaxed">
            Os dados pessoais recolhidos através dos formulários de contacto são utilizados exclusivamente
            para responder aos pedidos dos utilizadores e prestar o suporte solicitado.
          </p>
          <h2 className="font-heading font-semibold text-lg text-teka-dark mt-8 mb-3">Contacto</h2>
          <p className="text-teka-gray text-sm leading-relaxed">
            Para qualquer questão relacionada com a protecção de dados, contacte-nos através de{' '}
            <a href="mailto:teka@mdvmadeiras.com" className="text-teka-red hover:text-teka-red-dark">teka@mdvmadeiras.com</a>.
          </p>
        </div>
      </div>
    </>
  );
}
