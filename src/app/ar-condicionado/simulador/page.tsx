import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ACSimulator } from '@/components/ar-condicionado/ACSimulator';
import { Snowflake, Wifi, Shield, Leaf, Volume2, Wind } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Simulador de Ar Condicionado — Calcule a Potência Ideal',
  description: 'Calcule a potência ideal de ar condicionado para o seu espaço. Simulador gratuito com recomendação automática de equipamentos Teka AUREA.',
  alternates: { canonical: '/ar-condicionado/simulador' },
};

const features = [
  { icon: Snowflake, title: 'Ionizador + HEPA', desc: 'Filtragem avançada para ar puro e saudável' },
  { icon: Wind, title: 'DC Inverter', desc: 'Eficiência energética superior com ajuste contínuo' },
  { icon: Wifi, title: 'Smart Home App', desc: 'Controlo remoto via Wi-Fi e Bluetooth' },
  { icon: Shield, title: 'Golden Fin', desc: 'Protecção anti-corrosão para maior durabilidade' },
  { icon: Leaf, title: 'R32 Ecológico', desc: 'Refrigerante com baixo impacto ambiental (GWP 675)' },
  { icon: Volume2, title: 'Ultra Silencioso', desc: 'Desde 19 dB(A) — mais silencioso que um sussurro' },
];

const faqs = [
  { q: 'Como é calculada a potência?', a: 'O simulador calcula os BTU necessários com base na área, pé-direito, número de pessoas, exposição solar, isolamento térmico e factores climáticos específicos de Angola.' },
  { q: 'O que significam os BTU?', a: 'BTU (British Thermal Unit) é a unidade de medida da capacidade de refrigeração/aquecimento. Quanto maior o espaço e a carga térmica, mais BTU são necessários.' },
  { q: 'Mono-Split ou Multi-Split?', a: 'Mono-Split climatiza uma divisão com 1 unidade interior + 1 exterior. Multi-Split climatiza 2-3 divisões com várias interiores ligadas a 1 exterior.' },
  { q: 'O simulador é preciso?', a: 'O simulador fornece uma estimativa fiável baseada em factores standard. Para um dimensionamento exacto, recomendamos uma visita técnica ao local.' },
  { q: 'Como é feita a instalação?', a: 'A instalação deve ser realizada por técnicos certificados. Contacte a MDV Angola para agendamento e orçamento de instalação.' },
  { q: 'Qual o consumo energético?', a: 'Os modelos AUREA têm classe A+++ (arrefecimento) com tecnologia Inverter que ajusta a potência às necessidades reais, reduzindo o consumo até 60% face a sistemas fixos.' },
];

export default function SimuladorPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-12 lg:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6">
          <span className="text-teka-red text-sm font-semibold uppercase tracking-wider">Ar Condicionado AUREA</span>
          <h1 className="font-heading font-bold text-3xl lg:text-4xl text-white mt-2">Simulador de Potência</h1>
          <p className="text-white/60 mt-3 max-w-lg">Calcule a potência ideal para o seu espaço e receba uma recomendação personalizada dos equipamentos Teka AUREA.</p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Ar Condicionado', href: '/ar-condicionado' }, { label: 'Simulador' }]} />
      </div>

      <section className="max-w-[1440px] mx-auto px-6 py-12">
        <ACSimulator />
      </section>

      <section className="bg-teka-gray-bg py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-teka-dark text-center mb-10">Como funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Descreva o seu espaço', desc: 'Dimensões, tipo de divisão e factores ambientais como exposição solar e isolamento.' },
              { num: '2', title: 'Receba uma recomendação', desc: 'O algoritmo calcula a potência necessária e sugere o modelo Teka AUREA ideal.' },
              { num: '3', title: 'Peça o seu orçamento', desc: 'Contacte-nos para instalação profissional com técnicos certificados.' },
            ].map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-12 h-12 bg-teka-red text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto">{s.num}</div>
                <h3 className="text-base font-bold text-teka-dark mt-4">{s.title}</h3>
                <p className="text-sm text-teka-gray mt-2">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-2xl font-bold text-teka-dark text-center mb-10">Porquê Teka AUREA?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <f.icon className="h-8 w-8 text-teka-red mx-auto" />
                <h3 className="text-sm font-bold text-teka-dark mt-3">{f.title}</h3>
                <p className="text-xs text-teka-gray mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-teka-gray-bg py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-teka-dark text-center mb-10">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="bg-white rounded border border-teka-border">
                <summary className="p-4 text-sm font-semibold text-teka-dark cursor-pointer hover:bg-teka-gray-bg transition-colors">{faq.q}</summary>
                <p className="px-4 pb-4 text-sm text-teka-gray">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-teka-dark">Precisa de ajuda?</h2>
          <p className="text-sm text-teka-gray mt-2 max-w-md mx-auto">A nossa equipa técnica está disponível para o ajudar a escolher o sistema ideal.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/suporte/contacto" className="inline-flex items-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white text-xs uppercase tracking-wide rounded transition-colors">Contactar Equipa</Link>
            <Link href="/ar-condicionado" className="inline-flex items-center gap-2 px-6 py-3 border border-teka-border text-teka-dark text-xs uppercase tracking-wide rounded hover:bg-teka-gray-bg transition-colors">Ver Todos os Modelos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
