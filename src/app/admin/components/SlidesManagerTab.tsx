'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown,
  Upload, Save, X, Edit, Loader2, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface HeroSlide {
  id: number;
  image_url: string;
  location: string;
  province: string;
  title_en?: string;
  title_si?: string;
  subtitle_en?: string;
  subtitle_si?: string;
  sort_order: number;
  enabled?: number;
}

interface RegionSlide {
  id: number;
  image_url: string;
  title: string;
  title_si?: string;
  region: string;
  sort_order: number;
  enabled?: number;
}

export default function SlidesManagerTab() {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'region'>('hero');
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [regionSlides, setRegionSlides] = useState<RegionSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHeroSlide, setEditingHeroSlide] = useState<HeroSlide | null>(null);
  const [editingRegionSlide, setEditingRegionSlide] = useState<RegionSlide | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [heroForm, setHeroForm] = useState({
    image_url: '',
    location: '',
    province: 'Central Province',
    title_en: '',
    title_si: '',
    subtitle_en: '',
    subtitle_si: '',
    enabled: 1,
  });

  const [regionForm, setRegionForm] = useState({
    image_url: '',
    title: '',
    title_si: '',
    region: 'Southern Coast',
    enabled: 1,
  });

  const fetchHeroSlides = async () => {
    try {
      const res = await fetch('/api/hero-slides');
      if (res.ok) {
        const data = await res.json();
        setHeroSlides(data.slides || []);
      }
    } catch (err) {
      console.error('Fetch hero slides error:', err);
    }
  };

  const fetchRegionSlides = async () => {
    try {
      const res = await fetch('/api/region-slides');
      if (res.ok) {
        const data = await res.json();
        setRegionSlides(data.slides || []);
      }
    } catch (err) {
      console.error('Fetch region slides error:', err);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchHeroSlides(), fetchRegionSlides()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleFileUpload = async (file: File) => {
    const data = new FormData();
    data.append('file', file);
    setUploadingImage(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Upload failed');

      if (activeSubTab === 'hero') {
        setHeroForm((prev) => ({ ...prev, image_url: resData.url }));
      } else {
        setRegionForm((prev) => ({ ...prev, image_url: resData.url }));
      }
      toast.success('Optimized slide photo uploaded!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Reordering Hero Slides
  const moveHeroSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;

    const newSlides = [...heroSlides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIdx, 0, moved);
    setHeroSlides(newSlides);

    try {
      await fetch('/api/hero-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: newSlides }),
      });
      toast.success('Hero slide order saved');
    } catch {
      toast.error('Failed to save slide order');
      fetchHeroSlides();
    }
  };

  // Reordering Region Slides
  const moveRegionSlide = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= regionSlides.length) return;

    const newSlides = [...regionSlides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIdx, 0, moved);
    setRegionSlides(newSlides);

    try {
      await fetch('/api/region-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: newSlides }),
      });
      toast.success('Region slide order saved');
    } catch {
      toast.error('Failed to save slide order');
      fetchRegionSlides();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    const url = activeSubTab === 'hero' ? '/api/hero-slides' : '/api/region-slides';

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete slide');
      toast.success('Slide deleted');
      fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting slide');
    }
  };

  const handleOpenModal = (slide?: HeroSlide | RegionSlide) => {
    if (activeSubTab === 'hero') {
      const h = slide as HeroSlide | undefined;
      setEditingHeroSlide(h || null);
      setHeroForm({
        image_url: h?.image_url || '',
        location: h?.location || '',
        province: h?.province || 'Central Province',
        title_en: h?.title_en || '',
        title_si: h?.title_si || '',
        subtitle_en: h?.subtitle_en || '',
        subtitle_si: h?.subtitle_si || '',
        enabled: h?.enabled !== undefined ? h.enabled : 1,
      });
    } else {
      const r = slide as RegionSlide | undefined;
      setEditingRegionSlide(r || null);
      setRegionForm({
        image_url: r?.image_url || '',
        title: r?.title || '',
        title_si: r?.title_si || '',
        region: r?.region || 'Southern Coast',
        enabled: r?.enabled !== undefined ? r.enabled : 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeSubTab === 'hero') {
        const isEdit = Boolean(editingHeroSlide);
        const url = '/api/hero-slides';
        const method = isEdit ? 'PUT' : 'POST';
        const payload = isEdit ? { id: editingHeroSlide?.id, ...heroForm } : heroForm;

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to save hero slide');
      } else {
        const isEdit = Boolean(editingRegionSlide);
        const url = '/api/region-slides';
        const method = isEdit ? 'PUT' : 'POST';
        const payload = isEdit ? { id: editingRegionSlide?.id, ...regionForm } : regionForm;

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to save region slide');
      }

      toast.success('Slide saved successfully!');
      setIsModalOpen(false);
      fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving slide');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#DCE8F2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#0F2A3D]">Slides & Visual Banners Manager</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Section 5 & T5.2: Reorder slides, upload high-res optimized WebP images, and manage bilingual titles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[#DCE8F2] text-[#0F2A3D] hover:bg-[#F5FAFF] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#38A9F0] hover:bg-[#38A9F0]/90 shadow-md shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeSubTab === 'hero' ? 'Hero Slide' : 'Region Slide'}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCE8F2] pb-3">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'hero'
              ? 'bg-[#38A9F0] text-white shadow-sm'
              : 'bg-white text-[#5B7385] hover:text-[#0F2A3D] border border-[#DCE8F2]'
          }`}
        >
          <span>Hero Slides ({heroSlides.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('region')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'region'
              ? 'bg-[#38A9F0] text-white shadow-sm'
              : 'bg-white text-[#5B7385] hover:text-[#0F2A3D] border border-[#DCE8F2]'
          }`}
        >
          <span>Explore by Region ({regionSlides.length})</span>
        </button>
      </div>

      {/* Slides Grid / List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-[#DCE8F2] text-center text-xs text-[#5B7385]">
          Loading slides...
        </div>
      ) : activeSubTab === 'hero' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden flex flex-col group hover:border-[#38A9F0]/40 transition-all"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image_url} alt={slide.location} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  Order #{idx + 1}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-[#0F2A3D]">{slide.location}</h3>
                  <span className="text-xs text-[#5B7385]">{slide.province}</span>
                  {slide.title_si && (
                    <span className="text-[11px] text-[#38A9F0] block mt-0.5 font-medium">
                      {slide.title_si}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#DCE8F2]">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveHeroSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#5B7385] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveHeroSlide(idx, 'down')}
                      disabled={idx === heroSlides.length - 1}
                      className="p-1.5 rounded-lg border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#5B7385] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(slide)}
                      className="p-1.5 rounded-lg border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#38A9F0] transition-colors cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regionSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className="bg-white rounded-3xl border border-[#DCE8F2] shadow-sm overflow-hidden flex flex-col group hover:border-[#38A9F0]/40 transition-all"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                  Order #{idx + 1}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-black text-[#0F2A3D]">{slide.title}</h3>
                  <span className="text-xs text-[#5B7385]">{slide.region}</span>
                  {slide.title_si && (
                    <span className="text-[11px] text-[#38A9F0] block mt-0.5 font-medium">
                      {slide.title_si}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#DCE8F2]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveRegionSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#5B7385] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveRegionSlide(idx, 'down')}
                      disabled={idx === regionSlides.length - 1}
                      className="p-1.5 rounded-lg border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#5B7385] disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(slide)}
                      className="p-1.5 rounded-lg border border-[#DCE8F2] hover:bg-[#F5FAFF] text-[#38A9F0] transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#DCE8F2] shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#DCE8F2] pb-3">
              <h3 className="text-base font-bold text-[#0F2A3D]">
                {activeSubTab === 'hero'
                  ? editingHeroSlide ? 'Edit Hero Slide' : 'Add Hero Slide'
                  : editingRegionSlide ? 'Edit Region Slide' : 'Add Region Slide'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#5B7385] hover:bg-[#F5FAFF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Photo Input & Direct Upload */}
              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Slide Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={activeSubTab === 'hero' ? heroForm.image_url : regionForm.image_url}
                    onChange={(e) =>
                      activeSubTab === 'hero'
                        ? setHeroForm({ ...heroForm, image_url: e.target.value })
                        : setRegionForm({ ...regionForm, image_url: e.target.value })
                    }
                    placeholder="Enter image URL or upload..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#38A9F0] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#38A9F0]/90 transition-colors">
                    {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {activeSubTab === 'hero' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Location (English) *</label>
                      <input
                        type="text"
                        required
                        value={heroForm.location}
                        onChange={(e) => setHeroForm({ ...heroForm, location: e.target.value })}
                        placeholder="e.g. Sigiriya Rock Fortress"
                        className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Location (Sinhala)</label>
                      <input
                        type="text"
                        value={heroForm.title_si}
                        onChange={(e) => setHeroForm({ ...heroForm, title_si: e.target.value })}
                        placeholder="සීගිරිය"
                        className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Province</label>
                    <input
                      type="text"
                      value={heroForm.province}
                      onChange={(e) => setHeroForm({ ...heroForm, province: e.target.value })}
                      placeholder="e.g. Central Province"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Title (English) *</label>
                      <input
                        type="text"
                        required
                        value={regionForm.title}
                        onChange={(e) => setRegionForm({ ...regionForm, title: e.target.value })}
                        placeholder="e.g. Southern Coast"
                        className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Title (Sinhala)</label>
                      <input
                        type="text"
                        value={regionForm.title_si}
                        onChange={(e) => setRegionForm({ ...regionForm, title_si: e.target.value })}
                        placeholder="දකුණු වෙරළ තීරය"
                        className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Region Name</label>
                    <input
                      type="text"
                      value={regionForm.region}
                      onChange={(e) => setRegionForm({ ...regionForm, region: e.target.value })}
                      placeholder="e.g. Galle & Matara"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DCE8F2]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE8F2] text-xs font-bold text-[#5B7385]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#38A9F0] text-white text-xs font-bold hover:bg-[#38A9F0]/90 transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
