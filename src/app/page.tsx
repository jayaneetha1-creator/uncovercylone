import { getDb } from '@/lib/db';
import { getSiteNodes } from '@/lib/db/nodes';
import { Place } from '@/types';
import HeroSection from '@/components/HeroSection';
import PlaceCard from '@/components/PlaceCard';
import RegionImageSlider from '@/components/RegionImageSlider';
import JourneyCategoriesSection from '@/components/JourneyCategoriesSection';
import Link from 'next/link';
import {
  ArrowRight, Map, MapPin, Sparkles, Star, Calendar,
  Compass, ShieldCheck, Newspaper, Compass as CompassIcon
} from 'lucide-react';

export const revalidate = 60;

async function getPlaces(): Promise<Place[]> {
  try {
    return (
      getDb()
        .prepare("SELECT * FROM places WHERE status = 'published' OR status IS NULL ORDER BY featured DESC, rating DESC")
        .all() as Place[]
    );
  } catch (error) {
    console.error('Error fetching places:', error);
    return [];
  }
}

async function getSettings(): Promise<Record<string, string>> {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as {
      key: string;
      value: string;
    }[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch {
    return {};
  }
}

function getBestRightNow(places: Place[]) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthIdx = new Date().getMonth();
  const currentMonthName = months[currentMonthIdx];

  const matched = places.filter((p) => {
    if (!p.best_time) return false;
    const bt = p.best_time.toLowerCase();
    if (bt.includes('year-round') || bt.includes('all year')) return true;
    if (bt.includes(currentMonthName.toLowerCase())) return true;

    const match = bt.match(
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:to|-)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i
    );
    if (match) {
      const startIdx = months.findIndex((m) => m.toLowerCase().startsWith(match[1].toLowerCase()));
      const endIdx = months.findIndex((m) => m.toLowerCase().startsWith(match[2].toLowerCase()));
      if (startIdx !== -1 && endIdx !== -1) {
        if (startIdx <= endIdx) {
          return currentMonthIdx >= startIdx && currentMonthIdx <= endIdx;
        } else {
          return currentMonthIdx >= startIdx || currentMonthIdx <= endIdx;
        }
      }
    }
    return false;
  });

  return {
    places: (matched.length >= 3 ? matched : places.filter((p) => p.rating >= 4.8)).slice(0, 4),
    monthName: currentMonthName,
  };
}

export default async function HomePage() {
  const [places, settings, activeNodes] = await Promise.all([
    getPlaces(),
    getSettings(),
    getSiteNodes(false), // Fetch only enabled nodes
  ]);

  const enabledKeys = new Set(activeNodes.map((n) => n.node_key));
  // If page_home is disabled, unmount
  if (enabledKeys.size > 0 && !enabledKeys.has('page_home')) {
    return null;
  }

  const isEnabled = (key: string) => {
    if (enabledKeys.size === 0) return true; // fallback if nodes not loaded
    return enabledKeys.has(key);
  };

  // 1. Travelers' Favourites (Top 4 highest rated)
  const favorites = [...places]
    .sort((a, b) => b.rating - a.rating || (b.review_count || 0) - (a.review_count || 0))
    .slice(0, 4);

  // 2. Hidden Gems
  const hiddenGems = places.filter((place) => place.category === 'Hidden Gems').slice(0, 3);

  // 3. Best Right Now
  const bestNow = getBestRightNow(places);

  return (
    <div className="min-h-screen w-full bg-[#F5FAFF] text-[#0F2A3D]">
      
      {/* ━━━ 1. HERO SLIDESHOW & SEARCH (site_nodes: home_hero) ━━━ */}
      {isEnabled('home_hero') && <HeroSection />}

      {/* ━━━ 2. WHAT KIND OF TRIP DO YOU IMAGINE? (site_nodes: home_interests) ━━━ */}
      {isEnabled('home_interests') && <JourneyCategoriesSection places={places} />}

      {/* ━━━ 3. TRAVELERS' FAVOURITES (site_nodes: home_favorites) ━━━ */}
      {isEnabled('home_favorites') && (
        <section className="py-12 sm:py-16 lg:py-20 border-t border-[#DCE8F2]">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold uppercase tracking-wider mb-2 border border-[#DCEFFD]">
                  <Star className="w-3.5 h-3.5 text-[#F5A623] fill-[#F5A623]" />
                  <span>Loved by Travelers</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F2A3D] tracking-tight">
                  Travelers&apos; Favourites
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#5B7385]">
                  Consistently highest-rated stops across Ceylon, verified by real visitors
                </p>
              </div>

              <Link
                href="/destinations?sort=rating"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#38A9F0] hover:text-[#1E93DC] transition-colors group self-start sm:self-auto"
              >
                <span>View ranked favourites</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {favorites.map((place, index) => (
                <PlaceCard key={place.id} place={place} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 4. BEST RIGHT NOW (SEASONAL HIGHLIGHT) ━━━ */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white border-y border-[#DCE8F2]">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#0F2A3D] text-xs font-bold uppercase tracking-wider mb-2 border border-[#DCE8F2]">
                <Calendar className="w-3.5 h-3.5 text-[#38A9F0]" />
                <span>Current Season Highlight</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F2A3D] tracking-tight">
                Best Right Now in <span className="text-[#38A9F0]">{bestNow.monthName}</span>
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#5B7385]">
                Destinations experiencing their optimal weather, ocean visibility, or wildlife migration this month
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EAF4FD] text-[#0F2A3D] border border-[#DCE8F2] self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#2FB67C] animate-pulse" />
              <span>Optimal Climate Window</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {bestNow.places.map((place, index) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 5. HIDDEN GEMS (site_nodes: home_gems) ━━━ */}
      {isEnabled('home_gems') && (
        <section className="py-12 sm:py-16 lg:py-20 bg-[#F5FAFF]">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold uppercase tracking-wider mb-2 border border-[#DCEFFD]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resident Explorer Picks</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F2A3D] tracking-tight">
                  Secluded &amp; Hidden Gems
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#5B7385]">
                  Peaceful, lesser-known sanctuaries away from the mainstream tourist crowds
                </p>
              </div>

              <Link
                href="/destinations?category=Hidden+Gems"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#38A9F0] hover:text-[#1E93DC] transition-colors group self-start sm:self-auto"
              >
                <span>View all hidden gems</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {hiddenGems.map((place, index) => (
                <div key={place.id} className="flex flex-col">
                  <PlaceCard place={place} index={index} />
                  <div className="mt-2.5 px-3 py-2 rounded-xl bg-[#EAF4FD] border border-[#DCE8F2] text-xs text-[#0F2A3D]">
                    <strong className="text-[#38A9F0] font-bold">Why go:</strong>{' '}
                    <span className="text-[#5B7385]">
                      {place.tips
                        ? place.tips.split('.')[0]
                        : 'Tranquil scenery, untouched nature, and intimate local hospitality.'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 6. EXPLORE BY REGION (site_nodes: home_regions) ━━━ */}
      {isEnabled('home_regions') && (
        <section className="w-full py-12 sm:py-16">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-3xl bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] border border-[#DCE8F2] shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
              {/* Left Content */}
              <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#38A9F0] text-xs font-bold uppercase tracking-wider mb-4 border border-[#DCE8F2] self-start shadow-2xs">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{settings.region_tagline || 'Regional Discovery'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F2A3D] leading-tight tracking-tight">
                  {settings.region_title || 'Every corner of Sri Lanka has an authentic story.'}
                </h2>

                <p className="mt-3 text-xs sm:text-base leading-relaxed text-[#5B7385] max-w-lg">
                  {settings.region_description ||
                    'From the misty central peaks of Ella and Nuwara Eliya to the sun-soaked southern surf breaks of Mirissa, explore province by province on our interactive terrain map.'}
                </p>

                <div className="mt-6 flex items-center gap-3 flex-wrap">
                  <Link
                    href={settings.region_button_link || '/map'}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-md shadow-[#38A9F0]/25 cursor-pointer active:scale-95"
                  >
                    <span>{settings.region_button_text || 'Open Interactive Map'}</span>
                    <Map className="h-4 w-4" />
                  </Link>

                  <div className="flex items-center gap-1.5 text-xs text-[#5B7385] px-2 py-1">
                    <ShieldCheck className="w-4 h-4 text-[#2FB67C]" />
                    <span>9 Provinces · 61 Coordinates</span>
                  </div>
                </div>
              </div>

              {/* Right Slider */}
              <div className="relative min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden border-t lg:border-t-0 lg:border-l border-[#DCE8F2]">
                <RegionImageSlider />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ━━━ 7. DEDICATED DIRECTORY TEASER CALLOUT (SECTION 4.6-B & R12) ━━━ */}
      <section className="py-16 sm:py-20 bg-white border-t border-[#DCE8F2]">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold uppercase tracking-wider border border-[#DCEFFD]">
            <CompassIcon className="w-4 h-4" />
            <span>Complete Island Directory</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#0F2A3D] tracking-tight max-w-2xl mx-auto">
            Ready to browse all {places.length} curated destinations across Sri Lanka?
          </h2>

          <p className="text-xs sm:text-sm text-[#5B7385] max-w-lg mx-auto leading-relaxed">
            Filter by golden beaches, mist-shrouded waterfalls, ancient UNESCO citadels, entry fees, and traveler reviews.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-sm font-bold shadow-lg shadow-[#38A9F0]/25 transition-all active:scale-95 cursor-pointer"
            >
              <span>Explore All Destinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#F5FAFF] hover:bg-[#EAF4FD] border border-[#DCE8F2] text-[#0F2A3D] text-sm font-bold transition-all cursor-pointer"
            >
              <Map className="w-4 h-4 text-[#38A9F0]" />
              <span>Open Map</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
