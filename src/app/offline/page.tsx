'use client';

import Link from 'next/link';
import { WifiOff, RotateCcw, Home, Bookmark, MapPin, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

export default function OfflinePage() {
  const { savedIds, setIsDrawerOpen } = useWishlist();

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#0F2A3D] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center space-y-6">
        
        {/* Offline Icon Container */}
        <div className="w-20 h-20 rounded-3xl bg-[#EAF4FD] border border-[#DCEFFD] text-[#38A9F0] mx-auto flex items-center justify-center shadow-sm">
          <WifiOff className="w-10 h-10 animate-pulse text-[#38A9F0]" />
        </div>

        {/* Heading & Context */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#38A9F0] bg-[#EAF4FD] border border-[#DCEFFD] px-3.5 py-1 rounded-full">
            Offline Mode Active
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F2A3D] tracking-tight">
            No Internet Connection
          </h1>
          <p className="text-[#5B7385] text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
            You may be exploring deep in the Knuckles Range, Ella mist forests, or Yala wild tracks with no cellular signal.
            Your cached destinations and saved places remain available!
          </p>
        </div>

        {/* Saved Count Prompt */}
        {savedIds.length > 0 && (
          <div className="bg-white border border-[#DCE8F2] rounded-2xl p-4 flex items-center justify-between text-left shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF4FD] text-[#38A9F0] border border-[#DCEFFD] flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 fill-[#38A9F0] text-[#38A9F0]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0F2A3D]">Your Saved Places</div>
                <div className="text-xs text-[#5B7385]">
                  {savedIds.length} place{savedIds.length > 1 ? 's' : ''} stored locally on this device
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-[#EAF4FD] hover:bg-[#DCEFFD] text-[#38A9F0] text-xs font-bold px-3.5 py-2 rounded-xl border border-[#DCE8F2] transition-all cursor-pointer"
            >
              Open
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm shadow-md shadow-[#38A9F0]/25 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Check Connection</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF4FD] text-[#0F2A3D] border border-[#DCE8F2] font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all"
          >
            <Home className="w-4 h-4 text-[#38A9F0]" />
            <span>Go to Cached Home</span>
          </Link>
        </div>

        {/* Serandib Co footer tag */}
        <div className="pt-6 border-t border-[#DCE8F2] text-xs text-[#5B7385] flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#38A9F0]" />
          <span>UncoverCeylon Offline Companion by Serandib Co.</span>
        </div>
      </div>
    </div>
  );
}
