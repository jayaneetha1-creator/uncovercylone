import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles, Map, MapPin, Search, Heart, Globe, Users,
  ShieldCheck, CheckCircle2, ArrowRight, Star, Gem, Navigation,
  Smartphone, BookOpen, Layers, Zap, Cpu, Award, Route,
  TrendingUp, MessageSquare, Feather, Share2, ChevronDown
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — UncoverCeylon | Serandib Co. Digital Initiative',
  description:
    'Learn about UncoverCeylon, founded by Ravindu Wijethunga and Gayan Rathnaweera under Serandib Co., featuring developer Sasindu Udantha and social media manager Venura Rashmika. Discovering the true beauty of Sri Lanka independently and free for every traveler.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900">

      {/* ━━━ 1. HERO SECTION (FULL SCREEN) ━━━ */}
      <section className="relative isolate min-h-screen min-h-[100dvh] w-full overflow-hidden bg-[#0F2A3D] text-white flex flex-col justify-between">
        <Image
          src="https://images.unsplash.com/photo-1546708973-b339540b5162?w=1920&q=90"
          alt="Misty tea highlands of Sri Lanka"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center brightness-[0.70] transition-transform duration-1000 scale-105"
          unoptimized
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,42,61,0.78)_0%,rgba(15,42,61,0.50)_45%,rgba(15,42,61,0.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0F2A3D] via-[#0F2A3D]/70 to-transparent -z-10" />

        {/* Vertically Centered Hero Content */}
        <div className="mx-auto flex min-h-screen min-h-[100dvh] w-full max-w-5xl flex-col items-center justify-center px-4 pb-28 pt-24 text-center sm:px-6 lg:px-8">
          {/* Breadcrumb & Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Serandib Co. Initiative · Proudly Sri Lankan</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-200">UncoverCeylon</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed font-normal">
            Discovering the true beauty of Sri Lanka, one destination at a time.
          </p>

          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
            A free, open-access travel ecosystem crafted to empower independent travelers with authentic routes, live maps, and untold island wonders.
          </p>

          {/* Quick Highlight Stats */}
          <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/20 bg-black/25 sm:bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-amber-400">100%</span>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Free Forever</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/25 sm:bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-white">9 / 9</span>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Provinces Covered</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/25 sm:bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-sky-400">50+</span>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Curated Spots</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-black/25 sm:bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5">
              <span className="text-2xl sm:text-3xl font-bold text-white">100%</span>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">Local Island Data</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar matching Home page */}
        <div className="absolute bottom-6 sm:bottom-8 inset-x-0 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-t border-white/25 pt-4 text-xs">
            <div className="flex items-center gap-2.5 text-white/90">
              <MapPin className="h-4 w-4 text-sky-400" />
              <span className="font-bold text-white tracking-wide">Ella &amp; Central Highlands</span>
              <span className="text-white/60 hidden sm:inline">· Sri Lanka</span>
            </div>
            <Link
              href="#our-story"
              className="inline-flex items-center gap-1.5 text-white/90 hover:text-sky-300 font-semibold transition-colors"
            >
              <span>Our Story</span>
              <ChevronDown className="h-4 w-4 animate-bounce" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ 2. OUR STORY ━━━ */}
      <section id="our-story" className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 border border-sky-100">
                <Feather className="h-3.5 w-3.5" />
                <span>Our Story</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-900 tracking-tight">
                Born from a Passion for the Island We Call Home.
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                UncoverCeylon was founded by <strong>Ravindu Wijethunga</strong> (Founder & Lead Developer) and <strong>Gayan Rathnaweera</strong> (Co-Founder & Social Media Manager), alongside core team members <strong>Sasindu Udantha</strong> (Developer) and <strong>Venura Rashmika</strong> (Social Media Manager) — young Sri Lankan innovators who share a deep, lifelong passion for travel, technology, and showcasing the boundless wonder of Sri Lanka to the world.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                Having spent years trekking along misty mountain ridges in the Central Highlands, wandering through millennia-old royal ruins in the Cultural Triangle, and uncovering quiet, virgin surf bays along the Southern coastline, they noticed a recurring challenge: travelers had to rely on fragmented blogs, outdated guidebooks, or pricey commercial packages that often bypassed the island’s authentic soul.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                Determined to bridge this gap, they envisioned a single, unified, modern platform where accurate travel guidance, interactive satellite maps, and off-the-beaten-path destinations are completely open and free for all explorers.
              </p>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-6 text-sm font-semibold text-slate-900">
                <div className="flex items-center gap-2 text-sky-600">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                  <span>No commercial paywalls</span>
                </div>
                <div className="flex items-center gap-2 text-sky-600">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                  <span>Verified island GPS locations</span>
                </div>
                <div className="flex items-center gap-2 text-sky-600">
                  <CheckCircle2 className="h-5 w-5 text-sky-600" />
                  <span>Promoting local communities</span>
                </div>
              </div>
            </div>

            {/* Visual Story Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] p-8 text-[#0F2A3D] shadow-sm border border-[#DCE8F2]">
                <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#38A9F0]/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#38A9F0] text-white flex items-center justify-center font-bold shadow-md shadow-[#38A9F0]/25">
                    <MapPin className="h-6 w-6" />
                  </div>

                  <blockquote className="text-xl sm:text-2xl font-semibold leading-snug text-[#0F2A3D] italic">
                    &ldquo;Sri Lanka shouldn&apos;t just be visited — it should be felt, experienced, and uncovered on your own terms.&rdquo;
                  </blockquote>

                  <div className="border-t border-[#DCE8F2] pt-5 flex items-center justify-between text-xs text-[#5B7385]">
                    <div>
                      <p className="font-bold text-[#0F2A3D] text-sm">Ravindu Wijethunga &amp; Gayan Rathnaweera</p>
                      <p className="mt-0.5 text-[#38A9F0] font-medium">Founders, UncoverCeylon · Serandib Co.</p>
                    </div>
                    <span className="rounded-full bg-white border border-[#DCE8F2] px-3 py-1 text-[11px] font-semibold text-[#0F2A3D] shadow-2xs">
                      Est. 2026
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ 3. OUR MISSION ━━━ */}
      <section className="py-20 sm:py-24 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              <TargetIcon className="h-3.5 w-3.5" />
              <span>Our Purpose</span>
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-slate-900 tracking-tight">
              Our Mission
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Our goal is to help travelers discover Sri Lanka independently and confidently through a completely free travel platform. We want tourists to easily explore destinations, hidden gems, travel information, maps, routes, local insights, and cultural experiences without relying on expensive tour packages.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mission 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                <Navigation className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Make Sri Lanka Easier to Explore</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Streamlining island discovery with direct interactive maps, clear transportation advice, and intuitive regional filters.
              </p>
            </div>

            {/* Mission 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <Route className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Help Travelers Plan Independently</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Providing comprehensive guides so solo explorers, backpackers, and families can craft memorable journeys without costly middlemen.
              </p>
            </div>

            {/* Mission 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                <Gem className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Promote Lesser-Known Destinations</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Giving voice and visibility to secluded waterfalls, tranquil mountain shrines, and village stays that commercial tourism often neglects.
              </p>
            </div>

            {/* Mission 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Support Sustainable Tourism</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Advocating for mindful exploration, wildlife protection, plastic-free travel, and direct economic support for local communities.
              </p>
            </div>

            {/* Mission 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition-all sm:col-span-2 lg:col-span-2">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Provide Accurate Information for Free</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Ensuring that trusted opening hours, entry fees, road conditions, and local customs are always freely accessible to all travelers without subscriptions or paywalls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 4. WHAT WE OFFER ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 border border-sky-100">
              <Layers className="h-3.5 w-3.5" />
              <span>Features & Tools</span>
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-slate-900 tracking-tight">
              What We Offer
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600">
              Designed from the ground up to give you effortless command over your Sri Lankan journey.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-sky-600/30">
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Destination Discovery</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Explore famous iconic attractions and hidden gems across Sri Lanka with stunning photography and verified guides.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-sky-600/30">
                <Map className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Interactive Maps</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Easy navigation and location guidance with custom satellite, terrain, and street map modes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-sky-600/30">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Travel Information</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Detailed descriptions, practical tips, best hours, and authentic visitor advice for every spot.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-sky-600/30">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Province-Based Exploration</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Browse destinations systematically across all 9 provinces to plan seamless multi-day regional routes.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-amber-400/30">
                <Gem className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Hidden Gems Collection</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Discover secluded places, secret swimming holes, and viewpoints far beyond typical tourist routes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-sky-600/30">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Search System</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Quickly search destinations, filter by categories, and sort by rating, reviews, or distance.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-sky-600/30">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Mobile-Friendly Experience</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Access your travel guides anywhere on the go with responsive, lightweight, touch-optimized layouts.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform shadow-sm shadow-amber-400/30">
                <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h3 className="text-xs sm:text-base font-bold text-slate-900">Free Access</h3>
              <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm text-slate-600 leading-relaxed">
                Open to all travelers around the globe with no subscriptions, premium tiers, or hidden fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 5. WHY CHOOSE UNCOVERCEYLON ━━━ */}
      <section className="py-20 sm:py-24 bg-white border-y border-[#DCE8F2] text-[#0F2A3D]">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF4FD] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#38A9F0] border border-[#DCEFFD]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>The Advantage</span>
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black leading-tight text-[#0F2A3D] tracking-tight">
              Why Choose UncoverCeylon
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#5B7385]">
              Built differently from standard travel portals — focused purely on authenticity, freedom, and user delight.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: 'Free Platform', desc: 'No paywalls, subscriptions, or gated content. Every map coordinate and tip is free.' },
              { title: 'Easy Navigation', desc: 'A clean, uncluttered interface that gets you from discovery to destination in seconds.' },
              { title: 'Local Insights', desc: 'Curated by native Sri Lankans who know the nuances of local culture and unmapped roads.' },
              { title: 'Hidden Destinations', desc: 'Step away from crowded tourist hotspots into serene, untouched nature and village life.' },
              { title: 'Modern User Experience', desc: 'Fast Next.js architecture with instant filtering, zero bloat, and smooth transitions.' },
              { title: 'Continuously Updated Content', desc: 'Our team regularly inspects and updates place information, safety tips, and routes.' },
              { title: 'Built by Sri Lankans', desc: 'Rooted in true island pride and dedicated to showcasing the pearl of the Indian Ocean.' },
            ].map((item, idx) => (
              <div
                key={item.title}
                className={`rounded-2xl border border-[#DCE8F2] bg-[#F5FAFF] p-6 hover:bg-[#EAF4FD] hover:border-[#38A9F0]/40 transition-all shadow-2xs ${
                  idx === 6 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#38A9F0] text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-[#38A9F0]/30">
                    ✓
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F2A3D]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#5B7385] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 6. OUR VISION FOR THE FUTURE ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 border border-sky-100">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Our Roadmap</span>
              </span>

              <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-slate-900 tracking-tight">
                Our Vision for the Future
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                We are on a continuous mission to become Sri Lanka&apos;s leading digital travel discovery platform — bridging cutting-edge technology with the rich warmth of island hospitality.
              </p>

              <p className="text-base text-slate-600 leading-relaxed">
                As we expand, our platform will evolve into a smart travel companion, connecting explorers directly with local hosts, verified community feedback, and intelligent planning tools.
              </p>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-sm font-bold text-slate-900">
                  Have a suggestion or want to partner?
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  We welcome contributions from fellow travelers, local tour operators, and photography enthusiasts.
                </p>
              </div>
            </div>

            {/* Future Features Grid */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Personalized Trip Planning', desc: 'Create custom day-by-day travel schedules saved directly to your profile.', icon: MapPin },
                { title: 'AI Travel Assistant', desc: 'Smart conversational recommendations based on your budget, interests, and style.', icon: Cpu },
                { title: 'Route Recommendations', desc: 'Optimized scenic driving, train, and bus paths with recommended stops.', icon: Route },
                { title: 'Travel Itineraries', desc: 'Expertly designed 3-day, 7-day, and 14-day themed island escapes.', icon: BookOpen },
                { title: 'User Reviews & Photos', desc: 'Real, authentic feedback and unedited pictures from international and local travelers.', icon: Star },
                { title: 'Travel Blogs & Stories', desc: 'Deep cultural stories, cuisine guides, train schedules, and local folklore.', icon: MessageSquare },
                { title: 'Community Contributions', desc: 'Empowering local guides to submit unmapped spots and cultural events.', icon: Users },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-300 transition-colors ${
                      i === 6 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ 7. MEET THE TEAM ━━━ */}
      <section className="py-20 sm:py-28 bg-slate-50 border-y border-slate-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              <Users className="h-3.5 w-3.5" />
              <span>Leadership &amp; Team</span>
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-slate-900 tracking-tight">
              Meet the Team Behind UncoverCeylon
            </h2>
            <p className="mt-4 text-base text-slate-600">
              The passionate Sri Lankan innovators, engineers, and digital storytellers shaping the next generation of open-access island exploration.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Member 1: Ravindu Wijethunga */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2A3D] to-[#38A9F0] text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-white flex-shrink-0">
                    RW
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Ravindu Wijethunga</h3>
                    <p className="text-xs font-bold text-sky-600 mt-0.5">Founder &amp; Developer</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Product Architecture · Engineering
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Passionate about software architecture and tourism innovation. Ravindu guides the product strategy, system engineering, interactive map engines, and core vision of UncoverCeylon under Serandib Co., striving to make travel universally accessible and free.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Serandib Co.</span>
                <span className="font-bold text-sky-600">Sri Lanka 🇱🇰</span>
              </div>
            </div>

            {/* Member 2: Gayan Rathnaweera */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-sky-400 text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-amber-400 flex-shrink-0">
                    GR
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Gayan Rathnaweera</h3>
                    <p className="text-xs font-bold text-sky-600 mt-0.5">Co-Founder &amp; Social Media</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Community Growth · Brand Strategy
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Driving brand presence and digital outreach across global travel communities. Gayan spearheads social media engagement, traveler storytelling, and creative partnerships to share Sri Lanka&apos;s wonders with explorers worldwide.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Serandib Co.</span>
                <span className="font-bold text-sky-600">Sri Lanka 🇱🇰</span>
              </div>
            </div>

            {/* Member 3: Sasindu Udantha */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-sky-400 flex-shrink-0">
                    SU
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Sasindu Udantha</h3>
                    <p className="text-xs font-bold text-indigo-600 mt-0.5">Developer</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Frontend Systems · Performance
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Dedicated software developer focused on crafting responsive, intuitive, and modern user interfaces. Sasindu develops high-performance frontend components and interactive features to ensure a seamless exploration experience on any screen.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Serandib Co.</span>
                <span className="font-bold text-sky-600">Sri Lanka 🇱🇰</span>
              </div>
            </div>

            {/* Member 4: Venura Rashmika */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-amber-400 flex-shrink-0">
                    VR
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Venura Rashmika</h3>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">Social Media Manager</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Content Creation · Visual Media
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Creative content specialist crafting compelling visual reels, island photography highlights, and real-time destination updates. Venura inspires traveler curiosity and builds active engagement across the Serandib digital travel network.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Serandib Co.</span>
                <span className="font-bold text-sky-600">Sri Lanka 🇱🇰</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ━━━ 8. COMPANY SECTION (SERANDIB CO.) ━━━ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] text-[#0F2A3D] p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-sm border border-[#DCE8F2]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#38A9F0]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#38A9F0] border border-[#DCE8F2] mb-6 shadow-2xs">
                <Award className="h-3.5 w-3.5" />
                <span>Parent Initiative</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F2A3D] leading-tight">
                Serandib Co.
              </h2>

              <p className="mt-6 text-lg sm:text-xl text-[#0F2A3D]/90 leading-relaxed font-normal">
                A Sri Lankan digital initiative dedicated to creating innovative platforms that promote local culture, tourism, and technology.
              </p>

              <p className="mt-4 text-sm sm:text-base text-[#5B7385] leading-relaxed">
                Rooted in the royal legacy of our island — famous across historical seafaring lore for serenity and wonder — Serandib Co. champions high-impact digital ventures that showcase Sri Lanka’s unparalleled heritage, craftsmanship, and ecological treasures to global audiences.
              </p>

              <div className="mt-8 pt-6 border-t border-[#DCE8F2] flex flex-wrap items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#38A9F0]">
                <span>✓ Technology &amp; Culture</span>
                <span>✓ Open Tourism Infrastructure</span>
                <span>✓ Colombo, Sri Lanka</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 9. VALUES SECTION ━━━ */}
      <section className="py-20 sm:py-24 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Core Values</span>
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight text-slate-900 tracking-tight">
              Values That Guide Us
            </h2>
            <p className="mt-4 text-base text-slate-600">
              The core principles behind every guide, map coordinate, and line of code we craft.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Value 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-5">
                <Globe className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Authenticity</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Showing the real Sri Lanka with honest perspectives, unedited local beauty, and genuine cultural appreciation.
              </p>
            </div>

            {/* Value 2 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-5">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Accessibility</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Making essential travel information freely available to everyone without financial or technical barriers.
              </p>
            </div>

            {/* Value 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-5">
                <Cpu className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Innovation</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Using technology, interactive GIS mapping, and high-performance design to enrich travel experiences.
              </p>
            </div>

            {/* Value 4 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-5">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Community</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Supporting local tourism, village eco-initiatives, and the communities who protect our island sanctuaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 10. FINAL CTA SECTION ━━━ */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] text-[#0F2A3D] border-t border-[#DCE8F2] relative overflow-hidden">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#38A9F0] border border-[#DCE8F2] shadow-2xs mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Embark on Your Journey</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F2A3D] leading-tight">
            Start Exploring Sri Lanka Today
          </h2>

          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-[#5B7385] leading-relaxed">
            Discover breathtaking destinations, hidden gems, and unforgettable experiences with UncoverCeylon.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/#explore"
              className="inline-flex items-center gap-2 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] px-7 py-3.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#38A9F0]/25"
            >
              <span>Explore Destinations</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-[#EAF4FD] border border-[#DCE8F2] px-7 py-3.5 text-sm font-bold text-[#0F2A3D] transition-all hover:scale-105 active:scale-95 shadow-xs"
            >
              <Map className="h-4 w-4 text-[#38A9F0]" />
              <span>Interactive Map</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
