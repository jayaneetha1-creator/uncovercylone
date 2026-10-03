'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Map, Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomTabBar() {
  const pathname = usePathname();
  const { savedCount, setIsDrawerOpen } = useWishlist();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'map' | 'saved'>('home');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTab = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path.startsWith('/map')) {
        setActiveTab('map');
      } else if (path.startsWith('/favorites') || path.startsWith('/saved')) {
        setActiveTab('saved');
      } else if (hash === '#explore' || path === '/explore') {
        setActiveTab('explore');
      } else if (path === '/') {
        const exploreEl = document.getElementById('explore');
        if (exploreEl) {
          const rect = exploreEl.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 150) {
            setActiveTab('explore');
            return;
          }
        }
        setActiveTab('home');
      } else {
        setActiveTab('home');
      }
    };

    checkTab();
    window.addEventListener('scroll', checkTab, { passive: true });
    window.addEventListener('popstate', checkTab);
    window.addEventListener('hashchange', checkTab);

    return () => {
      window.removeEventListener('scroll', checkTab);
      window.removeEventListener('popstate', checkTab);
      window.removeEventListener('hashchange', checkTab);
    };
  }, [pathname]);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/places/')) {
    return null;
  }

  const handleExploreClick = () => {
    setActiveTab('explore');
    if (pathname === '/') {
      const el = document.getElementById('explore');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#DCE8F2] shadow-[0_-4px_20px_rgba(15,42,61,0.06)] px-2 py-1 safe-area-bottom"
    >
      <div className="grid grid-cols-4 items-center justify-around max-w-md mx-auto h-14">
        {/* Home */}
        <Link
          href="/"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all ${
            activeTab === 'home'
              ? 'text-[#38A9F0] font-bold'
              : 'text-[#5B7385] hover:text-[#0F2A3D]'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'home' ? 'bg-[#DCEFFD]/70' : ''}`}>
            <Home className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav.home') || 'Home'}
          </span>
        </Link>

        {/* Explore */}
        <Link
          href="/#explore"
          onClick={handleExploreClick}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all ${
            activeTab === 'explore'
              ? 'text-[#38A9F0] font-bold'
              : 'text-[#5B7385] hover:text-[#0F2A3D]'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'explore' ? 'bg-[#DCEFFD]/70' : ''}`}>
            <Compass className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav.explore') || 'Explore'}
          </span>
        </Link>

        {/* Map */}
        <Link
          href="/map"
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all ${
            activeTab === 'map'
              ? 'text-[#38A9F0] font-bold'
              : 'text-[#5B7385] hover:text-[#0F2A3D]'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'map' ? 'bg-[#DCEFFD]/70' : ''}`}>
            <Map className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav.map') || 'Map'}
          </span>
        </Link>

        {/* Saved (Opens Wishlist Drawer) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('saved');
            setIsDrawerOpen(true);
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-xl transition-all relative ${
            activeTab === 'saved'
              ? 'text-[#38A9F0] font-bold'
              : 'text-[#5B7385] hover:text-[#0F2A3D]'
          }`}
        >
          <div className={`p-1 rounded-lg relative ${activeTab === 'saved' ? 'bg-[#DCEFFD]/70' : ''}`}>
            <Heart className="w-5 h-5 stroke-[2]" />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F5A623] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">
            {t('nav.saved') || 'Saved'}
          </span>
        </button>
      </div>
    </nav>
  );
}
