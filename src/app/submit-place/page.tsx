'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import {
  MapPin, Plus, Upload, Loader2, CheckCircle2,
  AlertCircle, ArrowLeft, Image as ImageIcon, Sparkles, ShieldAlert
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

export default function SubmitPlacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    name_si: '',
    category: 'Hidden Gems',
    province: 'Central Province',
    location: '',
    lat: 7.2906,
    lng: 80.6337,
    image_url: '',
    short_description: '',
    description: '',
    entry_fee: 'Free',
  });

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
      toast.success('Optimized photo uploaded!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      toast.error('Destination Name and Location are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/places/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to submit destination');

      setSubmitted(true);
      toast.success('Submission received! In review by our team.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error submitting destination');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#38A9F0]" />
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-[#DCE8F2] shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0F2A3D]">Submit a Destination</h1>
          <p className="text-xs text-[#5B7385] leading-relaxed">
            Help fellow travelers discover hidden wonders across Sri Lanka. Sign in with your verified account to add a destination.
          </p>
          <div className="pt-2">
            <Link
              href="/login?redirect=/submit-place"
              className="inline-block w-full py-3 rounded-xl bg-[#38A9F0] hover:bg-[#38A9F0]/90 text-white font-bold text-xs shadow-md shadow-[#38A9F0]/25 transition-all"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Unverified email
  if (user.status === 'unverified') {
    return (
      <div className="min-h-screen bg-[#F5FAFF] py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0F2A3D]">Email Verification Required</h1>
          <p className="text-xs text-[#5B7385] leading-relaxed">
            To prevent spam and keep the UncoverCeylon directory trusted, please verify your email (<strong>{user.email}</strong>) before submitting new places.
          </p>
          <div className="pt-2">
            <Link
              href="/profile"
              className="inline-block px-5 py-2.5 rounded-xl border border-[#DCE8F2] text-[#0F2A3D] font-bold text-xs hover:bg-[#F5FAFF] transition-colors"
            >
              Go to Profile & Resend Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Submission Confirmed State
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-emerald-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-[#0F2A3D]">Thank You for Submitting!</h1>
          <p className="text-xs text-[#5B7385] leading-relaxed">
            Your place <strong>&quot;{formData.name}&quot;</strong> has been submitted to the UncoverCeylon community approvals queue. Once verified by our local team, it will appear in the public directory.
          </p>
          <div className="flex items-center justify-center gap-3 pt-3">
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl bg-[#38A9F0] text-white font-bold text-xs shadow-sm hover:bg-[#38A9F0]/90 transition-all"
            >
              View My Submissions
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  name_si: '',
                  category: 'Hidden Gems',
                  province: 'Central Province',
                  location: '',
                  lat: 7.2906,
                  lng: 80.6337,
                  image_url: '',
                  short_description: '',
                  description: '',
                  entry_fee: 'Free',
                });
              }}
              className="px-5 py-2.5 rounded-xl border border-[#DCE8F2] text-[#0F2A3D] font-bold text-xs hover:bg-[#F5FAFF] transition-colors cursor-pointer"
            >
              Add Another Place
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B7385] hover:text-[#0F2A3D] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Title Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#38A9F0]/10 text-[#38A9F0] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F2A3D]">Submit a Destination</h1>
          </div>
          <p className="text-xs text-[#5B7385] mt-1.5 leading-relaxed">
            Share an unmissable location, hidden beach, or mountain peak in Sri Lanka. Submissions are reviewed by our team and published to the live directory.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DCE8F2] shadow-sm space-y-6">
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
                placeholder="e.g. Diyaluma Falls"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
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
                placeholder="උදා: දියලුම ඇල්ල"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
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

          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
              Town / Nearest Landmark *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Koslanda, Badulla District"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
            />
          </div>

          {/* Map Location Picker */}
          <div>
            <label className="block text-xs font-bold text-[#5B7385] mb-1.5">
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

          {/* Photo */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#0F2A3D]">Cover Photo</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="Paste photo URL or upload directly..."
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
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
              Short Description *
            </label>
            <input
              type="text"
              required
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="A brief summary of what makes this place special..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
              Full Travel Guide / Tips
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="How to get there, best viewpoints, seasonal highlights, entry tips..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
            />
          </div>

          {/* Entry Fee */}
          <div>
            <label className="block text-xs font-bold text-[#0F2A3D] mb-1">
              Entry Fee (or &quot;Free&quot;)
            </label>
            <input
              type="text"
              value={formData.entry_fee}
              onChange={(e) => setFormData({ ...formData, entry_fee: e.target.value })}
              placeholder="e.g. Free or LKR 250"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] text-xs font-medium text-[#0F2A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0]"
            />
          </div>

          <div className="pt-4 border-t border-[#DCE8F2] flex items-center justify-between">
            <span className="text-[11px] text-[#5B7385]">
              Logged in as <strong>{user.name}</strong> ({user.email})
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#38A9F0] hover:bg-[#38A9F0]/90 shadow-md shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
