'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import { Place } from '@/types';
import { X, Heart, Trash2, ArrowRight, MapPin, Star, Printer } from 'lucide-react';
import OfflineGuideModal from '@/components/OfflineGuideModal';

export default function WishlistDrawer() {
  const { savedIds, isDrawerOpen, setIsDrawerOpen, toggleWishlist, clearWishlist } = useWishlist();
  const { t } = useLanguage();
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  // Fetch places when drawer opens to populate wishlist items
  useEffect(() => {
    if (!isDrawerOpen || allPlaces.length > 0) return;
    let cancelled = false;

    const loadPlaces = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await fetch('/api/places');
        const data = await res.json();
        if (!cancelled && data.places) {
          setAllPlaces(data.places);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, [isDrawerOpen, allPlaces.length]);

  const savedPlaces = allPlaces.filter((p) => savedIds.includes(p.id));

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 right-0 z-[10001] w-full max-w-md bg-[#f8fafc] shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
                  <Heart className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {t('wishlist.title')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {savedIds.length} {t('wishlist.count')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {savedIds.length > 0 && (
                  <button
                    onClick={clearWishlist}
                    title={t('wishlist.clearAll')}
                    className="p-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {t('wishlist.clearAll')}
                  </button>
                )}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {loading ? (
                <div className="py-20 text-center text-sm text-slate-500">
                  Loading your saved places...
                </div>
              ) : savedPlaces.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center px-4 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-slate-500">
                    <Heart className="w-8 h-8 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{t('wishlist.emptyTitle')}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-xs mt-1">
                      {t('wishlist.emptyDesc')}
                    </p>
                  </div>
                  <Link
                    href="/#explore"
                    onClick={() => setIsDrawerOpen(false)}
                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <span>{t('wishlist.browseBtn')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                savedPlaces.map((place) => (
                  <div
                    key={place.id}
                    className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs hover:border-sky-300 transition-all flex gap-3 group relative"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      {place.image_url ? (
                        <Image
                          src={place.image_url}
                          alt={place.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          No Photo
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                            {place.category}
                          </span>
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {place.rating.toFixed(1)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                          {place.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                          <MapPin className="w-3 h-3 text-sky-600 flex-shrink-0" />
                          <span className="truncate">{place.location}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100">
                        <Link
                          href={`/places/${place.id}`}
                          onClick={() => setIsDrawerOpen(false)}
                          className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
                        >
                          <span>{t('card.view')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => toggleWishlist(place.id, place.name)}
                          title="Remove from saved"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer with summary, map view, & PDF itinerary export */}
            {savedPlaces.length > 0 && (
              <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{t('wishlist.total')}:</span>
                  <span className="font-bold text-slate-900">{savedPlaces.length} places</span>
                </div>

                {/* PDF Itinerary Export Button */}
                <button
                  type="button"
                  onClick={() => setIsOfflineModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-sky-600/25 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>{t('wishlist.exportPdf')}</span>
                </button>

                <Link
                  href="/map"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-xs"
                >
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>{t('wishlist.viewOnMap')}</span>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Offline Guide & Itinerary Modal */}
          <OfflineGuideModal
            isOpen={isOfflineModalOpen}
            onClose={() => setIsOfflineModalOpen(false)}
            places={savedPlaces}
            title="My Sri Lanka Saved Itinerary"
          />
        </>
      )}
    </AnimatePresence>
  );
}
