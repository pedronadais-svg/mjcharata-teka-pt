import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Onde Comprar Teka em Angola | Lojas MDV',
  description: 'Encontre a Teka em Angola. Distribuidor autorizado MDV em Luanda (Viana). Visite-nos hoje!',
  alternates: { canonical: '/onde-comprar' },
  openGraph: {
    title: 'Onde Comprar Teka em Angola | Lojas MDV',
    description: 'Encontre a Teka em Angola. Distribuidor autorizado MDV em Luanda (Viana). Visite-nos hoje!',
  },
};

const stores = [
  {
    name: 'MDV - Luanda',
    address: 'Complexo Tubogáz\nViana, Luanda',
    phone: '+244 933 302 752',
    email: 'teka@mdvmadeiras.com',
    hours: 'Segunda a Sexta: 8h00 – 17h00\nSábado: 8h00 – 13h00\nDomingo: Encerrado',
  },
];

export default function OndeComprarPage() {
  return (
    <>
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Onde Comprar
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Encontre os produtos Teka nos pontos de venda MDV em Angola.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Onde Comprar' }]} />

        <div className="max-w-md mx-auto py-8 pb-16">
          {stores.map((store) => (
            <div
              key={store.name}
              className="bg-white rounded border border-teka-border p-6 hover:border-teka-red/30 hover:shadow-md transition-all"
            >
              <h2 className="font-heading font-semibold text-lg text-teka-dark">{store.name}</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-teka-red shrink-0 mt-1" />
                  <p className="text-sm text-teka-gray whitespace-pre-line">{store.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-teka-red shrink-0" />
                  <a href={`tel:${store.phone.replace(/\s/g, '')}`} className="text-sm text-teka-gray hover:text-teka-red transition-colors">
                    {store.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-teka-red shrink-0" />
                  <a href={`mailto:${store.email}`} className="text-sm text-teka-gray hover:text-teka-red transition-colors">
                    {store.email}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-teka-red shrink-0 mt-0.5" />
                  <p className="text-sm text-teka-gray whitespace-pre-line">{store.hours}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
