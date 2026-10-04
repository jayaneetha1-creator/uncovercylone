'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, ArrowUp, MapPin, ExternalLink, Compass } from 'lucide-react';
import AdPlacement from './AdPlacement';

export default function Footer() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-white text-[#5B7385] pt-16 sm:pt-20 pb-24 sm:pb-12 border-t border-[#DCE8F2] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 sm:pb-16 border-b border-[#DCE8F2]">
          
          {/* Brand Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            <Link href="/" className="inline-block group">
              <span className="font-extrabold text-2xl tracking-tight text-[#0F2A3D] block">
                Uncover<span className="text-[#38A9F0]">Ceylon</span>
              </span>
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-[#5B7385] mt-1 block">
                Sri Lanka Travel Guide
              </span>
            </Link>

            <p className="text-[#5B7385] text-xs sm:text-sm leading-relaxed max-w-sm">
              Your authentic, open-access travel companion across Sri Lanka. Discover secluded coastal bays, sacred mountain trails, misty tea highlands, and centuries-old cultural monuments.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-[#F5FAFF] border border-[#DCE8F2] hover:border-[#38A9F0]/60 hover:bg-[#EAF4FD] text-[#5B7385] hover:text-[#38A9F0] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                </svg>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-xl bg-[#F5FAFF] border border-[#DCE8F2] hover:border-[#38A9F0]/60 hover:bg-[#EAF4FD] text-[#5B7385] hover:text-[#38A9F0] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-[#F5FAFF] border border-[#DCE8F2] hover:border-[#38A9F0]/60 hover:bg-[#EAF4FD] text-[#5B7385] hover:text-[#38A9F0] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-[#F5FAFF] border border-[#DCE8F2] hover:border-[#38A9F0]/60 hover:bg-[#EAF4FD] text-[#5B7385] hover:text-[#38A9F0] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Explore Column */}
          <div>
            <h3 className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#38A9F0]" />
              <span>Explore</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link href="/?category=Beaches#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Beaches & Coastlines
                </Link>
              </li>
              <li>
                <Link href="/?category=Mountains#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Highland Peaks & Ella
                </Link>
              </li>
              <li>
                <Link href="/?category=Waterfalls#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Secret Cascades
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors flex items-center gap-1">
                  <span>Interactive Map</span>
                  <ExternalLink className="w-3 h-3 text-[#5B7385]/70" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover Column */}
          <div>
            <h3 className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#38A9F0]" />
              <span>Discover</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/?category=Ancient+Sites#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Ancient Kingdoms
                </Link>
              </li>
              <li>
                <Link href="/?category=Wildlife#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Wildlife & Safaris
                </Link>
              </li>
              <li>
                <Link href="/?category=Hidden+Gems#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Hidden Gems
                </Link>
              </li>
              <li>
                <Link href="/?category=Historical#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Colonial Fortresses
                </Link>
              </li>
              <li>
                <Link href="/?category=Religious+Places#explore" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Sacred Temples
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors flex items-center gap-1.5 font-medium">
                  <span>About Us</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#EAF4FD] text-[#38A9F0] border border-[#DCEFFD]">Serandib Co.</span>
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Tourism News & Updates
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Saved Places
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#5B7385] hover:text-[#38A9F0] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Non-Disruptive Ad Placement 5: Footer Partner Strip */}
        <AdPlacement placement="footer_strip" className="rounded-2xl my-6" />

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B7385]">
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            © {new Date().getFullYear()} UncoverCeylon. Handcrafted with{' '}
            <Heart className="w-3.5 h-3.5 text-[#F5A623] fill-[#F5A623]" /> by Serandib Co.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B7385] hover:text-[#0F2A3D] transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <div className="w-6 h-6 rounded-lg bg-[#F5FAFF] border border-[#DCE8F2] flex items-center justify-center">
                <ArrowUp className="w-3 h-3 text-[#38A9F0]" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
