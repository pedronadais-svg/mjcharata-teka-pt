'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const featuredCategories = [
  { name: 'Fornos', slug: '/cozinha/fornos', description: 'Pirolíticos e multifunção', image: 'https://teka.b-cdn.net/CMP1219/2/PR426732BI45038_111000096_Van_Gogh_HLB_84_P_VG_SZ1.png' },
  { name: 'Placas', slug: '/cozinha/placas', description: 'Indução e vitrocerâmica', image: 'https://teka.b-cdn.net/CMP1219/1/PR426765BI45109_112510047_Van_Gogh_IBF_95_FST_VG_SZ1.png' },
  { name: 'Exaustores', slug: '/cozinha/exaustores', description: 'Design e performance', image: 'https://teka.b-cdn.net/CMP1219/2/PR426739BI45053_112930075_Van_Gogh_DVT_98660_TOS_VG_SZ1.png' },
  { name: 'Frigoríficos', slug: '/cozinha/frigorificos', description: 'No Frost e grande capacidade', image: 'https://teka.b-cdn.net/CMP1219/PR426938BI45136_113400045_Van_Gogh_RBF_88670_VG_SZ1.png' },
  { name: 'Lavandaria', slug: '/lavandaria', description: 'Lavar, secar e cuidar', image: 'https://teka.b-cdn.net/CMP1219/3/PR414960BI33965_113900011_AutoDose_WMK_81050_DSS_SZ1.png' },
  { name: 'Lava-louças', slug: '/cozinha/lava-loica', description: 'Inox e compósitos', image: 'https://teka.b-cdn.net/CMP1219/2/PR112655BI28175_115000056_American_Professional_80_M_XP_1B_SZ1.png' },
  { name: 'Ar Condicionado', slug: '/ar-condicionado', description: 'Gama AUREA — conforto inteligente', image: '' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function CategoriesSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl text-teka-dark">
            Explore por Categoria
          </h2>
          <p className="mt-3 text-teka-gray max-w-xl mx-auto">
            Soluções completas para cada espaço da sua casa, com a qualidade e inovação Teka.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {featuredCategories.map((cat) => (
            <motion.div key={cat.slug} variants={itemVariants}>
              <Link
                href={cat.slug}
                className="group relative block rounded overflow-hidden bg-white border border-teka-border hover:border-teka-red/30 hover:shadow-lg transition-all"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-teka-light overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teka-light to-gray-200 flex items-center justify-center">
                      <span className="text-4xl font-heading font-bold text-teka-red/20">AC</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 lg:p-5">
                  <h3 className="font-heading font-bold text-base text-teka-dark group-hover:text-teka-red transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-teka-gray mt-1">{cat.description}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-teka-red">
                    <span>Descobrir</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
