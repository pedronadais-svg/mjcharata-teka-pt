'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  type: 'video' | 'image';
  src: string;
  poster?: string;
  title: string;
  subtitle: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

const slides: Slide[] = [
  {
    id: 1,
    type: 'video',
    src: '/videos/van-gogh.mp4',
    title: 'Van Gogh Collection',
    subtitle: 'Uma obra de arte para a sua cozinha. Design exclusivo inspirado nas cores e texturas do mestre.',
    cta: { label: 'Descobrir a Coleção', href: '/cozinha/fornos' },
    secondaryCta: { label: 'Ver Catálogo', href: '/downloads' },
  },
  {
    id: 2,
    type: 'video',
    src: '/videos/neo-series.mp4',
    title: 'Série NEO',
    subtitle: 'A nova geração de eletrodomésticos Teka. Linhas puras, tecnologia inteligente, desempenho superior.',
    cta: { label: 'Explorar a Série NEO', href: '/cozinha' },
  },
  {
    id: 3,
    type: 'video',
    src: '/videos/integra-pro-hood.mp4',
    title: 'Integra Pro',
    subtitle: 'Exaustores integrados de alta performance. Silêncio, potência e integração perfeita.',
    cta: { label: 'Ver Exaustores', href: '/cozinha/exaustores' },
  },
  {
    id: 4,
    type: 'video',
    src: '/videos/megacombi.mp4',
    title: 'MegaCombi',
    subtitle: 'O forno que combina todas as funções. Cozinhe com vapor, microondas e convecção num só equipamento.',
    cta: { label: 'Descobrir MegaCombi', href: '/cozinha/fornos' },
  },
  {
    id: 5,
    type: 'image',
    src: '/images/hero/maestro-pizza.jpg',
    title: 'Maestro Pizza',
    subtitle: 'Atingir 340°C nunca foi tão fácil. Pizzas artesanais perfeitas no conforto da sua cozinha.',
    cta: { label: 'Saber mais', href: '/cozinha/fornos' },
  },
  {
    id: 6,
    type: 'image',
    src: '/images/hero/view-1.jpg',
    title: 'Cozinhas de Sonho',
    subtitle: 'Projete a cozinha perfeita com a gama completa de eletrodomésticos Teka.',
    cta: { label: 'Explorar Produtos', href: '/cozinha' },
    secondaryCta: { label: 'Inspiração', href: '/inspiracao' },
  },
];

const SLIDE_DURATION = 7000;

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, next]);

  // Play/pause videos
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === current) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [current]);

  const slide = slides[current];

  return (
    <section className="relative h-[50vh] md:h-[70vh] min-h-[400px] max-h-[700px] bg-teka-dark overflow-hidden">
      {/* Background Media */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          {s.type === 'video' ? (
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={s.src}
              muted
              loop
              playsInline
              preload={i < 2 ? 'auto' : 'none'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={s.src}
              alt={s.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          )}
        </div>
      ))}

      {/* Dark overlay — spec: rgba(0,0,0,0.4) to rgba(0,0,0,0.6) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-6 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <h1 className="font-heading font-bold text-2xl md:text-[30px] lg:text-4xl text-white leading-[1.1] tracking-tight">
              {slide.title}
            </h1>

            <p className="mt-4 text-sm md:text-lg text-white/80 leading-relaxed max-w-md">
              {slide.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={slide.cta.href}
                className="inline-flex items-center gap-2 px-7 py-3 bg-white hover:bg-teka-red text-teka-dark hover:text-white text-sm font-semibold rounded transition-all duration-300 group"
              >
                {slide.cta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {slide.secondaryCta && (
                <Link
                  href={slide.secondaryCta.href}
                  className="inline-flex items-center gap-2 px-7 py-3 border-2 border-white/40 text-white hover:bg-white/10 text-sm font-semibold rounded transition-colors"
                >
                  {slide.secondaryCta.label}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors z-10"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots / Progress */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => goTo(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === current
                ? 'w-10 bg-teka-red'
                : 'w-4 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir para slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Bottom fade to page */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
