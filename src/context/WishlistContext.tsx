'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface WishlistContextType {
  savedIds: number[];
  isSaved: (id: number) => boolean;
  toggleWishlist: (id: number, placeName?: string) => void;
  toggleSave: (id: number, placeName?: string) => void;
  clearWishlist: () => void;
  savedCount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'uncover_ceylon_wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load wishlist from storage:', e);
    }
    return [];
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isLoaded = typeof window !== 'undefined';

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to save wishlist to storage:', e);
    }
  }, [savedIds, isLoaded]);

  const isSaved = (id: number) => savedIds.includes(id);

  const toggleWishlist = (id: number, placeName?: string) => {
    const exists = savedIds.includes(id);
    if (exists) {
      setSavedIds((prev) => prev.filter((item) => item !== id));
      toast(placeName ? `Removed "${placeName}" from Saved` : 'Removed from Saved Destinations', {
        icon: '🤍',
      });
    } else {
      setSavedIds((prev) => [...prev, id]);
      toast.success(placeName ? `Saved "${placeName}" to Wishlist!` : 'Saved to Wishlist! ❤️');
    }
  };

  const clearWishlist = () => {
    setSavedIds([]);
    toast('Wishlist cleared', { icon: '🗑️' });
  };

  return (
    <WishlistContext.Provider
      value={{
        savedIds,
        isSaved,
        toggleWishlist,
        toggleSave: toggleWishlist,
        clearWishlist,
        savedCount: savedIds.length,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
