'use client';

import { motion } from 'framer-motion';
import { Award, Leaf, Settings, HeartHandshake } from 'lucide-react';

const values = [
  {
    icon: Award,
    title: 'Qualidade Alemã',
    description: 'Mais de 100 anos de engenharia e inovação na conceção de eletrodomésticos.',
  },
  {
    icon: Leaf,
    title: 'Eficiência Energética',
    description: 'Produtos com as melhores classificações energéticas para um consumo responsável.',
  },
  {
    icon: Settings,
    title: 'Tecnologia Avançada',
    description: 'Sistemas inteligentes como SurroundTemp, DualClean e MaestroPizza.',
  },
  {
    icon: HeartHandshake,
    title: 'Garantia 12 Meses',
    description: 'Tranquilidade com 12 meses de garantia contra defeito de fabrico.',
  },
];

export function BrandValues() {
  return (
    <section className="py-16 lg:py-20 border-b border-teka-border">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-[60px] h-[60px] rounded-full border-2 border-teka-red mb-4">
                <value.icon className="h-6 w-6 text-teka-red" />
              </div>
              <h3 className="font-heading font-semibold text-teka-dark">{value.title}</h3>
              <p className="text-sm text-teka-gray mt-2 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
