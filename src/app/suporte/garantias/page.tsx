import { Shield, Check, FileText } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Garantias Teka — 12 Meses Contra Defeito de Fabrico',
  description: 'Garantia Teka de 12 meses contra defeitos de fabrico em Angola. Saiba como ativar a garantia e proteger os seus eletrodomésticos.',
  alternates: { canonical: '/suporte/garantias' },
  openGraph: {
    title: 'Garantias Teka — 12 Meses Contra Defeito de Fabrico',
    description: 'Garantia Teka de 12 meses contra defeitos de fabrico em Angola. Saiba como ativar a garantia e proteger os seus eletrodomésticos.',
  },
};

export default function GarantiasPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">Garantias</h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">
            Tranquilidade total com a garantia Teka nos seus eletrodomésticos.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Suporte', href: '/suporte' }, { label: 'Garantias' }]} />

        <div className="max-w-3xl mx-auto py-8 pb-16">
          <div className="bg-teka-red/5 border border-teka-red/20 rounded-md p-8 text-center mb-10">
            <Shield className="h-12 w-12 text-teka-red mx-auto mb-4" />
            <h2 className="font-heading font-bold text-3xl text-teka-dark">12 Meses de Garantia</h2>
            <p className="text-teka-gray mt-2">Contra defeito de fabrico em todos os produtos Teka.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-teka-border rounded p-6">
              <h3 className="font-heading font-semibold text-lg text-teka-dark mb-3">O que está coberto?</h3>
              <ul className="space-y-2">
                {['Defeitos de fabrico e materiais', 'Componentes e peças internas', 'Mão de obra de reparação', 'Substituição de peças defeituosas'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-teka-gray">
                    <Check className="h-4 w-4 text-teka-red shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-teka-border rounded p-6">
              <h3 className="font-heading font-semibold text-lg text-teka-dark mb-3">Como ativar a garantia?</h3>
              <ol className="space-y-3">
                {[
                  'Guarde a fatura de compra original.',
                  'Registe o produto através do nosso formulário de contacto.',
                  'Em caso de avaria, contacte a assistência técnica MDV.',
                  'Um técnico autorizado será enviado para diagnóstico e reparação.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-teka-gray">
                    <span className="w-6 h-6 rounded-full bg-teka-red text-white text-xs flex items-center justify-center shrink-0 font-semibold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="text-center pt-4">
              <a
                href="/suporte/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4" />
                Registar garantia
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
