'use client';

import { useWishlist } from '@/context/WishlistContext';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface WishlistButtonProps {
  placeId: number;
  placeName: string;
  variant?: 'pill' | 'icon';
  className?: string;
}

export default function WishlistButton({
  placeId,
  placeName,
  variant = 'pill',
  className = '',
}: WishlistButtonProps) {
  const { isSaved, toggleWishlist } = useWishlist();
  const saved = isSaved(placeId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(placeId, placeName);
  };

  if (variant === 'icon') {
    return (
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.1 }}
        onClick={handleClick}
        aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
        className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-sm ${
          saved
            ? 'bg-rose-500 text-white shadow-rose-500/30'
            : 'bg-white/90 hover:bg-white text-[#5B7385] hover:text-rose-500 border border-[#DCE8F2]'
        } ${className}`}
      >
        <Heart className={`w-4 h-4 ${saved ? 'fill-white text-white' : 'stroke-[2]'}`} />
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer border ${
        saved
          ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
          : 'bg-white border-slate-200 text-slate-800 hover:border-sky-500 hover:text-sky-600'
      } ${className}`}
    >
      <Heart className={`w-4 h-4 transition-transform ${saved ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
      <span>{saved ? 'Saved to Wishlist' : 'Save Destination'}</span>
    </motion.button>
  );
}
