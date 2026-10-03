'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ArrowRight, MapPin, Waves, Mountain,
  Droplets, PawPrint, Landmark, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HeroSlide {
  id: number;
  image_url: string;
  location: string;
  province: string;
}

const fallbackSlides: HeroSlide[] = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&q=90',
    location: 'Sigiriya Rock Fortress',
    province: 'Central Province',
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=90',
    location: 'Southern Coastline',
    province: 'Southern Province',
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90',
    location: 'Knuckles Mountain Range',
    province: 'Central Province',
  },
  {
    id: 4,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1920&q=90',
    location: 'Highland Tea Trails',
    province: 'Central Province',
  },
];

const QUICK_CHIPS = [
  { label: 'Beaches', category: 'Beaches', icon: Waves },
  { label: 'Waterfalls', category: 'Waterfalls', icon: Droplets },
  { label: 'Hills & Peaks', category: 'Mountains', icon: Mountain },
  { label: 'Wildlife', category: 'Wildlife', icon: PawPrint },
  { label: 'Ancient Sites', category: 'Ancient Sites', icon: Landmark },
  { label: 'Hidden Gems', category: 'Hidden Gems', icon: Sparkles },
];

export default function HeroSection() {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [current, setCurrent] = useState(0);
  const [query, setQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const { t } = useLanguage();

  const active = slides[current] ?? fallbackSlides[0];

  useEffect(() => {
    fetch('/api/hero-slides')
      .then((res) => res.json())
      .then((data) => {
        if (data.slides?.length) setSlides(data.slides);
      })
      .catch(() => undefined);
  }, []);

  // Slow, pausable auto-rotate (7 seconds)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    const trimmed = query.trim();
    if (trimmed) {
      window.dispatchEvent(new CustomEvent('uc:filter-category', { detail: { search: trimmed } }));
      window.location.href = `/?search=${encodeURIComponent(trimmed)}#explore`;
    } else {
      const el = document.getElementById('explore');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChipClick = (category: string) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent('uc:filter-category', { detail: { category } }));
    const el = document.getElementById('explore');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative isolate min-h-[75vh] sm:min-h-[82vh] w-full flex flex-col justify-between overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10"
      aria-label="Hero Introduction"
    >
      {/* ━━━ BACKGROUND IMAGE SLIDESHOW (VIBRANT & VISIBLE) ━━━ */}
      <div className="absolute inset-0 overflow-hidden bg-[#0F2A3D]">
        <AnimatePresence initial={false}>
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={active.image_url}
              alt={active.location}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.78]"
              unoptimized={true}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic contrast scrim to ensure text and search bar pop */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,42,61,0.60)_0%,rgba(15,42,61,0.25)_45%,rgba(15,42,61,0.70)_100%)]" />
      </div>

      {/* ━━━ MAIN HERO CONTENT ━━━ */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 my-auto text-center">
        
        {/* Curated Guide Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-4 py-1 text-[11px] sm:text-xs font-bold text-white mb-4 sm:mb-5 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#38A9F0] animate-pulse" />
          <span>{t('hero.badge') || "Sri Lanka's Premier Travel Guide"}</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-3xl mx-auto drop-shadow-md">
          <span>{t('hero.title1') || 'Discover the Hidden'} </span>
          <span className="text-[#38A9F0] block sm:inline">
            {t('hero.title2') || 'Beauty of Sri Lanka'}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 sm:mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-white/90 font-normal drop-shadow-xs">
          {t('hero.subtitle') ||
            'Explore pristine beaches, ancient kingdoms, misty mountain trails, and hidden waterfalls across the pearl of the Indian Ocean.'}
        </p>

        {/* ━━━ FLOATING SEARCH BAR ━━━ */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto"
        >
          <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 sm:p-2.5 transition-all focus-within:ring-4 focus-within:ring-[#38A9F0]/30 border border-white/40">
            <Search className="w-5 h-5 text-[#38A9F0] shrink-0 ml-2 sm:ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('hero.searchPlaceholder') || 'Search destinations, towns, waterfalls...'}
              className="w-full min-w-0 flex-1 bg-transparent px-3 text-base sm:text-base font-medium text-[#0F2A3D] placeholder:text-[#8298A9] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-[#8298A9] hover:text-[#0F2A3D] transition-colors mr-1 cursor-pointer"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-md shadow-[#38A9F0]/25 active:scale-95 cursor-pointer shrink-0"
            >
              <span>{t('hero.searchBtn') || 'Search'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </form>

        {/* ━━━ 6 QUICK-INTEREST CHIPS (FROSTED GLASS PILLS) ━━━ */}
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-2xl mx-auto">
          {QUICK_CHIPS.map((chip) => {
            const Icon = chip.icon;
            return (
              <Link
                key={chip.category}
                href={`/?category=${encodeURIComponent(chip.category)}#explore`}
                onClick={() => handleChipClick(chip.category)}
                className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/35 border border-white/25 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white transition-all shadow-xs backdrop-blur-md active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-[#38A9F0]" />
                <span>{chip.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ━━━ BOTTOM LOCATION TAG & SLIDER DOTS (TIED TO ACTIVE PHOTO) ━━━ */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between gap-3 text-xs">
          
          {/* Current Landmark Caption Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-xs text-white shadow-md max-w-[70%] sm:max-w-none truncate">
            <MapPin className="w-3.5 h-3.5 text-[#38A9F0] shrink-0" />
            <span className="font-bold text-white truncate">{active.location}</span>
            <span className="text-white/70 hidden sm:inline">· {active.province}</span>
          </div>

          {/* Slider Pagination Dots Pill */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-md">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === current
                    ? 'w-6 h-2 bg-[#38A9F0]'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
