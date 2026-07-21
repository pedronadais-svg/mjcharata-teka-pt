import { Award, Globe, Users, Calendar } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre a Teka — 100 Anos de Inovação Alemã',
  description: 'Conheça a história da Teka em Angola. Mais de 100 anos de inovação alemã em eletrodomésticos. Descubra a marca que equipa milhões de lares.',
  alternates: { canonical: '/sobre' },
  openGraph: {
    title: 'Sobre a Teka — 100 Anos de Inovação Alemã',
    description: 'Conheça a história da Teka em Angola. Mais de 100 anos de inovação alemã em eletrodomésticos. Descubra a marca que equipa milhões de lares.',
  },
};

const milestones = [
  { year: '1924', title: 'Fundação', description: 'A Teka é fundada na Alemanha, iniciando a produção de artigos em aço inoxidável.' },
  { year: '1964', title: 'Expansão Europeia', description: 'Início da expansão internacional com fábricas em vários países europeus.' },
  { year: '1992', title: 'Expansão Ibérica', description: 'A Teka estabelece presença oficial no mercado português e espanhol.' },
  { year: '2024', title: '100 Anos', description: 'Um século de inovação, qualidade e compromisso com o cliente.' },
];

const stats = [
  { icon: Calendar, value: '100+', label: 'Anos de história' },
  { icon: Globe, value: '50+', label: 'Países' },
  { icon: Users, value: '5M+', label: 'Clientes globais' },
  { icon: Award, value: '7', label: 'Fábricas na Europa' },
];

export default function SobrePage() {
  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Sobre a Teka
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Mais de 100 anos de engenharia alemã ao serviço da sua casa.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Sobre a Teka' }]} />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-b border-teka-border">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teka-red/10 mb-3">
                <stat.icon className="h-6 w-6 text-teka-red" />
              </div>
              <div className="font-heading font-extrabold text-3xl text-teka-dark">{stat.value}</div>
              <div className="text-sm text-teka-gray mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="py-12 lg:py-16">
          <h2 className="font-heading font-bold text-2xl lg:text-3xl text-teka-dark text-center mb-10">
            A Nossa História
          </h2>
          <div className="max-w-3xl mx-auto space-y-0">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-teka-red flex items-center justify-center text-white font-heading font-bold text-sm shrink-0">
                    {m.year}
                  </div>
                  {i < milestones.length - 1 && <div className="w-px flex-1 bg-teka-border my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-heading font-semibold text-lg text-teka-dark">{m.title}</h3>
                  <p className="text-sm text-teka-gray mt-1 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="py-12 lg:py-16 border-t border-teka-border">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-teka-dark mb-4">
              Presença em Angola
            </h2>
            <p className="text-teka-gray leading-relaxed">
              A Teka está presente no mercado angolano através da MDV — Madeiras e Derivados,
              distribuidor oficial autorizado. Com uma rede de assistência técnica local
              e toda a gama de produtos disponível, garantimos a mesma qualidade e suporte
              que encontra em qualquer mercado europeu.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
