'use client';

import { useRef } from 'react';
import {
  Globe, Waves, Droplets, Mountain, Landmark, PawPrint, Gem, Castle, ChevronLeft, ChevronRight, Star
} from 'lucide-react';
import { CategoryType } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryItem {
  label: CategoryType;
  icon: React.ElementType;
}

const categories: CategoryItem[] = [
  { label: 'All', icon: Globe },
  { label: 'Beaches', icon: Waves },
  { label: 'Waterfalls', icon: Droplets },
  { label: 'Mountains', icon: Mountain },
  { label: 'Ancient Sites', icon: Landmark },
  { label: 'Wildlife', icon: PawPrint },
  { label: 'Hidden Gems', icon: Gem },
  { label: 'Historical', icon: Castle },
  { label: 'Religious Places', icon: Star },
];

interface CategoryFilterProps {
  selected: CategoryType;
  onChange: (cat: CategoryType) => void;
  counts?: Record<string, number>;
}

export default function CategoryFilter({ selected, onChange, counts }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const getCategoryLabel = (label: CategoryType) => {
    switch (label) {
      case 'All': return t('cat.all');
      case 'Beaches': return t('cat.beaches');
      case 'Waterfalls': return t('cat.waterfalls');
      case 'Mountains': return t('cat.mountains');
      case 'Ancient Sites': return t('cat.ancientSites');
      case 'Wildlife': return t('cat.wildlife');
      case 'Hidden Gems': return t('cat.hiddenGems');
      case 'Historical': return t('cat.historical');
      case 'Religious Places': return t('cat.religiousPlaces');
      default: return label;
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center justify-center max-w-full w-full group">
      {/* Scroll left */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll categories left"
        className="hidden sm:flex absolute left-0 z-10 flex-shrink-0 w-8 h-8 items-center justify-center rounded-full bg-white border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#EAF4FD] hover:border-[#38A9F0] transition-all shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Mobile edge mask indicator (right fade) */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#F5FAFF] via-[#F5FAFF]/80 to-transparent z-10 sm:hidden" />

      {/* Scrollable pills */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scroll-smooth py-1.5 px-3 sm:px-1 w-full overscroll-x-contain"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selected === cat.label;
          const count = counts?.[cat.label];

          return (
            <button
              key={cat.label}
              onClick={() => onChange(cat.label)}
              className={`flex-shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#38A9F0] border-[#38A9F0] text-white shadow-md shadow-[#38A9F0]/25 font-semibold'
                  : 'bg-white border-[#DCE8F2] text-[#5B7385] hover:text-[#38A9F0] hover:border-[#38A9F0]/50 hover:bg-[#F5FAFF]'
              }`}
            >
              <Icon className={`w-3.5 sm:w-4 h-3.5 sm:h-4 ${isActive ? 'text-white' : 'text-[#5B7385]'}`} />
              <span>{getCategoryLabel(cat.label)}</span>
              {count !== undefined && (
                <span className={`text-[11px] sm:text-xs ml-0.5 font-bold ${
                  isActive ? 'text-white/90' : 'text-[#5B7385]/70'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Scroll right */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll categories right"
        className="hidden sm:flex absolute right-0 z-10 flex-shrink-0 w-8 h-8 items-center justify-center rounded-full bg-white border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#EAF4FD] hover:border-[#38A9F0] transition-all shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
