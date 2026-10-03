'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2, X, ImageOff, Sparkles, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DestinationGalleryProps {
  images: string[];
  title: string;
  category: string;
  location: string;
}

// Rich curated perspectives to ensure 5-card multi-stage coverflow has real high-res previews on both sides
const CURATED_CATEGORY_PERSPECTIVES: Record<string, string[]> = {
  'Mountains': [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
  ],
  'Ancient Sites': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=85',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
  ],
  'Historical': [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
  ],
  'Beaches': [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
  ],
  'Waterfalls': [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
  ],
  'Wildlife': [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=85',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
  ],
  'Religious Places': [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
  ],
  'Hidden Gems': [
    'https://images.unsplash.com/photo-1535463731090-e34f4b5098c5?w=1600&q=85',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
    'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85',
  ],
};

const DEFAULT_FALLBACKS = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600&q=85',
  'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1600&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=85',
];

export default function DestinationGallery({
  images,
  title,
  category,
  location,
}: DestinationGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

  // Ensure at least 5 photos so that 2 left peek cards and 2 right peek cards always show!
  const displayImages: string[] = (() => {
    const list = images.filter((img) => typeof img === 'string' && img.trim().length > 0);
    if (list.length >= 5) return list;

    const extras = CURATED_CATEGORY_PERSPECTIVES[category] || DEFAULT_FALLBACKS;
    for (const extra of extras) {
      if (!list.includes(extra)) {
        list.push(extra);
      }
      if (list.length >= 5) break;
    }

    while (list.length < 5) {
      for (const fallback of DEFAULT_FALLBACKS) {
        list.push(fallback);
        if (list.length >= 5) break;
      }
    }
    return list;
  })();

  const count = displayImages.length;

  // Staggered indices for 5-card stage (2 left cards, 1 center, 2 right cards)
  const farPrevIndex = (activeIndex - 2 + count) % count;
  const prevIndex = (activeIndex - 1 + count) % count;
  const nextIndex = (activeIndex + 1) % count;
  const farNextIndex = (activeIndex + 2) % count;

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const nextImage = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % count);
  };

  const prevImage = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, count]);

  return (
    <div className="w-full space-y-4">
      {/* ━━━ 5-CARD STAGE CAROUSEL (Center Active + 2 Left & 2 Right Peeking Cards) ━━━ */}
      <div className="relative w-full max-w-[1550px] mx-auto px-2 sm:px-4 select-none">
        <div className="relative flex items-center justify-center min-h-[360px] xs:min-h-[420px] sm:min-h-[480px] lg:min-h-[550px] overflow-hidden py-4">

          {/* ━━━ 1. FAR LEFT PEEK CARD (Position -2) ━━━ */}
          <div
            onClick={() => goTo(farPrevIndex)}
            className="absolute left-[-2%] sm:left-[0%] lg:left-[2%] xl:left-[4%] w-[20%] sm:w-[20%] lg:w-[18%] h-[60%] sm:h-[68%] z-10 hidden md:block cursor-pointer rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-900/10 opacity-40 hover:opacity-75 hover:scale-[1.02] transition-all duration-300 ease-out group"
            title="View photo"
          >
            {failedIndices.has(farPrevIndex) ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                <ImageOff className="w-6 h-6" />
              </div>
            ) : (
              <Image
                src={displayImages[farPrevIndex]}
                alt="Previous photo preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={true}
                onError={() => handleImageError(farPrevIndex)}
              />
            )}
            <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors" />
          </div>

          {/* ━━━ 2. IMMEDIATE LEFT PEEK CARD (Position -1) ━━━ */}
          <div
            onClick={prevImage}
            className="absolute left-[2%] sm:left-[8%] lg:left-[11%] xl:left-[13%] w-[26%] sm:w-[24%] lg:w-[22%] h-[74%] sm:h-[82%] z-20 hidden xs:block cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-900/10 opacity-70 hover:opacity-95 hover:scale-[1.02] transition-all duration-300 ease-out group"
            title="View previous photo"
          >
            {failedIndices.has(prevIndex) ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                <ImageOff className="w-8 h-8" />
              </div>
            ) : (
              <Image
                src={displayImages[prevIndex]}
                alt="Previous photo preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={true}
                onError={() => handleImageError(prevIndex)}
              />
            )}
            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
          </div>

          {/* ━━━ 3. LEFT NAVIGATION BUTTON (Floating with tactile drop shadow) ━━━ */}
          <button
            onClick={prevImage}
            aria-label="Previous image"
            className="absolute left-2 xs:left-4 sm:left-[16%] lg:left-[18%] xl:left-[20%] z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/95 hover:bg-white text-slate-900 shadow-2xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 group focus:outline-hidden"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* ━━━ 4. CENTER ACTIVE SPOTLIGHT CARD (Main Display) ━━━ */}
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="relative w-full xs:w-[78%] sm:w-[64%] lg:w-[56%] xl:w-[52%] h-[350px] xs:h-[420px] sm:h-[480px] lg:h-[530px] z-30 cursor-pointer rounded-3xl sm:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-900/30 ring-1 ring-slate-900/10 bg-slate-900 group"
          >
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -direction * 40, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                {failedIndices.has(activeIndex) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-6 text-center">
                    <ImageOff className="w-12 h-12 text-slate-600 mb-2" />
                    <p className="text-sm font-bold text-slate-300">Photo Unavailable</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      This photo link could not be loaded. Please upload directly in Admin.
                    </p>
                  </div>
                ) : (
                  <Image
                    src={displayImages[activeIndex]}
                    alt={`${title} - Photo ${activeIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    priority
                    unoptimized={true}
                    onError={() => handleImageError(activeIndex)}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Ambient vignette and luxury gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/20 pointer-events-none" />

            {/* Top Badge Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <span className="inline-flex items-center gap-1.5 bg-white/95 text-slate-900 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md pointer-events-auto">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{category}</span>
              </span>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/20 transition-all shadow-md active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Fullscreen</span>
                </button>
                <span className="bg-slate-950/70 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold border border-white/20">
                  {activeIndex + 1} / {count}
                </span>
              </div>
            </div>

            {/* Bottom Caption & Hint */}
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white pointer-events-none z-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-300/90 font-bold mb-1">
                  Verified Ceylon Landmark
                </p>
                <h3 className="text-base sm:text-lg font-bold drop-shadow-md">
                  {title}
                </h3>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                Click to expand
              </span>
            </div>
          </div>

          {/* ━━━ 5. RIGHT NAVIGATION BUTTON (Floating with tactile drop shadow) ━━━ */}
          <button
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-2 xs:right-4 sm:right-[16%] lg:right-[18%] xl:right-[20%] z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/95 hover:bg-white text-slate-900 shadow-2xl border border-slate-200/90 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 group focus:outline-hidden"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* ━━━ 6. IMMEDIATE RIGHT PEEK CARD (Position +1) ━━━ */}
          <div
            onClick={nextImage}
            className="absolute right-[2%] sm:right-[8%] lg:right-[11%] xl:right-[13%] w-[26%] sm:w-[24%] lg:w-[22%] h-[74%] sm:h-[82%] z-20 hidden xs:block cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl ring-1 ring-slate-900/10 opacity-70 hover:opacity-95 hover:scale-[1.02] transition-all duration-300 ease-out group"
            title="View next photo"
          >
            {failedIndices.has(nextIndex) ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                <ImageOff className="w-8 h-8" />
              </div>
            ) : (
              <Image
                src={displayImages[nextIndex]}
                alt="Next photo preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={true}
                onError={() => handleImageError(nextIndex)}
              />
            )}
            <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
          </div>

          {/* ━━━ 7. FAR RIGHT PEEK CARD (Position +2) ━━━ */}
          <div
            onClick={() => goTo(farNextIndex)}
            className="absolute right-[-2%] sm:right-[0%] lg:right-[2%] xl:right-[4%] w-[20%] sm:w-[20%] lg:w-[18%] h-[60%] sm:h-[68%] z-10 hidden md:block cursor-pointer rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg ring-1 ring-slate-900/10 opacity-40 hover:opacity-75 hover:scale-[1.02] transition-all duration-300 ease-out group"
            title="View photo"
          >
            {failedIndices.has(farNextIndex) ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
                <ImageOff className="w-6 h-6" />
              </div>
            ) : (
              <Image
                src={displayImages[farNextIndex]}
                alt="Next photo preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={true}
                onError={() => handleImageError(farNextIndex)}
              />
            )}
            <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors" />
          </div>

        </div>
      </div>

      {/* ━━━ BOTTOM INTERACTIVE CONTROLS & FILMSTRIP ━━━ */}
      <div className="max-w-4xl mx-auto px-4 space-y-3">
        {/* Pagination Dots + All Photos Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {displayImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === idx
                    ? 'w-8 h-2 bg-slate-900'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsLightboxOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-full transition-colors"
          >
            <Grid className="w-3.5 h-3.5 text-slate-600" />
            <span>View All {count} Photos</span>
          </button>
        </div>

        {/* Thumbnail Filmstrip */}
        {count > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`relative w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-200 border-2 ${
                  activeIndex === idx
                    ? 'border-sky-600 ring-2 ring-sky-300 scale-102 shadow-md'
                    : 'border-transparent opacity-65 hover:opacity-100 hover:scale-101'
                } ${failedIndices.has(idx) ? 'bg-slate-800' : ''}`}
              >
                {failedIndices.has(idx) ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                    <ImageOff className="w-4 h-4" />
                  </div>
                ) : (
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={true}
                    onError={() => handleImageError(idx)}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ━━━ FULLSCREEN LIGHTBOX MODAL ━━━ */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8"
          >
            <div className="flex items-center justify-between text-white z-10 max-w-6xl mx-auto w-full">
              <div>
                <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">{title}</h3>
                <p className="text-white/60 text-xs sm:text-sm">{location}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-white/70 text-sm font-semibold">
                  {activeIndex + 1} of {count}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 my-4 flex items-center justify-center max-w-6xl mx-auto w-full">
              <div className="relative w-full h-full max-h-[80vh]">
                {failedIndices.has(activeIndex) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                    <ImageOff className="w-16 h-16 text-slate-600 mb-3" />
                    <p className="text-base font-bold text-slate-300">Photo Unavailable</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">This photo link could not be loaded.</p>
                  </div>
                ) : (
                  <Image
                    src={displayImages[activeIndex]}
                    alt={`${title} Fullscreen`}
                    fill
                    className="object-contain"
                    unoptimized={true}
                    onError={() => handleImageError(activeIndex)}
                  />
                )}
              </div>

              {count > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-center gap-2 overflow-x-auto py-2 max-w-4xl mx-auto w-full">
              {displayImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                    activeIndex === idx
                      ? 'border-sky-400 ring-2 ring-sky-400/50 scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  {failedIndices.has(idx) ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                      <ImageOff className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <Image
                      src={img}
                      alt={`Preview ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={true}
                      onError={() => handleImageError(idx)}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
