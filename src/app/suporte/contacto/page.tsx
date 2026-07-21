import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto — Fale Connosco | Teka Angola',
  description: 'Entre em contacto com a Teka Angola. Formulário, telefone e morada das lojas MDV. Resposta rápida a todas as suas questões.',
  alternates: { canonical: '/suporte/contacto' },
  openGraph: {
    title: 'Contacto — Fale Connosco | Teka Angola',
    description: 'Entre em contacto com a Teka Angola. Formulário, telefone e morada das lojas MDV. Resposta rápida a todas as suas questões.',
  },
};

export default function ContactoPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">Contacto</h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">
            Estamos disponíveis para responder a todas as suas questões.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Suporte', href: '/suporte' }, { label: 'Contacto' }]} />

        <div className="grid lg:grid-cols-3 gap-8 py-8 lg:py-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-teka-border rounded p-6 lg:p-8">
              <h2 className="font-heading font-bold text-xl text-teka-dark mb-6">Envie-nos uma mensagem</h2>
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-teka-dark mb-1.5">Nome completo</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-teka-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
                      placeholder="O seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-teka-dark mb-1.5">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 border border-teka-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
                      placeholder="o.seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-teka-dark mb-1.5">Telefone</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 border border-teka-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
                    placeholder="+244 900 000 000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-teka-dark mb-1.5">Assunto</label>
                  <select className="w-full px-4 py-2.5 border border-teka-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors bg-white">
                    <option value="">Selecione um assunto</option>
                    <option value="informacao">Pedido de informação</option>
                    <option value="assistencia">Assistência técnica</option>
                    <option value="garantia">Garantia</option>
                    <option value="reclamacao">Reclamação</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-teka-dark mb-1.5">Referência do produto (opcional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-teka-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
                    placeholder="Ex: HLB 8600 P BK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-teka-dark mb-1.5">Mensagem</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2.5 border border-teka-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors resize-none"
                    placeholder="Descreva a sua questão..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded-lg transition-colors"
                >
                  Enviar mensagem
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white border border-teka-border rounded p-6">
              <h3 className="font-heading font-semibold text-teka-dark mb-4">Informações de Contacto</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-teka-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teka-dark">Telefone</p>
                    <a href="tel:+244933302752" className="text-sm text-teka-gray hover:text-teka-red transition-colors">
                      +244 933 302 752
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-teka-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teka-dark">Email</p>
                    <a href="mailto:teka@mdvmadeiras.com" className="text-sm text-teka-gray hover:text-teka-red transition-colors">
                      teka@mdvmadeiras.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-teka-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teka-dark">Morada</p>
                    <p className="text-sm text-teka-gray">
                      Rua da Tecnologia, 100<br />
                      Luanda, Angola
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-teka-red shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-teka-dark">Horário</p>
                    <p className="text-sm text-teka-gray">
                      Seg-Sex: 9h00 – 18h00<br />
                      Sáb-Dom: Encerrado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-teka-dark rounded p-6 text-center">
              <h3 className="font-heading font-semibold text-white mb-2">Assistência Urgente?</h3>
              <p className="text-sm text-white/60 mb-4">Ligue diretamente para a nossa linha de suporte.</p>
              <a
                href="tel:+244933302752"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-teka-red hover:bg-teka-red-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Phone className="h-4 w-4" />
                Ligar agora
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
