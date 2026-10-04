'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Save, RotateCcw, ExternalLink, Sparkles, MapPin,
  Heart, Users, Award, ShieldCheck, Image as ImageIcon,
  CheckCircle2, AlertCircle, Loader2, Plus, Trash2, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AboutPageData,
  DEFAULT_ABOUT_DATA,
  AboutPhotoItem,
  AboutValueItem,
  AboutTeamMember
} from '@/lib/about/constants';

export default function AboutEditorTab() {
  const [data, setData] = useState<AboutPageData>(DEFAULT_ABOUT_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'story' | 'photos' | 'values' | 'team' | 'contact'>('story');

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/about');
      if (res.ok) {
        const json = await res.json();
        if (json.content) {
          setData(json.content);
        }
      }
    } catch (err) {
      console.error('Failed to load about content:', err);
      toast.error('Failed to load About page configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: data }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      toast.success('About page updated successfully! Live page revalidated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all About Page content back to default values? Any unsaved edits will be lost.')) {
      setData(DEFAULT_ABOUT_DATA);
      toast('Reset to default values in editor. Click "Save All Changes" to persist.', { icon: 'ℹ️' });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#5B7385]">
        <Loader2 className="w-8 h-8 animate-spin text-[#38A9F0] mb-3" />
        <p className="text-sm font-semibold">Loading About Page content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">About Page Editor</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Configure all 6 editable blocks of the About page including the Founder&apos;s Village Story and SERANDIB CO. credits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#0F2A3D] bg-[#F5FAFF] hover:bg-[#EAF4FD] border border-[#DCE8F2] transition-colors"
          >
            <span>View Live /about</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#38A9F0]" />
          </a>

          <button
            onClick={handleResetDefaults}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#5B7385] hover:text-[#0F2A3D] bg-white hover:bg-slate-50 border border-[#DCE8F2] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#38A9F0] hover:bg-[#1E93DC] transition-all shadow-md shadow-[#38A9F0]/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'story', label: "Founder's Village Story", icon: Heart },
          { id: 'hero', label: 'Hero Banner', icon: Sparkles },
          { id: 'photos', label: 'Village & Island Photos', icon: ImageIcon },
          { id: 'values', label: 'Mission & Values', icon: ShieldCheck },
          { id: 'team', label: 'Team & Serandib Co.', icon: Users },
          { id: 'contact', label: 'Contact & CTA', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F2A3D] text-white shadow-sm'
                  : 'bg-white text-[#5B7385] hover:bg-[#EAF4FD] hover:text-[#0F2A3D] border border-[#DCE8F2]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ━━━ SECTION 1: FOUNDER VILLAGE STORY & NARRATIVE (T12.2) ━━━ */}
      {activeSection === 'story' && (
        <div className="space-y-6">
          {/* Prominent Notice for Founder's Village Story */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-4 text-amber-900">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Founder&apos;s Village Story Placeholder (T12.2 &amp; R34)
              </h3>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                As specified in the Master Spec, this section holds a dedicated placeholder narrative honoring the founder&apos;s ancestral village. The site owner can replace or customize this text with his actual personal memories and village lore at any time.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
            <div className="border-b border-[#DCE8F2] pb-4">
              <h3 className="text-base font-bold text-[#0F2A3D]">Founder&apos;s Village Narrative</h3>
              <p className="text-xs text-[#5B7385] mt-0.5">
                The authentic roots and cultural legacy from which UncoverCeylon took inspiration.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Section Badge</label>
                <input
                  type="text"
                  value={data.story.village_story_badge}
                  onChange={(e) =>
                    setData({ ...data, story: { ...data.story, village_story_badge: e.target.value } })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Narrative Title</label>
                <input
                  type="text"
                  value={data.story.village_story_title}
                  onChange={(e) =>
                    setData({ ...data, story: { ...data.story, village_story_title: e.target.value } })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">
                Village Story Paragraphs (One per box)
              </label>
              <div className="space-y-3">
                {data.story.village_story_content.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <textarea
                      rows={3}
                      value={p}
                      onChange={(e) => {
                        const next = [...data.story.village_story_content];
                        next[idx] = e.target.value;
                        setData({ ...data, story: { ...data.story, village_story_content: next } });
                      }}
                      className="w-full text-xs p-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 leading-relaxed"
                    />
                    {data.story.village_story_content.length > 1 && (
                      <button
                        onClick={() => {
                          const next = data.story.village_story_content.filter((_, i) => i !== idx);
                          setData({ ...data, story: { ...data.story, village_story_content: next } });
                        }}
                        className="p-2 self-start rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete paragraph"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setData({
                    ...data,
                    story: {
                      ...data.story,
                      village_story_content: [...data.story.village_story_content, ''],
                    },
                  });
                }}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#38A9F0] hover:text-[#1E93DC] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Village Story Paragraph</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">
                Owner Note / Explanatory Footnote
              </label>
              <input
                type="text"
                value={data.story.village_story_note}
                onChange={(e) =>
                  setData({ ...data, story: { ...data.story, village_story_note: e.target.value } })
                }
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 italic text-[#5B7385]"
              />
            </div>

            <div className="border-t border-[#DCE8F2] pt-6 space-y-4">
              <h4 className="text-sm font-bold text-[#0F2A3D]">Founder Quote &amp; Attribution</h4>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Founder Quote Text</label>
                <textarea
                  rows={2}
                  value={data.story.founder_quote}
                  onChange={(e) =>
                    setData({ ...data, story: { ...data.story, founder_quote: e.target.value } })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-medium italic"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Quote Author</label>
                  <input
                    type="text"
                    value={data.story.quote_author}
                    onChange={(e) =>
                      setData({ ...data, story: { ...data.story, quote_author: e.target.value } })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Author Title / Subtitle</label>
                  <input
                    type="text"
                    value={data.story.quote_title}
                    onChange={(e) =>
                      setData({ ...data, story: { ...data.story, quote_title: e.target.value } })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Established Year</label>
                  <input
                    type="text"
                    value={data.story.established_year}
                    onChange={(e) =>
                      setData({ ...data, story: { ...data.story, established_year: e.target.value } })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ━━━ SECTION 2: HERO BANNER (about_hero) ━━━ */}
      {activeSection === 'hero' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
          <div className="border-b border-[#DCE8F2] pb-4">
            <h3 className="text-base font-bold text-[#0F2A3D]">Hero Banner Settings</h3>
            <p className="text-xs text-[#5B7385] mt-0.5">
              The top full-width visual banner welcoming visitors to UncoverCeylon.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Breadcrumb Pill Text</label>
              <input
                type="text"
                value={data.hero.pill_text}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, pill_text: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Hero Image URL</label>
              <input
                type="text"
                value={data.hero.image_url}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, image_url: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Main Title</label>
              <input
                type="text"
                value={data.hero.title}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Highlighted Brand Text</label>
              <input
                type="text"
                value={data.hero.highlighted_text}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, highlighted_text: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-bold text-[#38A9F0]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Tagline Subtitle</label>
            <input
              type="text"
              value={data.hero.subtitle}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Lead Description Paragraph</label>
            <textarea
              rows={3}
              value={data.hero.lead_text}
              onChange={(e) => setData({ ...data, hero: { ...data.hero, lead_text: e.target.value } })}
              className="w-full text-xs p-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-2">Key Metric Cards (4 cards)</label>
            <div className="grid sm:grid-cols-4 gap-3">
              {data.hero.stats.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-[#DCE8F2] bg-[#F5FAFF] space-y-2">
                  <input
                    type="text"
                    value={s.value}
                    onChange={(e) => {
                      const next = [...data.hero.stats];
                      next[idx] = { ...next[idx], value: e.target.value };
                      setData({ ...data, hero: { ...data.hero, stats: next } });
                    }}
                    placeholder="e.g. 100%"
                    className="w-full text-base font-black px-2.5 py-1.5 rounded-lg border border-[#DCE8F2] bg-white text-center"
                  />
                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => {
                      const next = [...data.hero.stats];
                      next[idx] = { ...next[idx], label: e.target.value };
                      setData({ ...data, hero: { ...data.hero, stats: next } });
                    }}
                    placeholder="e.g. Free Forever"
                    className="w-full text-[11px] font-semibold px-2 py-1 rounded-lg border border-[#DCE8F2] bg-white text-center text-[#5B7385]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ━━━ SECTION 3: PHOTOS GALLERY (about_photos) ━━━ */}
      {activeSection === 'photos' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
          <div className="border-b border-[#DCE8F2] pb-4">
            <h3 className="text-base font-bold text-[#0F2A3D]">Island &amp; Village Photo Gallery</h3>
            <p className="text-xs text-[#5B7385] mt-0.5">
              Highlight frames of authentic Sri Lankan landscapes, heritage, and village sanctuaries.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Section Badge</label>
              <input
                type="text"
                value={data.photos.badge}
                onChange={(e) => setData({ ...data, photos: { ...data.photos, badge: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Heading</label>
              <input
                type="text"
                value={data.photos.heading}
                onChange={(e) => setData({ ...data, photos: { ...data.photos, heading: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-2">Gallery Photos</label>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.photos.photos.map((item, idx) => (
                <div key={item.id || idx} className="p-4 rounded-2xl border border-[#DCE8F2] bg-[#F5FAFF] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F2A3D]">
                    <span>Photo #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const next = data.photos.photos.filter((_, i) => i !== idx);
                        setData({ ...data, photos: { ...data.photos, photos: next } });
                      }}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Image URL"
                    value={item.image_url}
                    onChange={(e) => {
                      const next = [...data.photos.photos];
                      next[idx] = { ...next[idx], image_url: e.target.value };
                      setData({ ...data, photos: { ...data.photos, photos: next } });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white font-mono text-[11px]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title}
                      onChange={(e) => {
                        const next = [...data.photos.photos];
                        next[idx] = { ...next[idx], title: e.target.value };
                        setData({ ...data, photos: { ...data.photos, photos: next } });
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white font-semibold"
                    />

                    <input
                      type="text"
                      placeholder="Location"
                      value={item.location}
                      onChange={(e) => {
                        const next = [...data.photos.photos];
                        next[idx] = { ...next[idx], location: e.target.value };
                        setData({ ...data, photos: { ...data.photos, photos: next } });
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-[#5B7385]"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newPhoto: AboutPhotoItem = {
                  id: `photo-${Date.now()}`,
                  title: 'New Sri Lankan Frame',
                  location: 'Sri Lanka',
                  image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1000&q=80',
                  tag: 'Island View',
                };
                setData({ ...data, photos: { ...data.photos, photos: [...data.photos.photos, newPhoto] } });
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#38A9F0] hover:text-[#1E93DC] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* ━━━ SECTION 4: MISSION & CORE VALUES (about_values) ━━━ */}
      {activeSection === 'values' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
          <div className="border-b border-[#DCE8F2] pb-4">
            <h3 className="text-base font-bold text-[#0F2A3D]">Mission &amp; Guiding Values</h3>
            <p className="text-xs text-[#5B7385] mt-0.5">
              The core principles driving UncoverCeylon&apos;s open, community-first ethos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Section Badge</label>
              <input
                type="text"
                value={data.values.badge}
                onChange={(e) => setData({ ...data, values: { ...data.values, badge: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Heading</label>
              <input
                type="text"
                value={data.values.heading}
                onChange={(e) => setData({ ...data, values: { ...data.values, heading: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-2">Value Pillars</label>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.values.values.map((v, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#DCE8F2] bg-[#F5FAFF] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F2A3D]">Pillar #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const next = data.values.values.filter((_, i) => i !== idx);
                        setData({ ...data, values: { ...data.values, values: next } });
                      }}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                    >
                      Delete
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Pillar Title"
                    value={v.title}
                    onChange={(e) => {
                      const next = [...data.values.values];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setData({ ...data, values: { ...data.values, values: next } });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white font-bold"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description"
                    value={v.description}
                    onChange={(e) => {
                      const next = [...data.values.values];
                      next[idx] = { ...next[idx], description: e.target.value };
                      setData({ ...data, values: { ...data.values, values: next } });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DCE8F2] bg-white leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newVal: AboutValueItem = {
                  icon: 'Shield',
                  title: 'New Value',
                  description: 'Description of core value.',
                };
                setData({ ...data, values: { ...data.values, values: [...data.values.values, newVal] } });
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#38A9F0] hover:text-[#1E93DC] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Value Pillar</span>
            </button>
          </div>
        </div>
      )}

      {/* ━━━ SECTION 5: TEAM & SERANDIB CO. CREDITS (about_team) ━━━ */}
      {activeSection === 'team' && (
        <div className="space-y-6">
          {/* Serandib Co. Card */}
          <div className="bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#38A9F0]" />
              <h3 className="text-base font-black text-[#0F2A3D]">Parent Initiative: SERANDIB CO.</h3>
            </div>
            <p className="text-xs text-[#5B7385]">
              As specified in the Master Spec, the SERANDIB CO. parent credit must be clearly featured.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Initiative Heading</label>
                <input
                  type="text"
                  value={data.team.parent_company.heading}
                  onChange={(e) =>
                    setData({
                      ...data,
                      team: {
                        ...data.team,
                        parent_company: { ...data.team.parent_company, heading: e.target.value },
                      },
                    })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Tagline / Mission</label>
                <input
                  type="text"
                  value={data.team.parent_company.tagline}
                  onChange={(e) =>
                    setData({
                      ...data,
                      team: {
                        ...data.team,
                        parent_company: { ...data.team.parent_company, tagline: e.target.value },
                      },
                    })
                  }
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Initiative Narrative</label>
              <textarea
                rows={3}
                value={data.team.parent_company.description}
                onChange={(e) =>
                  setData({
                    ...data,
                    team: {
                      ...data.team,
                      parent_company: { ...data.team.parent_company, description: e.target.value },
                    },
                  })
                }
                className="w-full text-xs p-3 rounded-xl border border-[#DCE8F2] bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* Core Team Members */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
            <div className="border-b border-[#DCE8F2] pb-4">
              <h3 className="text-base font-bold text-[#0F2A3D]">Core Team Members</h3>
              <p className="text-xs text-[#5B7385] mt-0.5">
                Profiles of the founders and engineers building UncoverCeylon.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {data.team.members.map((member, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#DCE8F2] bg-[#F5FAFF] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F2A3D]">Member #{idx + 1}</span>
                    <button
                      onClick={() => {
                        const next = data.team.members.filter((_, i) => i !== idx);
                        setData({ ...data, team: { ...data.team, members: next } });
                      }}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer text-xs"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const next = [...data.team.members];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setData({ ...data, team: { ...data.team, members: next } });
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white font-bold"
                    />

                    <input
                      type="text"
                      placeholder="Role"
                      value={member.role}
                      onChange={(e) => {
                        const next = [...data.team.members];
                        next[idx] = { ...next[idx], role: e.target.value };
                        setData({ ...data, team: { ...data.team, members: next } });
                      }}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white font-semibold text-[#38A9F0]"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Focus Tagline"
                    value={member.tagline}
                    onChange={(e) => {
                      const next = [...data.team.members];
                      next[idx] = { ...next[idx], tagline: e.target.value };
                      setData({ ...data, team: { ...data.team, members: next } });
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-[11px] text-[#5B7385]"
                  />

                  <textarea
                    rows={2}
                    placeholder="Bio"
                    value={member.bio}
                    onChange={(e) => {
                      const next = [...data.team.members];
                      next[idx] = { ...next[idx], bio: e.target.value };
                      setData({ ...data, team: { ...data.team, members: next } });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#DCE8F2] bg-white leading-relaxed"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                const newMember: AboutTeamMember = {
                  name: 'Team Member',
                  role: 'Contributor',
                  tagline: 'Community & Exploration',
                  bio: 'Passionate travel contributor.',
                  initials: 'TM',
                  avatar_color: 'from-sky-600 to-sky-400',
                };
                setData({ ...data, team: { ...data.team, members: [...data.team.members, newMember] } });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38A9F0] hover:text-[#1E93DC] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team Member</span>
            </button>
          </div>
        </div>
      )}

      {/* ━━━ SECTION 6: CONTACT & CTA (about_contact) ━━━ */}
      {activeSection === 'contact' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
          <div className="border-b border-[#DCE8F2] pb-4">
            <h3 className="text-base font-bold text-[#0F2A3D]">Call to Action &amp; Community Contact</h3>
            <p className="text-xs text-[#5B7385] mt-0.5">
              The bottom conversion banner encouraging exploration and partner inquiries.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">CTA Heading</label>
              <input
                type="text"
                value={data.contact.heading}
                onChange={(e) => setData({ ...data, contact: { ...data.contact, heading: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Badge Text</label>
              <input
                type="text"
                value={data.contact.badge}
                onChange={(e) => setData({ ...data, contact: { ...data.contact, badge: e.target.value } })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Description Paragraph</label>
            <textarea
              rows={2}
              value={data.contact.description}
              onChange={(e) => setData({ ...data, contact: { ...data.contact, description: e.target.value } })}
              className="w-full text-xs p-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]/40 leading-relaxed"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Primary Button Label &amp; Link</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={data.contact.primary_button_text}
                  onChange={(e) => setData({ ...data, contact: { ...data.contact, primary_button_text: e.target.value } })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] font-semibold"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={data.contact.primary_button_link}
                  onChange={(e) => setData({ ...data, contact: { ...data.contact, primary_button_link: e.target.value } })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1.5">Secondary Button Label &amp; Link</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  value={data.contact.secondary_button_text}
                  onChange={(e) => setData({ ...data, contact: { ...data.contact, secondary_button_text: e.target.value } })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] font-semibold"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={data.contact.secondary_button_link}
                  onChange={(e) => setData({ ...data, contact: { ...data.contact, secondary_button_link: e.target.value } })}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
