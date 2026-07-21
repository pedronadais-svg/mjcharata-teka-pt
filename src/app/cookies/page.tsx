import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Política de cookies do website Teka Angola.',
  alternates: { canonical: '/cookies' },
  openGraph: {
    title: 'Política de Cookies',
    description: 'Política de cookies do website Teka Angola.',
  },
};

export default function CookiesPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6">
          <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-white">Política de Cookies</h1>
        </div>
      </section>
      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Política de Cookies' }]} />
        <div className="max-w-3xl py-8 pb-16">
          <p className="text-teka-gray leading-relaxed">
            Este website utiliza cookies para melhorar a experiência de navegação. Esta página será
            atualizada com a política de cookies completa antes da entrada em produção.
          </p>
          <h2 className="font-heading font-semibold text-lg text-teka-dark mt-8 mb-3">O que são cookies?</h2>
          <p className="text-teka-gray text-sm leading-relaxed">
            Cookies são pequenos ficheiros de texto armazenados no seu dispositivo quando visita um website.
            São utilizados para melhorar a funcionalidade e a experiência de utilização.
          </p>
          <h2 className="font-heading font-semibold text-lg text-teka-dark mt-8 mb-3">Gerir preferências</h2>
          <p className="text-teka-gray text-sm leading-relaxed">
            Pode gerir as suas preferências de cookies a qualquer momento através das definições
            do seu navegador.
          </p>
        </div>
      </div>
    </>
  );
}
