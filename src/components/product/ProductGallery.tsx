'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  name: string;
  videos?: string[];
  drawing?: string;
}

export function ProductGallery({ images, name, videos = [], drawing }: ProductGalleryProps) {
  const displayImages = images.filter(Boolean);
  const hasImages = displayImages.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVideo, setShowVideo] = useState<string | null>(null);
  const [showDrawing, setShowDrawing] = useState(false);

  const navigate = (direction: 'prev' | 'next') => {
    setActiveIndex((prev) =>
      direction === 'next'
        ? (prev + 1) % displayImages.length
        : (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  const getYouTubeId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[4/3] bg-teka-light rounded overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            {hasImages ? (
              <Image
                src={displayImages[activeIndex]}
                alt={`${name} - imagem ${activeIndex + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4"
                priority={activeIndex === 0}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-teka-gray/30">
                <span className="text-sm">{name}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {displayImages.length > 1 && (
          <>
            <button aria-label="Imagem anterior" onClick={() => navigate('prev')}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button aria-label="Imagem seguinte" onClick={() => navigate('next')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {displayImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
            {activeIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {(displayImages.length > 1 || videos.length > 0 || drawing) && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              aria-label={`Ver imagem ${i + 1}`}
              className={`relative w-14 h-14 shrink-0 rounded overflow-hidden border-2 transition-colors ${
                i === activeIndex ? 'border-teka-red' : 'border-transparent hover:border-teka-gray/50'
              }`}
            >
              <Image src={img} alt={`${name} - miniatura ${i + 1}`} fill sizes="56px" className="object-contain p-0.5" />
            </button>
          ))}

          {videos.map((video, i) => {
            const vid = getYouTubeId(video);
            return vid ? (
              <button
                key={`vid-${i}`}
                onClick={() => setShowVideo(vid)}
                aria-label={`Ver vídeo ${i + 1}`}
                className="relative w-14 h-14 shrink-0 rounded overflow-hidden border-2 border-transparent hover:border-teka-red bg-teka-dark flex items-center justify-center"
              >
                <Play className="h-5 w-5 text-white" />
              </button>
            ) : null;
          })}

          {drawing && (
            <button
              onClick={() => setShowDrawing(true)}
              aria-label="Ver desenho técnico"
              className="relative w-14 h-14 shrink-0 rounded overflow-hidden border-2 border-transparent hover:border-teka-red bg-teka-light flex items-center justify-center text-[8px] text-teka-gray font-medium"
            >
              DWG
            </button>
          )}
        </div>
      )}

      {/* Video modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowVideo(null)}>
          <div className="relative w-full max-w-3xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar vídeo" onClick={() => setShowVideo(null)} className="absolute -top-10 right-0 text-white hover:text-teka-red">
              <X className="h-6 w-6" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${showVideo}?autoplay=1`}
              title={`Vídeo de ${name}`}
              className="w-full h-full rounded"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Drawing modal */}
      {showDrawing && drawing && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowDrawing(false)}>
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar desenho" onClick={() => setShowDrawing(false)} className="absolute -top-10 right-0 text-white hover:text-teka-red">
              <X className="h-6 w-6" />
            </button>
            <div className="relative aspect-[3/2] bg-white rounded overflow-hidden">
              <Image src={drawing.split('?')[0]} alt="Desenho técnico" fill sizes="100vw" className="object-contain p-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
