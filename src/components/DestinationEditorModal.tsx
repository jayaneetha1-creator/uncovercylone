'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Place } from '@/types';
import {
  X, Save, Upload, Loader2, MapPin, Image as ImageIcon,
  CheckCircle2, Plus, Minus, Globe, Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MapLocationPicker = dynamic(() => import('@/components/MapLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] flex flex-col items-center justify-center text-[#5B7385]">
      <Loader2 className="w-6 h-6 animate-spin text-[#38A9F0] mb-2" />
      <span className="text-xs font-bold">Loading interactive map pin...</span>
    </div>
  ),
});

const CATEGORIES = [
  'Beaches', 'Waterfalls', 'Mountains', 'Ancient Sites',
  'Wildlife', 'Hidden Gems', 'Historical', 'Religious Places'
];

const PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province', 'Northern Province',
  'Eastern Province', 'North Western Province', 'North Central Province', 'Uva Province',
  'Sabaragamuwa Province'
];

interface DestinationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  place?: Place | null;
  adminPassword?: string;
  onSuccess: () => void;
}

export default function DestinationEditorModal({
  isOpen,
  onClose,
  place,
  adminPassword,
  onSuccess,
}: DestinationEditorModalProps) {
  const isEditMode = Boolean(place);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form State - Essential fields + Advanced fields behind '+'
  const [formData, setFormData] = useState({
    name: '',
    name_si: '',
    short_description: '',
    description: '',
    description_si: '',
    category: 'Beaches',
    location: '',
    province: 'Southern Province',
    lat: 6.9271,
    lng: 79.8612,
    image_url: '',
    entry_fee: 'Free',
    entry_fee_usd: '',
    status: 'published' as 'published' | 'draft' | 'pending' | 'archived',
    featured: false,
    // Advanced options behind '+'
    best_time: 'November to April',
    opening_hours: 'Daily 06:00 - 18:00',
    duration: '2-3 hours',
    difficulty: 'Easy',
    tips: '',
    meta_title: '',
    meta_description: '',
  });

  const [imageList, setImageList] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (place) {
      setFormData({
        name: place.name || '',
        name_si: (place as unknown as { name_si?: string }).name_si || '',
        short_description: place.short_description || '',
        description: place.description || '',
        description_si: (place as unknown as { description_si?: string }).description_si || '',
        category: place.category || 'Beaches',
        location: place.location || '',
        province: place.province || 'Southern Province',
        lat: Number(place.lat) || 6.9271,
        lng: Number(place.lng) || 79.8612,
        image_url: place.image_url || '',
        entry_fee: place.entry_fee || 'Free',
        entry_fee_usd: (place as unknown as { entry_fee_usd?: string }).entry_fee_usd || '',
        status: (place.status as 'published' | 'draft' | 'pending' | 'archived') || 'published',
        featured: Boolean(place.featured),
        best_time: place.best_time || 'November to April',
        opening_hours: (place as unknown as { opening_hours?: string }).opening_hours || '',
        duration: (place as unknown as { duration?: string }).duration || '',
        difficulty: (place as unknown as { difficulty?: string }).difficulty || 'Easy',
        tips: place.tips || '',
        meta_title: (place as unknown as { meta_title?: string }).meta_title || '',
        meta_description: (place as unknown as { meta_description?: string }).meta_description || '',
      });

      try {
        const parsed = JSON.parse(place.gallery || '[]');
        setImageList(Array.isArray(parsed) ? parsed : []);
      } catch {
        setImageList([]);
      }
    } else {
      // Reset form for new place
      setFormData({
        name: '',
        name_si: '',
        short_description: '',
        description: '',
        description_si: '',
        category: 'Beaches',
        location: '',
        province: 'Southern Province',
        lat: 6.9271,
        lng: 79.8612,
        image_url: '',
        entry_fee: 'Free',
        entry_fee_usd: '',
        status: 'published',
        featured: false,
        best_time: 'November to April',
        opening_hours: 'Daily 06:00 - 18:00',
        duration: '2-3 hours',
        difficulty: 'Easy',
        tips: '',
        meta_title: '',
        meta_description: '',
      });
      setImageList([]);
      setShowAdvanced(false);
    }
  }, [place, isOpen]);

  if (!isOpen) return null;

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

      setFormData((prev) => ({ ...prev, image_url: resData.url }));
      if (!imageList.includes(resData.url)) {
        setImageList((prev) => [resData.url, ...prev]);
      }
      toast.success('Optimized photo uploaded successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newImageUrl.trim()) return;
    if (!imageList.includes(newImageUrl.trim())) {
      setImageList((prev) => [...prev, newImageUrl.trim()]);
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Destination Name and Location are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        gallery: JSON.stringify(imageList),
        featured: formData.featured ? 1 : 0,
        password: adminPassword,
      };

      const url = isEditMode ? `/api/places/${place?.id}` : '/api/places';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to save destination');

      toast.success(isEditMode ? 'Destination updated successfully!' : 'New destination created!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving destination');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#DCE8F2] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#DCE8F2] bg-[#F5FAFF]">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F2A3D]">
              {isEditMode ? `Edit: ${place?.name}` : 'Add New Destination'}
            </h2>
            <p className="text-xs text-[#5B7385] mt-0.5">
              Section 5 & R06: All essential fields on one screen; advanced options behind ＋.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#5B7385] hover:text-[#0F2A3D] hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* 1. Essential Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
                Destination Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mirissa Beach"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white text-xs font-medium text-[#0F2A3D] focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
                Destination Name (Sinhala)
              </label>
              <input
                type="text"
                value={formData.name_si}
                onChange={(e) => setFormData({ ...formData, name_si: e.target.value })}
                placeholder="උදා: මිරිස්ස වෙරළ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white text-xs font-medium text-[#0F2A3D] focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-bold text-[#0F2A3D] focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Province *</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-bold text-[#0F2A3D] focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Location & Interactive Map Pin */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
                  Location / Town / Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mirissa, Matara District"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'published' | 'draft' | 'pending' | 'archived',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-bold text-[#0F2A3D] focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Approval</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Interactive Map Picker */}
            <div>
              <label className="block text-xs font-bold text-[#5B7385] mb-1">
                Pin Location on Map ({formData.lat.toFixed(4)}, {formData.lng.toFixed(4)})
              </label>
              <div className="rounded-2xl overflow-hidden border border-[#DCE8F2]">
                <MapLocationPicker
                  lat={formData.lat}
                  lng={formData.lng}
                  onChange={(lat, lng) => setFormData((prev) => ({ ...prev, lat, lng }))}
                />
              </div>
            </div>
          </div>

          {/* 3. Cover Image & Gallery */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#0F2A3D]">Cover Image</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Enter image URL or upload directly..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />

              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#38A9F0] hover:bg-[#38A9F0]/90 transition-colors cursor-pointer">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploadingImage ? 'Optimizing...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>

            {/* Gallery Thumbnails */}
            {imageList.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {imageList.map((img, idx) => (
                  <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-[#DCE8F2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="Gallery item" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Entry Fee (LKR & USD) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Entry Fee (LKR)</label>
              <input
                type="text"
                value={formData.entry_fee}
                onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
                placeholder="e.g. Free or LKR 500"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Entry Fee (USD)</label>
              <input
                type="text"
                value={formData.entry_fee_usd}
                onChange={(e) => setFormData({ ...formData, entry_fee_usd: e.target.value })}
                placeholder="e.g. $10 or Free"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
            </div>
          </div>

          {/* 5. Descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
                Short Summary (English) *
              </label>
              <input
                type="text"
                required
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="One-line summary for cards and search results..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
                Full Description (English)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed traveler overview, highlights, historical context..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
              />
            </div>
          </div>

          {/* 6. ADVANCED OPTIONS BEHIND '+' BUTTON (R06) */}
          <div className="pt-2 border-t border-[#DCE8F2]">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#38A9F0] bg-[#F5FAFF] hover:bg-[#EAF4FD] border border-[#DCE8F2] transition-colors cursor-pointer"
            >
              {showAdvanced ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{showAdvanced ? 'Hide Additional Details' : '＋ Additional Details & SEO'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-4 p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Best Season</label>
                    <input
                      type="text"
                      value={formData.best_time}
                      onChange={(e) => setFormData({ ...formData, best_time: e.target.value })}
                      placeholder="e.g. Dec - Apr"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs text-[#0F2A3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={formData.opening_hours}
                      onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                      placeholder="e.g. 06:00 - 18:00"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs text-[#0F2A3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 2-3 hours"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs text-[#0F2A3D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs font-bold text-[#0F2A3D]"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 text-[#38A9F0] rounded"
                    />
                    <label htmlFor="featured" className="text-xs font-bold text-[#0F2A3D] cursor-pointer">
                      Spotlight on Homepage (Featured)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] mb-1">Insider Tips</label>
                  <textarea
                    rows={2}
                    value={formData.tips}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    placeholder="Practical advice: best time of day, clothing advice, parking notes..."
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs text-[#0F2A3D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">SEO Title</label>
                    <input
                      type="text"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Custom browser page title..."
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs text-[#0F2A3D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F2A3D] mb-1">SEO Description</label>
                    <input
                      type="text"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Custom meta description for Google search..."
                      className="w-full px-3 py-2 rounded-xl border border-[#DCE8F2] bg-white text-xs text-[#0F2A3D]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE8F2]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#DCE8F2] text-xs font-bold text-[#5B7385] hover:bg-[#F5FAFF] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#38A9F0] hover:bg-[#38A9F0]/90 shadow-md shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Destination' : 'Create Destination'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
