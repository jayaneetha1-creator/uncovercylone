import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { Place, Review } from '@/types';
import ReviewSection from './ReviewSection';
import PlaceMap from './PlaceMap';
import PlaceCard from '@/components/PlaceCard';
import PhotoMosaic from '@/components/PhotoMosaic';
import PlanVisitCard from '@/components/PlanVisitCard';
import PlaceAIQuestionBox from '@/components/PlaceAIQuestionBox';
import QAList from '@/components/QAList';
import Folder from '@/components/Folder';
import WishlistButton from '@/components/WishlistButton';
import OfflineGuideButton from '@/components/OfflineGuideButton';
import PlaceViewTracker from '@/components/PlaceViewTracker';
import RecommendationCarousel from '@/components/RecommendationCarousel';
import AdPlacement from '@/components/AdPlacement';
import {
  MapPin, Star, Calendar, ChevronLeft,
  Navigation, Heart, Share2, Compass,
  Camera, Footprints, Coffee, Eye, Clock,
  Sparkles, CheckCircle2, MessageSquare, Image as ImageIcon,
  Layers, ArrowRight
} from 'lucide-react';

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb();
    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as Place | undefined;
    if (!place) {
      return {
        title: 'Destination Not Found — UncoverCeylon',
      };
    }

    const title = `${place.name} — UncoverCeylon Travel Guide`;
    const desc = place.short_description || `Discover ${place.name} in ${place.location}, Sri Lanka. Travel guide, best season to visit, photos, and reviews.`;
    const img = place.image_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80';

    return {
      title,
      description: desc,
      openGraph: {
        title: `${place.name} — Sri Lanka Travel Guide | UncoverCeylon`,
        description: desc,
        url: `/places/${place.id}`,
        siteName: 'UncoverCeylon',
        images: [{ url: img, width: 1200, height: 630, alt: place.name }],
        locale: 'en_US',
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'UncoverCeylon — Discover Sri Lanka',
    };
  }
}

async function getPlaceDetails(id: string): Promise<{
  place: Place;
  reviews: Review[];
  relatedPlaces: Place[];
  nearbyAttractions: Place[];
} | null> {
  try {
    const db = getDb();
    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as Place | undefined;
    if (!place) return null;

    const reviews = db.prepare(
      "SELECT * FROM reviews WHERE place_id = ? AND (status = 'approved' OR status IS NULL) ORDER BY created_at DESC"
    ).all(id) as Review[];

    const relatedPlaces = db.prepare(
      "SELECT * FROM places WHERE category = ? AND id != ? AND (status = 'published' OR status IS NULL) ORDER BY rating DESC LIMIT 4"
    ).all(place.category, id) as Place[];

    const nearbyAttractions = db.prepare(
      "SELECT * FROM places WHERE province = ? AND id != ? AND (status = 'published' OR status IS NULL) ORDER BY rating DESC LIMIT 4"
    ).all(place.province, id) as Place[];

    return { place, reviews, relatedPlaces, nearbyAttractions };
  } catch {
    return null;
  }
}

function getGalleryImages(place: Place): string[] {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(place.gallery || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      images = parsed.filter((img) => typeof img === 'string' && img.trim().length > 0);
    }
  } catch {
    // ignore
  }

  if (place.image_url && !images.includes(place.image_url)) {
    images.unshift(place.image_url);
  }

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=80'];
  }

  return images;
}

interface InsiderTip {
  title: string;
  desc: string;
  categoryTag: string;
  iconType: 'camera' | 'footprints' | 'coffee' | 'compass' | 'clock';
}

function getThingsToDo(place: Place): InsiderTip[] {
  const cat = (place.category || '').toLowerCase();
  const name = (place.name || '').toLowerCase();

  if (name.includes('nine arch') || (name.includes('ella') && cat.includes('mountain'))) {
    return [
      {
        iconType: 'camera',
        categoryTag: 'Photo Vantage Point',
        title: 'Catch the Morning Blue Train Crossing',
        desc: 'Position yourself along the upper hillside tea terrace around 9:30 AM or 11:45 AM. The morning light casts a golden glow across the valley when the blue express rumbles across the viaduct.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Scenic Walking Route',
        title: 'Take the Shaded Forest Ridge Footpath',
        desc: 'Skip the bumpy gravel road and take the gentle 20-minute walking path through eucalyptus woods and hillside tea estates starting from Ella town.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Local Rest Stop',
        title: 'Fresh King Coconut at Cliffside Kiosks',
        desc: 'Pause at family-run hillside wooden stalls along the trail for freshly tapped king coconut and warm Ceylon ginger tea.',
      },
      {
        iconType: 'compass',
        categoryTag: 'Historic Exploration',
        title: 'Walk the Rails Through the Stone Tunnel',
        desc: 'Between train schedules, walk along the historic rail sleepers and admire the 1921 British Ceylon stone masonry tunnel built entirely without steel reinforcement.',
      },
    ];
  } else if (cat.includes('ancient') || cat.includes('historic')) {
    return [
      {
        iconType: 'clock',
        categoryTag: 'Timing & Crowds',
        title: 'Beat the Midday Sun & Tour Groups',
        desc: 'Arrive at the ticket checkpoint right as gates open around 7:00 AM. You will climb in shaded morning breeze and capture pristine photographs.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Trail & Footwear',
        title: 'Wear Sturdy Shoes for Granite Steps',
        desc: 'Centuries-old stone staircases and carved rock channels can be polished smooth. Lightweight footwear with reliable traction is strongly advised.',
      },
      {
        iconType: 'compass',
        categoryTag: 'Archaeological Detail',
        title: 'Examine the Ancient Hydraulic Engineering',
        desc: 'Pause at the symmetrical royal water gardens and boulder foundations—some of the ancient world’s earliest gravity-fed fountain systems.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Sunset Viewpoint',
        title: 'Golden Hour Panorama Across the Plains',
        desc: 'The highest stone terrace offers uninterrupted 360-degree vistas extending across ancient reservoirs, emerald paddy fields, and distant jungle ranges.',
      },
    ];
  } else {
    return [
      {
        iconType: 'camera',
        categoryTag: 'Optimal Viewpoint',
        title: 'Morning Sun & Golden Hour Angles',
        desc: 'Morning mist and warm late afternoon sunlight bring out rich textures and vivid tropical greens across the surrounding landscape.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Guided Exploration',
        title: 'Follow Verified Footpaths',
        desc: 'Stay on marked walking trails to preserve native flora and enjoy the most scenic vantage points safely.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Local Hospitality',
        title: 'Authentic Island Spices & Refreshments',
        desc: 'Sample locally harvested spices, tropical fruit varieties, and freshly prepared Ceylon tea at family-owned neighborhood stalls.',
      },
    ];
  }
}

export default async function PlaceDetailPage({ params }: PlacePageProps) {
  const { id } = await params;
  const data = await getPlaceDetails(id);

  if (!data) {
    notFound();
  }

  const { place, reviews, relatedPlaces, nearbyAttractions } = data;
  const galleryImages = getGalleryImages(place);
  const thingsToDo = getThingsToDo(place);

  // Collect all reviewer photos from reviews
  const allReviewPhotos: string[] = [];
  for (const r of reviews) {
    if ((r as any).photos && Array.isArray((r as any).photos)) {
      allReviewPhotos.push(...(r as any).photos);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] text-[#0F2A3D] pt-20 sm:pt-24 pb-28">
      <PlaceViewTracker placeId={place.id} />
      
      {/* ━━━ 1. BREADCRUMB & TOP CONTROLS ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#5B7385] font-semibold">
            <Link href="/" className="hover:text-[#38A9F0] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/destinations" className="hover:text-[#38A9F0] transition-colors">
              Destinations
            </Link>
            <span>/</span>
            <Link
              href={`/destinations?category=${encodeURIComponent(place.category)}`}
              className="hover:text-[#38A9F0] transition-colors"
            >
              {place.category}
            </Link>
            <span>/</span>
            <span className="text-[#0F2A3D] truncate max-w-[180px] sm:max-w-none">
              {place.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <OfflineGuideButton place={place} variant="pill" />
            <WishlistButton placeId={place.id} placeName={place.name} variant="pill" />
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 bg-white border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#0F2A3D] font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#5B7385]" />
              <span className="hidden sm:inline">Back to Directory</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ━━━ TITLE & METADATA BAR (SECTION 4.6-C, BLOCK 1) ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#DCE8F2]">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-[#EAF4FD] text-[#38A9F0] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-[#DCEFFD]">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Ceylon Stop
              </span>
              <span className="text-[#DCE8F2]">•</span>
              <span className="text-xs font-semibold text-[#5B7385] uppercase tracking-wider">
                {place.province}
              </span>
              <span className="text-[#DCE8F2]">•</span>
              <span className="text-xs font-semibold text-[#38A9F0] bg-[#EAF4FD] px-2.5 py-0.5 rounded-full border border-[#DCEFFD]">
                {place.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F2A3D] tracking-tight leading-tight">
              {place.name}
            </h1>

            <p className="text-[#5B7385] text-sm sm:text-base leading-relaxed max-w-2xl">
              {place.short_description || place.description}
            </p>

            <div className="flex items-center gap-4 text-xs sm:text-sm pt-1 flex-wrap text-[#5B7385]">
              <span className="inline-flex items-center gap-1.5 text-[#0F2A3D] font-medium">
                <MapPin className="w-4 h-4 text-[#38A9F0] shrink-0" />
                {place.location}, Sri Lanka
              </span>
              <span className="text-[#DCE8F2] hidden sm:inline">•</span>
              <div className="flex items-center gap-1.5 text-[#0F2A3D] font-bold">
                <div className="flex items-center gap-1 bg-[#FFF9E6] px-2 py-0.5 rounded-md border border-[#FFE8A3]">
                  <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                  <span>{place.rating.toFixed(1)}</span>
                </div>
                <a
                  href="#reviews-folder"
                  className="text-[#5B7385] hover:text-[#38A9F0] underline font-normal transition-colors"
                >
                  ({place.review_count} verified traveler reviews)
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#38A9F0]/25 transition-all active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </div>

      {/* ━━━ 2. PHOTO MOSAIC (SECTION 4.6-C, BLOCK 2) ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <PhotoMosaic images={galleryImages} title={place.name} />
      </div>

      {/* ━━━ TWO-COLUMN LAYOUT: MAIN 11 FOLDERS + STICKY VISIT CARD ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          
          {/* ━━━ LEFT COLUMN: COLLAPSIBLE FOLDERS ━━━ */}
          <div className="space-y-6">
            
            {/* ━━━ BLOCK 4: WHY TRAVELERS LOVE THIS PLACE ━━━ */}
            {reviews.length > 0 && (
              <Folder
                id="travelers-love"
                title="Why Travelers Love This Place"
                subtitle="Recent impressions from visitors"
                icon={<Heart className="w-4 h-4" />}
                defaultOpen={true}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="bg-[#F5FAFF] rounded-2xl p-4.5 border border-[#DCE8F2] space-y-2 flex flex-col justify-between"
                    >
                      <p className="text-xs sm:text-sm text-[#0F2A3D] italic leading-relaxed line-clamp-3">
                        &ldquo;{r.comment}&rdquo;
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#DCE8F2] text-[11px] text-[#5B7385]">
                        <span className="font-bold text-[#0F2A3D]">{r.author}</span>
                        <div className="flex items-center gap-1 text-[#F5A623]">
                          <Star className="w-3 h-3 fill-[#F5A623]" />
                          <span className="font-bold">{r.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Folder>
            )}

            {/* ━━━ BLOCK 5: ABOUT & KEY FACTS FOLDER ━━━ */}
            <Folder
              id="about-place"
              title={`About ${place.name}`}
              subtitle="Overview, terrain, and practical tips"
              icon={<Compass className="w-4 h-4" />}
              defaultOpen={true}
            >
              <div className="space-y-6">
                {/* Description Text */}
                <div className="text-xs sm:text-sm text-[#0F2A3D] leading-relaxed whitespace-pre-line space-y-3">
                  <p>{place.description}</p>
                </div>

                {/* Good to Know Pills */}
                <div className="p-4.5 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] space-y-3">
                  <h4 className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider">
                    Good to Know Before You Go
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5B7385]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2FB67C] flex-shrink-0 mt-0.5" />
                      <span>Optimal morning light: Arrive early for tranquil photography</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2FB67C] flex-shrink-0 mt-0.5" />
                      <span>Footwear: Sturdy walking shoes recommended for unpaved terrain</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2FB67C] flex-shrink-0 mt-0.5" />
                      <span>Hydration: Carry refillable water bottle and sun protection</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#2FB67C] flex-shrink-0 mt-0.5" />
                      <span>Respect: Support local village fruit and tea vendors</span>
                    </div>
                  </div>
                </div>

                {/* Insider Tips List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider">
                    Curated Insider Insights
                  </h4>
                  <div className="space-y-3">
                    {thingsToDo.map((tip, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 border border-[#DCE8F2] space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#EAF4FD] text-[#38A9F0] text-[10px] font-bold uppercase tracking-wider">
                            {tip.categoryTag}
                          </span>
                          <h5 className="text-xs sm:text-sm font-bold text-[#0F2A3D]">
                            {tip.title}
                          </h5>
                        </div>
                        <p className="text-xs text-[#5B7385] leading-relaxed">
                          {tip.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Folder>

            {/* ━━━ BLOCK 6: HAVE QUESTIONS ABOUT {PLACE}? AI BOX ━━━ */}
            <PlaceAIQuestionBox placeName={place.name} category={place.category} />

            {/* ━━━ BLOCK 8: LOCATION & GETTING THERE FOLDER ━━━ */}
            <Folder
              id="location-folder"
              title="Location &amp; Getting There"
              subtitle={`${place.location} · ${place.province}`}
              icon={<MapPin className="w-4 h-4" />}
              defaultOpen={true}
            >
              <div className="space-y-6">
                <PlaceMap place={place} />

                {/* Nearby Attractions within Province */}
                {nearbyAttractions.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-[#F0F5FA]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider">
                        Nearby Highlights in {place.province}
                      </h4>
                      <Link
                        href={`/destinations?province=${encodeURIComponent(place.province)}`}
                        className="text-xs font-bold text-[#38A9F0] hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {nearbyAttractions.map((np) => (
                        <Link
                          key={np.id}
                          href={`/places/${np.id}`}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] hover:border-[#38A9F0]/40 transition-colors group"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#EAF4FD] flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={np.image_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80'}
                              alt={np.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#0F2A3D] group-hover:text-[#38A9F0] transition-colors truncate">
                              {np.name}
                            </h5>
                            <span className="text-[11px] text-[#5B7385] block truncate">
                              {np.category} · {np.location}
                            </span>
                            <div className="flex items-center gap-1 text-[11px] text-[#F5A623] font-bold mt-0.5">
                              <Star className="w-3 h-3 fill-[#F5A623]" />
                              <span>{np.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Folder>

            {/* ━━━ BLOCK 9: REVIEWS & COMMUNITY FEEDBACK FOLDER ━━━ */}
            <Folder
              id="reviews-folder"
              title="Traveler Reviews &amp; Ratings"
              subtitle={`Verified visitor experiences (${reviews.length})`}
              count={reviews.length}
              icon={<Star className="w-4 h-4" />}
              defaultOpen={true}
            >
              <ReviewSection
                placeId={place.id}
                placeName={place.name}
                initialReviews={reviews}
                rating={place.rating}
                reviewCount={place.review_count}
              />
            </Folder>

            {/* ━━━ BLOCK 10: COMMUNITY Q&A FOLDER ━━━ */}
            <Folder
              id="qa-folder"
              title="Community Q&amp;A"
              subtitle="Traveler questions and authentic local answers"
              icon={<MessageSquare className="w-4 h-4" />}
              defaultOpen={true}
            >
              <QAList placeId={place.id} placeName={place.name} />
            </Folder>

            {/* ━━━ BLOCK 11: TRAVELER PHOTOS STRIP FOLDER ━━━ */}
            {allReviewPhotos.length > 0 && (
              <Folder
                id="traveler-photos-folder"
                title="Traveler Photos"
                subtitle="Real visitor snaps taken on site"
                count={allReviewPhotos.length}
                icon={<ImageIcon className="w-4 h-4" />}
                defaultOpen={false}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {allReviewPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden bg-[#EAF4FD] border border-[#DCE8F2]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Traveler upload" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </Folder>
            )}

            {/* ━━━ BLOCK 7: YOU MAY ALSO LIKE (RECOMMENDATIONS ENGINE) ━━━ */}
            <Folder
              id="similar-places"
              title="Nearby & You Might Like"
              subtitle="Curated using geographic proximity, visitor journeys, and traveler affinity"
              icon={<Compass className="w-4 h-4" />}
              defaultOpen={true}
            >
              <RecommendationCarousel currentPlaceId={place.id} title="" subtitle="" limit={6} />
            </Folder>

          </div>

          {/* ━━━ RIGHT COLUMN: STICKY PLAN YOUR VISIT CARD ━━━ */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <PlanVisitCard place={place} />

            {/* Non-Disruptive Ad Placement 3: Sidebar Partner */}
            <AdPlacement placement="sidebar_partner" />

            {/* Share / Save Card */}
            <div className="bg-white rounded-3xl border border-[#DCE8F2] p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider">
                Traveler Tools
              </h4>
              <div className="flex items-center gap-2">
                <OfflineGuideButton place={place} variant="sidebar" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
