import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles, Map, MapPin, Heart, Globe, Users,
  ShieldCheck, CheckCircle2, ArrowRight,
  Zap, Cpu, Award, Feather, ChevronDown, Camera
} from 'lucide-react';
import { getAboutContent } from '@/lib/db/about';
import { getSiteNodes } from '@/lib/db/nodes';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us — UncoverCeylon | Serandib Co. Digital Initiative',
  description:
    'Learn about UncoverCeylon, founded by Ravindu Wijethunga and Gayan Rathnaweera under Serandib Co., featuring developer Sasindu Udantha and social media manager Venura Rashmika. Discovering the true beauty of Sri Lanka independently and free for every traveler.',
};

export default async function AboutPage() {
  const [content, activeNodes] = await Promise.all([
    getAboutContent(),
    getSiteNodes(false), // only enabled nodes
  ]);

  const enabledKeys = new Set(activeNodes.map((n) => n.node_key));

  // Zero-gap rule: If the page itself is disabled in Folder Manager, render nothing
  if (enabledKeys.size > 0 && !enabledKeys.has('page_about')) {
    return null;
  }

  const isEnabled = (key: string) => {
    if (enabledKeys.size === 0) return true;
    return enabledKeys.has(key);
  };

  const { hero, story, photos, values, team, contact } = content;

  return (
    <div className="min-h-screen w-full bg-[#F5FAFF] text-[#0F2A3D]">

      {/* ━━━ BLOCK 1: HERO BANNER (site_nodes: about_hero) ━━━ */}
      {isEnabled('about_hero') && (
        <section className="relative isolate min-h-[92vh] min-h-[92dvh] w-full overflow-hidden bg-[#0F2A3D] text-white flex flex-col justify-between">
          <Image
            src={hero.image_url}
            alt="Misty tea highlands of Sri Lanka"
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-center brightness-[0.65] transition-transform duration-1000 scale-105"
            unoptimized
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,42,61,0.82)_0%,rgba(15,42,61,0.55)_45%,rgba(15,42,61,0.95)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0F2A3D] via-[#0F2A3D]/70 to-transparent -z-10" />

          {/* Centered Hero Content */}
          <div className="mx-auto flex min-h-[85vh] min-h-[85dvh] w-full max-w-5xl flex-col items-center justify-center px-4 pb-24 pt-20 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-md mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{hero.pill_text}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              {hero.title}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-200">
                {hero.highlighted_text}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed font-medium">
              {hero.subtitle}
            </p>

            <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed">
              {hero.lead_text}
            </p>

            {/* Quick Metrics */}
            <div className="mt-10 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mx-auto">
              {hero.stats.map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/20 bg-black/25 sm:bg-white/10 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  <span className={`text-2xl sm:text-3xl font-black ${s.color || 'text-white'}`}>
                    {s.value}
                  </span>
                  <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
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
      )}

      {/* ━━━ BLOCK 2: FOUNDER'S VILLAGE STORY & NARRATIVE (site_nodes: about_story, T12.2) ━━━ */}
      {isEnabled('about_story') && (
        <section id="our-story" className="py-20 sm:py-28">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
            
            {/* Origin & Passion Grid */}
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sky-700 border border-sky-100">
                  <Feather className="h-3.5 w-3.5" />
                  <span>{story.badge}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#0F2A3D] tracking-tight">
                  {story.heading}
                </h2>

                {story.lead_paragraphs.map((p, idx) => (
                  <p key={idx} className="text-base sm:text-lg text-[#5B7385] leading-relaxed">
                    {p}
                  </p>
                ))}

                <div className="pt-4 border-t border-[#DCE8F2] flex flex-wrap items-center gap-6 text-sm font-semibold text-[#0F2A3D]">
                  {story.tenets.map((tenet, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sky-600">
                      <CheckCircle2 className="h-5 w-5 text-sky-600 flex-shrink-0" />
                      <span>{tenet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Founder Quote Card */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] p-8 sm:p-10 text-[#0F2A3D] shadow-sm border border-[#DCE8F2]">
                  <div className="absolute -top-16 -right-16 w-52 h-52 bg-[#38A9F0]/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 space-y-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#38A9F0] text-white flex items-center justify-center font-bold shadow-md shadow-[#38A9F0]/25">
                      <MapPin className="h-6 w-6" />
                    </div>

                    <blockquote className="text-xl sm:text-2xl font-semibold leading-snug text-[#0F2A3D] italic">
                      &ldquo;{story.founder_quote}&rdquo;
                    </blockquote>

                    <div className="border-t border-[#DCE8F2] pt-5 flex items-center justify-between text-xs text-[#5B7385]">
                      <div>
                        <p className="font-bold text-[#0F2A3D] text-sm">{story.quote_author}</p>
                        <p className="mt-0.5 text-[#38A9F0] font-medium">{story.quote_title}</p>
                      </div>
                      <span className="rounded-full bg-white border border-[#DCE8F2] px-3 py-1 text-[11px] font-semibold text-[#0F2A3D] shadow-2xs">
                        {story.established_year}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ━━━ FOUNDER'S VILLAGE NARRATIVE PLACEHOLDER (T12.2 Acceptance Requirement) ━━━ */}
            <div className="rounded-3xl bg-white border border-[#DCE8F2] p-8 sm:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-4xl space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>{story.village_story_badge}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F2A3D] tracking-tight">
                  {story.village_story_title}
                </h3>

                <div className="space-y-4 text-base text-[#5B7385] leading-relaxed">
                  {story.village_story_content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {story.village_story_note && (
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400 italic">
                    <Feather className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{story.village_story_note}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ━━━ BLOCK 3: VILLAGE & ISLAND PHOTOS (site_nodes: about_photos) ━━━ */}
      {isEnabled('about_photos') && (
        <section className="py-20 sm:py-24 bg-white border-y border-[#DCE8F2]">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF4FD] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#38A9F0] border border-[#DCEFFD]">
                <Camera className="h-3.5 w-3.5" />
                <span>{photos.badge}</span>
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#0F2A3D] tracking-tight">
                {photos.heading}
              </h2>
              <p className="mt-3 text-base text-[#5B7385]">
                {photos.description}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {photos.photos.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="group relative rounded-3xl overflow-hidden bg-slate-100 shadow-sm border border-[#DCE8F2] aspect-[4/5] flex flex-col justify-end p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A3D]/90 via-[#0F2A3D]/30 to-transparent" />

                  <div className="relative z-10 text-white">
                    {item.tag && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1">
                        {item.tag}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/80 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ BLOCK 4: CORE VALUES (site_nodes: about_values) ━━━ */}
      {isEnabled('about_values') && (
        <section className="py-20 sm:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF4FD] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#38A9F0] border border-[#DCEFFD]">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{values.badge}</span>
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#0F2A3D] tracking-tight">
                {values.heading}
              </h2>
              <p className="mt-3 text-base text-[#5B7385]">
                {values.description}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.values.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-[#DCE8F2] bg-white p-7 text-center shadow-2xs hover:shadow-md hover:border-[#38A9F0]/40 transition-all"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#EAF4FD] text-[#38A9F0] mx-auto flex items-center justify-center mb-5">
                    {idx === 0 && <Globe className="h-7 w-7" />}
                    {idx === 1 && <Zap className="h-7 w-7 text-amber-500" />}
                    {idx === 2 && <Cpu className="h-7 w-7" />}
                    {idx === 3 && <Heart className="h-7 w-7 text-rose-500" />}
                    {idx > 3 && <ShieldCheck className="h-7 w-7" />}
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2A3D]">{v.title}</h3>
                  <p className="mt-2 text-sm text-[#5B7385] leading-relaxed">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ━━━ BLOCK 5: TEAM & SERANDIB CO. CREDITS (site_nodes: about_team, T12.2) ━━━ */}
      {isEnabled('about_team') && (
        <section className="py-20 sm:py-28 bg-white border-t border-[#DCE8F2]">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
            
            {/* Leadership & Team Members */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF4FD] px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#38A9F0] border border-[#DCEFFD]">
                  <Users className="h-3.5 w-3.5" />
                  <span>{team.badge}</span>
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#0F2A3D] tracking-tight">
                  {team.heading}
                </h2>
                <p className="mt-3 text-base text-[#5B7385]">
                  {team.description}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {team.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-[#DCE8F2] bg-[#F5FAFF] p-7 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-5">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                            member.avatar_color || 'from-[#0F2A3D] to-[#38A9F0]'
                          } text-white flex items-center justify-center font-extrabold text-xl shadow-md border-2 border-white flex-shrink-0`}
                        >
                          {member.initials || member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#0F2A3D] leading-tight">
                            {member.name}
                          </h3>
                          <p className="text-xs font-bold text-[#38A9F0] mt-0.5">{member.role}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold text-[#5B7385] uppercase tracking-wider">
                            {member.tagline}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#5B7385] leading-relaxed">
                        {member.bio}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#DCE8F2] flex items-center justify-between text-[11px] text-[#5B7385]">
                      <span className="font-semibold text-[#0F2A3D]">{team.parent_company.name}</span>
                      <span className="font-bold text-[#38A9F0]">Sri Lanka 🇱🇰</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ━━━ SERANDIB CO. PARENT INITIATIVE SHOWCASE ━━━ */}
            <div className="rounded-3xl bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] text-[#0F2A3D] p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-sm border border-[#DCE8F2]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#38A9F0]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#38A9F0] border border-[#DCE8F2] mb-6 shadow-2xs">
                  <Award className="h-3.5 w-3.5" />
                  <span>{team.parent_company.badge}</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F2A3D] leading-tight">
                  {team.parent_company.heading}
                </h2>

                <p className="mt-6 text-lg sm:text-xl text-[#0F2A3D]/90 leading-relaxed font-normal">
                  {team.parent_company.tagline}
                </p>

                <p className="mt-4 text-sm sm:text-base text-[#5B7385] leading-relaxed">
                  {team.parent_company.description}
                </p>

                <div className="mt-8 pt-6 border-t border-[#DCE8F2] flex flex-wrap items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#38A9F0]">
                  {team.parent_company.pillars.map((pillar, idx) => (
                    <span key={idx}>✓ {pillar}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ━━━ BLOCK 6: CONTACT & EXPLORE CTA (site_nodes: about_contact) ━━━ */}
      {isEnabled('about_contact') && (
        <section className="py-20 sm:py-28 bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] text-[#0F2A3D] border-t border-[#DCE8F2] relative overflow-hidden">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#38A9F0] border border-[#DCE8F2] shadow-2xs mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{contact.badge}</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0F2A3D] leading-tight">
              {contact.heading}
            </h2>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-[#5B7385] leading-relaxed">
              {contact.description}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={contact.primary_button_link || '/destinations'}
                className="inline-flex items-center gap-2 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] px-7 py-3.5 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md shadow-[#38A9F0]/25"
              >
                <span>{contact.primary_button_text || 'Explore Destinations'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={contact.secondary_button_link || '/map'}
                className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-[#EAF4FD] border border-[#DCE8F2] px-7 py-3.5 text-sm font-bold text-[#0F2A3D] transition-all hover:scale-105 active:scale-95 shadow-xs"
              >
                <Map className="h-4 w-4 text-[#38A9F0]" />
                <span>{contact.secondary_button_text || 'Interactive Map'}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
