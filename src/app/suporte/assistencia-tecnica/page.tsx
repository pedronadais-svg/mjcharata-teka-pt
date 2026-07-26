import { Wrench, Phone, MapPin, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assistência Técnica Teka em Angola',
  description: 'Assistência técnica oficial Teka em Angola. Técnicos autorizados MDV para reparação e manutenção. Agende a sua visita técnica agora.',
  alternates: { canonical: '/suporte/assistencia-tecnica' },
  openGraph: {
    title: 'Assistência Técnica Teka em Angola',
    description: 'Assistência técnica oficial Teka em Angola. Técnicos autorizados MDV para reparação e manutenção. Agende a sua visita técnica agora.',
  },
};

export default function AssistenciaTecnicaPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">Assistência Técnica</h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">
            Técnicos autorizados para reparação e manutenção dos seus equipamentos Teka.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Suporte', href: '/suporte' }, { label: 'Assistência Técnica' }]} />

        <div className="max-w-3xl mx-auto py-8 pb-16">
          {/* How it works */}
          <div className="mb-10">
            <h2 className="font-heading font-bold text-2xl text-teka-dark mb-6 text-center">Como funciona?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Contacte-nos', description: 'Através do formulário, telefone ou email.' },
                { step: '2', title: 'Diagnóstico', description: 'Um técnico analisa o problema e agenda visita.' },
                { step: '3', title: 'Reparação', description: 'Intervenção com peças originais Teka.' },
              ].map((item) => (
                <div key={item.step} className="text-center p-6 bg-white border border-teka-border rounded">
                  <div className="w-10 h-10 rounded-full bg-teka-red text-white font-heading font-bold flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-heading font-semibold text-teka-dark">{item.title}</h3>
                  <p className="text-sm text-teka-gray mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-teka-dark rounded-md p-8 text-center">
            <Wrench className="h-10 w-10 text-teka-red mx-auto mb-4" />
            <h2 className="font-heading font-bold text-xl text-white mb-2">Precisa de assistência?</h2>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Contacte a nossa equipa técnica para agendar uma intervenção.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:+244933302752"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded-lg transition-colors"
              >
                <Phone className="h-4 w-4" />
                +244 933 302 752
              </a>
              <a
                href="/suporte/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white hover:bg-white/10 font-medium rounded-lg transition-colors"
              >
                Formulário de contacto
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
