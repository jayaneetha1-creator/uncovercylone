'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'destinations' | 'map' | 'about'>('home');
  const pathname = usePathname();
  const { savedCount, setIsDrawerOpen } = useWishlist();
  const { t } = useLanguage();

  const navLinks = [
    { href: '/', label: t('nav.home') || 'Home', id: 'home' },
    { href: '/#explore', label: t('nav.destinations') || 'Destinations', id: 'destinations' },
    { href: '/map', label: t('nav.map') || 'Map', id: 'map' },
    { href: '/about', label: t('nav.about') || 'About', id: 'about' },
  ];

  useEffect(() => {
    const updateActiveTab = () => {
      if (typeof window === 'undefined') return;
      const currentPath = window.location.pathname;
      const currentHash = window.location.hash;

      if (currentPath.startsWith('/about')) {
        setActiveTab('about');
        return;
      }

      if (currentPath.startsWith('/map')) {
        setActiveTab('map');
        return;
      }

      if (currentHash === '#explore') {
        setActiveTab('destinations');
        return;
      }

      if (currentPath === '/') {
        const exploreElement = document.getElementById('explore');
        if (exploreElement) {
          const rect = exploreElement.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 150) {
            setActiveTab('destinations');
            return;
          }
        }
        if (window.scrollY < 300) {
          setActiveTab('home');
          return;
        }
      }

      if (currentPath === '/') {
        setActiveTab('home');
      }
    };

    updateActiveTab();

    const onScroll = () => {
      setScrolled(window.scrollY > 15);
      updateActiveTab();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', updateActiveTab);
    window.addEventListener('hashchange', updateActiveTab);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', updateActiveTab);
      window.removeEventListener('hashchange', updateActiveTab);
    };
  }, [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (id: string) => activeTab === id;

  const handleNavClick = (id: string) => {
    setActiveTab(id as typeof activeTab);
    if (id === 'destinations' && typeof window !== 'undefined' && window.location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('uc:filter-category', { detail: { category: 'All' } }));
      const exploreEl = document.getElementById('explore');
      if (exploreEl) {
        exploreEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearchClick = () => {
    if (typeof window === 'undefined') return;
    if (pathname === '/') {
      const el = document.getElementById('explore');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/#explore';
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 text-[#0F2A3D] border-b border-[#DCE8F2] shadow-[0_2px_12px_rgba(15,42,61,0.04)] backdrop-blur-xl'
          : 'bg-white/85 text-[#0F2A3D] border-b border-[#DCE8F2]/60 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* ━━━ BRAND LOGO ━━━ */}
          <Link
            href="/"
            onClick={() => setActiveTab('home')}
            className="group flex items-center gap-2 transition-transform active:scale-95 py-1"
          >
            <div className="flex flex-col leading-none">
              <span className="text-[19px] sm:text-[21px] font-extrabold tracking-tight text-[#0F2A3D]">
                Uncover<span className="text-[#38A9F0] ml-0.5">Ceylon</span>
              </span>
              <span className="text-[8.5px] sm:text-[9px] tracking-[0.22em] uppercase font-semibold text-[#5B7385] mt-0.5">
                Island Travel Guide
              </span>
            </div>
          </Link>

          {/* ━━━ DESKTOP NAVIGATION LINKS ━━━ */}
          <div className="hidden md:flex items-center gap-1 sm:gap-1.5 bg-[#EAF4FD]/60 px-2 py-1 rounded-full border border-[#DCE8F2]">
            {navLinks.map((link) => {
              const active = isActive(link.id);
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-4 py-1.5 text-[13.5px] font-semibold transition-all duration-150 rounded-full ${
                    active
                      ? 'bg-white text-[#38A9F0] shadow-xs'
                      : 'text-[#5B7385] hover:text-[#0F2A3D] hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ━━━ RIGHT ACTION ITEMS ━━━ */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Mobile Search Quick Trigger */}
            <button
              onClick={handleSearchClick}
              aria-label="Search places"
              className="md:hidden p-2 rounded-xl text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD] transition-colors"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Language Selector */}
            <LanguageSelector scrolled={true} />

            {/* Saved Wishlist Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full text-[#5B7385] hover:text-rose-600 hover:bg-[#EAF4FD] transition-colors cursor-pointer"
              aria-label="View Saved Destinations"
              title={t('nav.savedPlaces') || 'Saved Wishlist'}
            >
              <Heart
                className={`w-5 h-5 transition-transform hover:scale-110 stroke-[2] ${
                  savedCount > 0 ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              {savedCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#F5A623] text-white text-[9.5px] font-black flex items-center justify-center shadow-xs">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </button>

            {/* Primary Action Button (Single Prominent Trigger) */}
            <Link
              href="/#explore"
              onClick={() => handleNavClick('destinations')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-[13px] font-bold px-4 py-2 rounded-full transition-all duration-150 shadow-xs hover:shadow-md hover:shadow-[#38A9F0]/20 active:scale-95"
            >
              <span>{t('nav.explore') || 'Explore Places'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
