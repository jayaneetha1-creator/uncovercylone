'use client';

/**
 * src/app/admin/components/AdManagerTab.tsx
 * Admin interface for managing the 5 ad placements, Google AdSense, impression/click metrics,
 * and expiring ad notifications.
 */

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MousePointerClick,
  Calendar,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Check,
  X,
  Globe,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Ad } from '@/types';
import { AdSettings } from '@/lib/db/ads';

const PLACEMENTS = [
  { key: 'grid_card', label: '1. Sponsored Place Card (Grid)', icon: Globe },
  { key: 'home_banner', label: '2. Homepage Slim Banner', icon: Megaphone },
  { key: 'sidebar_partner', label: '3. Place Detail Sidebar Partner Card', icon: Sliders },
  { key: 'carousel_slot', label: '4. Carousel Sponsored Row (Nearby)', icon: RefreshCw },
  { key: 'footer_strip', label: '5. Footer Partner Strip', icon: Globe },
];

export default function AdManagerTab() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formPlacement, setFormPlacement] = useState<string>('grid_card');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleSi, setFormTitleSi] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDeviceTarget, setFormDeviceTarget] = useState<'all' | 'mobile' | 'desktop'>('all');
  const [formEnabled, setFormEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const fetchAdData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ads');
      if (!res.ok) throw new Error('Failed to load ads');
      const data = await res.json();
      setAds(data.ads || []);
      setSettings(data.settings || null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error fetching ad data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentTime(Date.now());
    fetchAdData();
  }, []);

  const handleToggleSetting = async (key: keyof AdSettings, value: boolean | string) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    try {
      const res = await fetch('/api/admin/ads/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      toast.success('Ad configuration saved');
    } catch {
      toast.error('Failed to update ad configuration');
      fetchAdData();
    }
  };

  const handleOpenAddModal = () => {
    setEditingAd(null);
    setFormPlacement('grid_card');
    setFormTitleEn('');
    setFormTitleSi('');
    setFormDescription('');
    setFormImageUrl('');
    setFormTargetUrl('');
    setFormStartDate('');
    setFormEndDate('');
    setFormDeviceTarget('all');
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setFormPlacement(ad.placement);
    setFormTitleEn(ad.title_en);
    setFormTitleSi(ad.title_si || '');
    setFormDescription(ad.description || '');
    setFormImageUrl(ad.image_url || '');
    setFormTargetUrl(ad.target_url);
    setFormStartDate(ad.start_date ? ad.start_date.substring(0, 10) : '');
    setFormEndDate(ad.end_date ? ad.end_date.substring(0, 10) : '');
    setFormDeviceTarget(ad.device_target);
    setFormEnabled(ad.enabled === 1);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFormImageUrl(data.url);
      toast.success('Image uploaded successfully');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleEn.trim() || !formTargetUrl.trim()) {
      toast.error('Please enter Title and Target Link');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        placement: formPlacement,
        title_en: formTitleEn,
        title_si: formTitleSi,
        description: formDescription,
        image_url: formImageUrl,
        target_url: formTargetUrl,
        start_date: formStartDate ? `${formStartDate} 00:00:00` : null,
        end_date: formEndDate ? `${formEndDate} 23:59:59` : null,
        device_target: formDeviceTarget,
        enabled: formEnabled ? 1 : 0,
      };

      if (editingAd) {
        const res = await fetch(`/api/admin/ads/${editingAd.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update ad');
        toast.success('Ad updated successfully');
      } else {
        const res = await fetch('/api/admin/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create ad');
        toast.success('New ad created');
      }

      setIsModalOpen(false);
      fetchAdData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save ad');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAd = async (adId: number) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;
    try {
      const res = await fetch(`/api/admin/ads/${adId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ad');
      toast.success('Ad deleted');
      fetchAdData();
    } catch {
      toast.error('Failed to delete ad');
    }
  };

  const handleToggleAdActive = async (ad: Ad) => {
    try {
      const newStatus = ad.enabled === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/ads/${ad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newStatus }),
      });
      if (!res.ok) throw new Error('Update failed');
      setAds((prev) => prev.map((a) => (a.id === ad.id ? { ...a, enabled: newStatus } : a)));
      toast.success(`Ad ${newStatus === 1 ? 'activated' : 'paused'}`);
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const isExpiringSoon = (endDateStr?: string | null) => {
    if (!endDateStr || !currentTime) return false;
    const end = new Date(endDateStr).getTime();
    const diffDays = (end - currentTime) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  };

  return (
    <div className="space-y-6">
      {/* ━━━ TOP HEADER & MASTER KILL SWITCH ━━━ */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#38A9F0]" />
            <h2 className="text-xl font-black text-[#0F2A3D]">Ad &amp; Sponsor Manager</h2>
          </div>
          <p className="text-xs text-[#5B7385] mt-1">
            Zero-gap non-disruptive ads, Google AdSense integration, impression tracking, and partner placements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Master Kill Switch */}
          <div className="flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-[#0F2A3D]">Master Ads Toggle:</span>
            <button
              onClick={() => handleToggleSetting('masterEnabled', !settings?.masterEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings?.masterEnabled ? 'bg-[#2FB67C]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings?.masterEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-extrabold ${
                settings?.masterEnabled ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {settings?.masterEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#38A9F0] hover:bg-[#2892d6] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#38A9F0]/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ad</span>
          </button>
        </div>
      </div>

      {/* ━━━ 5 PLACEMENTS & ADSENSE SWITCHES ━━━ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Placement 1 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F2A3D]">Sponsored Place Card</div>
            <div className="text-[11px] text-[#5B7385]">Placement: Places Grid</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.gridCardEnabled ?? true}
            onChange={(e) => handleToggleSetting('gridCardEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#38A9F0] cursor-pointer"
          />
        </div>

        {/* Placement 2 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F2A3D]">Homepage Slim Banner</div>
            <div className="text-[11px] text-[#5B7385]">Placement: Home Section Gap</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.homeBannerEnabled ?? true}
            onChange={(e) => handleToggleSetting('homeBannerEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#38A9F0] cursor-pointer"
          />
        </div>

        {/* Placement 3 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F2A3D]">Detail Sidebar Partner Card</div>
            <div className="text-[11px] text-[#5B7385]">Placement: Near Plan Visit Card</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.sidebarPartnerEnabled ?? true}
            onChange={(e) => handleToggleSetting('sidebarPartnerEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#38A9F0] cursor-pointer"
          />
        </div>

        {/* Placement 4 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F2A3D]">Carousel Sponsored Slot</div>
            <div className="text-[11px] text-[#5B7385]">Placement: Nearby Carousel (max 1)</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.carouselSlotEnabled ?? true}
            onChange={(e) => handleToggleSetting('carouselSlotEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#38A9F0] cursor-pointer"
          />
        </div>

        {/* Placement 5 */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F2A3D]">Footer Partner Strip</div>
            <div className="text-[11px] text-[#5B7385]">Placement: Bottom of Page</div>
          </div>
          <input
            type="checkbox"
            checked={settings?.footerStripEnabled ?? true}
            onChange={(e) => handleToggleSetting('footerStripEnabled', e.target.checked)}
            className="w-4 h-4 accent-[#38A9F0] cursor-pointer"
          />
        </div>

        {/* Google AdSense Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <span>Google AdSense</span>
              <span className="text-[10px] font-semibold bg-amber-200/80 px-1.5 py-0.2 rounded text-amber-800">
                public/ads.txt
              </span>
            </div>
            <div className="text-[11px] text-amber-700">
              {settings?.adsenseEnabled ? 'Active (Script Loaded)' : 'Disabled by Default'}
            </div>
          </div>
          <button
            onClick={() => handleToggleSetting('adsenseEnabled', !settings?.adsenseEnabled)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
              settings?.adsenseEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-700 border border-slate-300'
            }`}
          >
            {settings?.adsenseEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* ━━━ ADS INVENTORY TABLE ━━━ */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#0F2A3D]">Active Ad Inventory</h3>
            <span className="text-xs text-slate-400 font-semibold">({ads.length} total)</span>
          </div>

          <button
            onClick={fetchAdData}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#38A9F0]" />
            <span className="text-xs font-semibold">Loading advertisements...</span>
          </div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-600">No advertisements found</p>
            <p className="text-xs text-slate-400 mt-1">Create an ad to start showing partner placements.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[#5B7385] bg-slate-50/50">
                  <th className="py-3 px-4 font-semibold">Preview &amp; Title</th>
                  <th className="py-3 px-4 font-semibold">Placement</th>
                  <th className="py-3 px-4 font-semibold">Target / Link</th>
                  <th className="py-3 px-4 font-semibold text-center">Device</th>
                  <th className="py-3 px-4 font-semibold text-right">Views</th>
                  <th className="py-3 px-4 font-semibold text-right">Clicks</th>
                  <th className="py-3 px-4 font-semibold text-right">CTR</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ads.map((ad) => {
                  const expiring = isExpiringSoon(ad.end_date);
                  const ctr =
                    ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                      : '0.0';

                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/60 transition">
                      {/* Preview & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl relative overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/60">
                            {ad.image_url ? (
                              <Image
                                src={ad.image_url}
                                alt={ad.title_en}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Megaphone className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#0F2A3D] line-clamp-1">{ad.title_en}</div>
                            {ad.description && (
                              <div className="text-[11px] text-[#5B7385] line-clamp-1">
                                {ad.description}
                              </div>
                            )}
                            {expiring && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Expires soon</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Placement */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {ad.placement.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Target Link */}
                      <td className="py-3 px-4">
                        <a
                          href={ad.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#38A9F0] hover:underline flex items-center gap-1 font-medium max-w-[140px] truncate"
                        >
                          <span className="truncate">{ad.target_url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>

                      {/* Device */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-medium capitalize text-slate-600">
                          {ad.device_target}
                        </span>
                      </td>

                      {/* Impressions */}
                      <td className="py-3 px-4 text-right font-semibold text-[#0F2A3D]">
                        {ad.impressions.toLocaleString()}
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                        {ad.clicks.toLocaleString()}
                      </td>

                      {/* CTR */}
                      <td className="py-3 px-4 text-right font-bold text-[#38A9F0]">
                        {ctr}%
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAdActive(ad)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            ad.enabled === 1
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {ad.enabled === 1 ? 'Active' : 'Paused'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(ad)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#38A9F0] hover:bg-slate-100 transition"
                            title="Edit ad"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete ad"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ━━━ CREATE / EDIT AD MODAL ━━━ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-[#0F2A3D]">
                {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
              {/* Placement */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ad Placement *</label>
                <select
                  value={formPlacement}
                  onChange={(e) => setFormPlacement(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                >
                  {PLACEMENTS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title EN */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title (English) *</label>
                <input
                  type="text"
                  required
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="e.g. Scenic Ella Express Train Tickets"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                />
              </div>

              {/* Title SI */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title (Sinhala)</label>
                <input
                  type="text"
                  value={formTitleSi}
                  onChange={(e) => setFormTitleSi(e.target.value)}
                  placeholder="e.g. ඇල්ල දුම්රිය ආසන වෙන්කරවා ගැනීම"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Partner text or promotional summary"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                />
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner / Card Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... or upload image"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  />
                  <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer font-semibold text-slate-700 transition">
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Target Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Link (URL) *</label>
                <input
                  type="url"
                  required
                  value={formTargetUrl}
                  onChange={(e) => setFormTargetUrl(e.target.value)}
                  placeholder="https://example.com/partner-page"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                />
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Device Target & Active */}
              <div className="grid grid-cols-2 gap-3 items-center pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Device Targeting</label>
                  <select
                    value={formDeviceTarget}
                    onChange={(e) => setFormDeviceTarget(e.target.value as 'all' | 'mobile' | 'desktop')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  >
                    <option value="all">All Devices</option>
                    <option value="desktop">Desktop Only</option>
                    <option value="mobile">Mobile Only</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="adEnabledCheckbox"
                    checked={formEnabled}
                    onChange={(e) => setFormEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#38A9F0] cursor-pointer"
                  />
                  <label htmlFor="adEnabledCheckbox" className="font-bold text-slate-800 cursor-pointer">
                    Enable Ad immediately
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#38A9F0] hover:bg-[#2892d6] text-white rounded-xl font-bold shadow-md shadow-[#38A9F0]/25 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingAd ? 'Update Ad' : 'Publish Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
