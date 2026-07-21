'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface EditorialSection {
  type: 'image-text' | 'text-image' | 'video' | 'full-width-image' | 'feature-grid';
  title?: string;
  text?: string;
  image?: string;
  videoUrl?: string;
}

interface ProductEditorialProps {
  sections: EditorialSection[];
  lifestyleImages?: string[];
  videos?: string[];
}

function getYouTubeId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
  return match ? match[1] : '';
}

function EditorialBlock({ section, index }: { section: EditorialSection; index: number }) {
  const isReversed = section.type === 'text-image' || (section.type === 'image-text' && index % 2 === 1);

  if (section.type === 'video' && section.videoUrl) {
    const ytId = getYouTubeId(section.videoUrl);
    if (!ytId) return null;
    return (
      <div className="space-y-4">
        {section.title && (
          <h3 className="font-heading font-bold text-2xl text-teka-dark text-center">{section.title}</h3>
        )}
        {section.text && (
          <p className="text-teka-gray text-center max-w-2xl mx-auto">{section.text}</p>
        )}
        <div className="aspect-video max-w-3xl mx-auto overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={section.title || 'Vídeo do produto'}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (!section.image && !section.title && !section.text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"
    >
      <div className={`relative aspect-[4/3] overflow-hidden bg-teka-light ${isReversed ? 'md:order-2' : ''}`}>
        {section.image && (
          <Image src={section.image} alt={section.title || ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        )}
      </div>

      <div className={`space-y-4 ${isReversed ? 'md:order-1' : ''}`}>
        {section.title && (
          <h3 className="font-heading font-bold text-2xl lg:text-3xl text-teka-dark">{section.title}</h3>
        )}
        {section.text && (
          <p className="text-teka-gray leading-relaxed text-base">{section.text}</p>
        )}
      </div>
    </motion.div>
  );
}

export function ProductEditorial({ sections, lifestyleImages = [], videos = [] }: ProductEditorialProps) {
  // Generate fallback sections from lifestyle images and videos if no editorial sections
  let displaySections = sections;

  if (displaySections.length === 0) {
    displaySections = [];
    lifestyleImages.forEach((img, i) => {
      displaySections.push({
        type: i % 2 === 0 ? 'image-text' : 'text-image',
        image: img,
      });
    });
    videos.forEach((v) => {
      displaySections.push({ type: 'video', videoUrl: v });
    });
  }

  if (displaySections.length === 0) return null;

  return (
    <div className="space-y-16 py-12">
      {displaySections.map((section, i) => (
        <EditorialBlock key={i} section={section} index={i} />
      ))}
    </div>
  );
}
