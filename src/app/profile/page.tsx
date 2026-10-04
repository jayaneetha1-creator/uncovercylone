'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Mail,
  Globe,
  Lock,
  Heart,
  Compass,
  Star,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useTrips } from '@/context/TripContext';
import { Place, Review } from '@/types';

type ProfileTab = 'settings' | 'saved' | 'trips' | 'reviews' | 'submissions';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, refreshUser, logout } = useAuth();
  const { savedIds, toggleWishlist } = useWishlist();
  const { trips, setActiveTripId } = useTrips();

  const [activeTab, setActiveTab] = useState<ProfileTab>('settings');

  // Saved places state
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Profile edit state
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [avatar, setAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // User reviews state
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Load saved places details from API
  useEffect(() => {
    if (savedIds.length > 0) {
      setLoadingSaved(true);
      fetch('/api/places')
        .then((res) => (res.ok ? res.json() : { places: [] }))
        .then((data) => {
          const all: Place[] = data.places || [];
          setSavedPlaces(all.filter((p: Place) => savedIds.includes(p.id)));
        })
        .catch(() => setSavedPlaces([]))
        .finally(() => setLoadingSaved(false));
    } else {
      setSavedPlaces([]);
    }
  }, [savedIds]);

  // Sync user data to form
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCountry(user.country || 'Sri Lanka');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  // Redirect to login if unauthenticated once loading completes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Fetch reviews when tab is activated
  useEffect(() => {
    if (activeTab === 'reviews' && user?.name) {
      setLoadingReviews(true);
      fetch(`/api/reviews?author=${encodeURIComponent(user.name)}`)
        .then((res) => (res.ok ? res.json() : { reviews: [] }))
        .then((data) => setUserReviews(data.reviews || []))
        .catch(() => setUserReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [activeTab, user?.name]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country, avatar }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      await refreshUser();
      setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: unknown) {
      setProfileMsg({
        text: err instanceof Error ? err.message : 'Error updating profile',
        type: 'error',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordMsg({
        text: err instanceof Error ? err.message : 'Error changing password',
        type: 'error',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5FAFF] pt-24 pb-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#38A9F0]/20 border-t-[#38A9F0] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#5B7385]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#F5FAFF] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ━━━ HEADER PROFILE CARD ━━━ */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-[0_4px_24px_rgba(15,42,61,0.04)] mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#38A9F0]/30 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#38A9F0] to-[#1E93DC] text-white flex items-center justify-center text-3xl font-extrabold shadow-sm">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                {user.email_verified_at && (
                  <div
                    className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full border-2 border-white shadow-xs"
                    title="Verified Account"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#0F2A3D]">{user.name}</h1>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] border border-[#DCE8F2]">
                    {user.role}
                  </span>
                  {user.email_verified_at ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Email Unverified
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#5B7385] mt-1 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#5B7385]" />
                  <span>{user.email}</span>
                  <span className="text-[#DCE8F2]">•</span>
                  <Globe className="w-3.5 h-3.5 text-[#5B7385]" />
                  <span>{user.country || 'Sri Lanka'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {['owner', 'developer', 'uploader'].includes(user.role) && (
                <Link
                  href="/admin"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF4FD] hover:bg-[#DCE8F2] text-[#0F2A3D] text-xs font-bold transition-colors border border-[#DCE8F2]"
                >
                  <span>Admin Panel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={logout}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* ━━━ TAB NAVIGATION ━━━ */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 border-t border-[#DCE8F2]/70 pt-6">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#38A9F0] text-white shadow-xs'
                  : 'bg-[#F5FAFF] text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD]'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-[#38A9F0] text-white shadow-xs'
                  : 'bg-[#F5FAFF] text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD]'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Saved Places ({savedIds.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'trips'
                  ? 'bg-[#38A9F0] text-white shadow-xs'
                  : 'bg-[#F5FAFF] text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>My Trips</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-[#38A9F0] text-white shadow-xs'
                  : 'bg-[#F5FAFF] text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD]'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>My Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-[#38A9F0] text-white shadow-xs'
                  : 'bg-[#F5FAFF] text-[#5B7385] hover:text-[#0F2A3D] hover:bg-[#EAF4FD]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>My Submissions</span>
            </button>
          </div>
        </div>

        {/* ━━━ TAB CONTENT ━━━ */}

        {/* 1. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* General Info Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-sm">
              <h2 className="text-lg font-bold text-[#0F2A3D] mb-1">Personal Information</h2>
              <p className="text-xs text-[#5B7385] mb-6">Update your display name, country, and avatar.</p>

              {profileMsg && (
                <div
                  className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                    profileMsg.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {profileMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-sm text-[#0F2A3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF]/60 text-sm text-[#5B7385] cursor-not-allowed"
                  />
                  <span className="block text-[11px] text-[#5B7385] mt-1">
                    Email cannot be changed directly for security reasons.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Sri Lanka"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-sm text-[#0F2A3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-sm text-[#0F2A3D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full py-3 px-4 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-sm">
              <h2 className="text-lg font-bold text-[#0F2A3D] mb-1">Security & Password</h2>
              <p className="text-xs text-[#5B7385] mb-6">Choose a strong, unique password.</p>

              {passwordMsg && (
                <div
                  className={`mb-6 p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                    passwordMsg.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-sm text-[#0F2A3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-sm text-[#0F2A3D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F2A3D] uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-4 py-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#38A9F0] text-sm text-[#0F2A3D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-3 px-4 bg-[#0F2A3D] hover:bg-[#1A3F5B] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {changingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 2. SAVED PLACES TAB */}
        {activeTab === 'saved' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F2A3D]">Saved Destinations</h2>
                <p className="text-xs text-[#5B7385]">Places you bookmarked for your Sri Lanka journey</p>
              </div>
              <Link
                href="/#explore"
                className="text-xs font-bold text-[#38A9F0] hover:underline flex items-center gap-1"
              >
                <span>Browse More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {savedPlaces.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#DCE8F2] rounded-2xl">
                <Heart className="w-12 h-12 text-[#DCE8F2] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0F2A3D] mb-1">No saved places yet</h3>
                <p className="text-xs text-[#5B7385] max-w-sm mx-auto mb-4">
                  Tap the heart icon on any destination card to bookmark it for later.
                </p>
                <Link
                  href="/#explore"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Explore Destinations
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedPlaces.map((place: Place) => (
                  <div
                    key={place.id}
                    className="group bg-[#F5FAFF] rounded-2xl overflow-hidden border border-[#DCE8F2] transition-all hover:shadow-md flex flex-col"
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      <img
                        src={place.image_url}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={() => toggleWishlist(place.id, place.name)}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-white shadow-xs transition-colors cursor-pointer"
                        title="Remove from saved"
                      >
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5B7385] mb-1">
                          <MapPin className="w-3 h-3 text-[#38A9F0]" />
                          <span>{place.province} Province</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#0F2A3D] line-clamp-1">{place.name}</h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#DCE8F2]/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                          ★ {place.rating}
                        </span>
                        <Link
                          href={`/places/${place.id}`}
                          className="text-xs font-bold text-[#38A9F0] hover:underline flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. MY TRIPS TAB */}
        {activeTab === 'trips' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F2A3D]">My Trips & Itineraries</h2>
                <p className="text-xs text-[#5B7385]">Custom multi-day journeys and route maps</p>
              </div>
              <Link
                href="/trips"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Open Trip Planner</span>
              </Link>
            </div>

            {trips.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#DCE8F2] rounded-2xl">
                <Calendar className="w-12 h-12 text-[#DCE8F2] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0F2A3D] mb-1">No trips planned yet</h3>
                <p className="text-xs text-[#5B7385] max-w-sm mx-auto mb-4">
                  Create custom day-by-day itineraries, track visited places, and view connected route maps with travel estimates.
                </p>
                <Link
                  href="/trips"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Create Your First Trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {trips.map((trip) => {
                  const stopCount = trip.items?.length || trip.item_count || 0;
                  const visitedCount = trip.visited_count || (trip.items || []).filter((i) => i.is_visited).length;
                  const percent = stopCount > 0 ? Math.round((visitedCount / stopCount) * 100) : 0;

                  return (
                    <div
                      key={trip.id}
                      className="bg-[#F5FAFF] rounded-2xl p-5 border border-[#DCE8F2] hover:border-[#38A9F0]/60 transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-[#DCEFFD] text-[#0284C7] text-[10px] font-bold uppercase tracking-wider">
                            {stopCount} {stopCount === 1 ? 'Stop' : 'Stops'}
                          </span>
                          {trip.is_ai_planned && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                              AI
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm sm:text-base text-[#0F2A3D] mb-1">
                          {trip.title}
                        </h4>

                        {trip.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                            {trip.description}
                          </p>
                        )}

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Progress</span>
                            <span className="font-bold text-[#0284C7]">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0284C7] rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#DCE8F2]/60 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {visitedCount} of {stopCount} visited
                        </span>
                        <Link
                          href="/trips"
                          onClick={() => setActiveTripId(trip.id)}
                          className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. MY REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F2A3D]">My Reviews</h2>
                <p className="text-xs text-[#5B7385]">Ratings and feedback you provided on visited locations</p>
              </div>
            </div>

            {loadingReviews ? (
              <div className="py-12 text-center text-xs text-[#5B7385]">Loading reviews...</div>
            ) : userReviews.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[#DCE8F2] rounded-2xl">
                <Star className="w-12 h-12 text-[#DCE8F2] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[#0F2A3D] mb-1">No reviews yet</h3>
                <p className="text-xs text-[#5B7385] max-w-sm mx-auto mb-4">
                  Visit any destination page and share your travel experience with fellow explorers.
                </p>
                <Link
                  href="/#explore"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Write Your First Review
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#0F2A3D]">
                        {rev.place_name || `Destination #${rev.place_id}`}
                      </h4>
                      <span className="text-xs font-bold text-amber-500">
                        {'★'.repeat(rev.rating)}
                        {'☆'.repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5B7385] leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-[#DCE8F2]/60 text-[11px] text-[#5B7385]">
                      <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                      <Link
                        href={`/places/${rev.place_id}`}
                        className="text-[#38A9F0] font-semibold hover:underline"
                      >
                        View Destination
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. MY SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DCE8F2] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#0F2A3D]">My Submitted Places</h2>
                <p className="text-xs text-[#5B7385]">Destinations you submitted for review by the community team</p>
              </div>
            </div>

            <div className="text-center py-12 border-2 border-dashed border-[#DCE8F2] rounded-2xl">
              <PlusCircle className="w-12 h-12 text-[#DCE8F2] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#0F2A3D] mb-1">Public Submission Engine (Phase 5)</h3>
              <p className="text-xs text-[#5B7385] max-w-sm mx-auto mb-4">
                Verified travelers will be able to propose unlisted hidden gems with GPS coordinates and photos.
              </p>
              <Link
                href="/#explore"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Browse Verified Places
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
