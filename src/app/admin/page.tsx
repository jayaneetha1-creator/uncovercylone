'use client';

import { useState, useEffect, useMemo } from 'react';
import { Place, Review, ActivityLog } from '@/types';
import Link from 'next/link';
import {
  ShieldCheck, Plus, Trash2, Star, MapPin,
  Loader2, Lock, Eye, EyeOff, Save, X, CheckCircle2,
  Image as ImageIcon, Layers, Sliders, ExternalLink, RefreshCw, Upload,
  ArrowLeft, AlertCircle, Map, Search,
  Check, ArrowUpRight, ArrowUpDown, ChevronLeft, ChevronRight,
  Edit, AlertTriangle, CheckSquare, Square, MessageSquare,
  Database, History, Tag,
  FolderTree, Palette, FileCode2, Trash, ClipboardList,
  Sparkles, BarChart3, Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import DestinationEditorModal from '@/components/DestinationEditorModal';
import FolderManagerTab from './components/FolderManagerTab';
import ThemeControllerTab from './components/ThemeControllerTab';
import FileMapTab from './components/FileMapTab';
import TrashRequestsTab from './components/TrashRequestsTab';
import AuditLogTab from './components/AuditLogTab';
import ApprovalsTab from './components/ApprovalsTab';
import CustomerChatTab from './components/CustomerChatTab';
import MediaManagerTab from './components/MediaManagerTab';
import SlidesManagerTab from './components/SlidesManagerTab';
import AnalyticsTab from './components/AnalyticsTab';
import AdManagerTab from './components/AdManagerTab';

interface HeroSlide {
  id: number;
  image_url: string;
  location: string;
  province: string;
  sort_order: number;
}

interface RegionSlide {
  id: number;
  image_url: string;
  title: string;
  region: string;
  sort_order: number;
}

const CATEGORIES = [
  'Beaches', 'Waterfalls', 'Mountains', 'Ancient Sites',
  'Wildlife', 'Hidden Gems', 'Historical', 'Religious Places'
];

const PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province', 'Northern Province',
  'Eastern Province', 'North Western Province', 'North Central Province', 'Uva Province',
  'Sabaragamuwa Province'
];

const ADMIN_PASS_KEY = 'uc_admin_auth';

const emptySlideForm = {
  image_url: '',
  location: '',
  province: 'Central Province',
};

function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 5) return false;
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isWebpageUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.html') ||
    lower.includes('.htm') ||
    lower.includes('tripadvisor.com') ||
    lower.includes('share.google') ||
    lower.includes('google.com/maps')
  );
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active tab: 'places' | 'approvals' | 'chat' | 'slides' | 'media' | 'reviews' | 'folders' | 'theme' | 'filemap' | 'trash' | 'audit' | 'logs' | 'analytics' | 'ads'
  const [activeTab, setActiveTab] = useState<
    'places' | 'approvals' | 'chat' | 'slides' | 'media' | 'reviews' | 'folders' | 'theme' | 'filemap' | 'trash' | 'audit' | 'logs' | 'analytics' | 'ads'
  >('places');

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'places' | 'slides' | 'reviews' | 'database'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [isClearingLogs, setIsClearingLogs] = useState(false);

  // Backup State
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);

  // Bulk Category State
  const [bulkCategory, setBulkCategory] = useState<string>('Beaches');
  const [isApplyingBulkCategory, setIsApplyingBulkCategory] = useState(false);

  // Reviews Moderation State
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [updatingReviewId, setUpdatingReviewId] = useState<number | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  // Places state
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // Multi-Tab Add / Edit Destination Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  // Table Filters, Search, Sort & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedFeatured, setSelectedFeatured] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'category' | 'province' | 'rating' | 'featured' | 'id'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Confirmation Modals
  const [deleteModalPlace, setDeleteModalPlace] = useState<Place | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Slides state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [slideForm, setSlideForm] = useState(emptySlideForm);
  const [submittingSlide, setSubmittingSlide] = useState(false);
  const [deletingSlideId, setDeletingSlideId] = useState<number | null>(null);

  // File upload state for Hero Slides
  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);

  // Upload photo directly from PC (for Hero Slides)
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingSlideImage(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setSlideForm((prev) => ({ ...prev, image_url: data.url }));
      toast.success('Photo uploaded from PC! 📸');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingSlideImage(false);
    }
  };

  // ━━━ REGION BANNER & SLIDES STATE ━━━
  const [regionSlides, setRegionSlides] = useState<RegionSlide[]>([]);
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [regionSettings, setRegionSettings] = useState({
    region_tagline: 'Explore by region',
    region_title: 'Every corner of the island has a different story.',
    region_description: 'Choose a province, follow the map, and make your own route across Sri Lanka.',
    region_button_text: 'Open the map',
    region_button_link: '/map',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showRegionSlideForm, setShowRegionSlideForm] = useState(false);
  const [regionSlideForm, setRegionSlideForm] = useState({
    title: '',
    region: 'Southern Province',
    image_url: '',
  });
  const [submittingRegionSlide, setSubmittingRegionSlide] = useState(false);
  const [deletingRegionSlideId, setDeletingRegionSlideId] = useState<number | null>(null);
  const [uploadingRegionImage, setUploadingRegionImage] = useState(false);

  // Upload photo directly from PC (for Region Slides)
  const handleRegionFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploadingRegionImage(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setRegionSlideForm((prev) => ({ ...prev, image_url: data.url }));
      toast.success('Region photo uploaded from PC! 📸');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingRegionImage(false);
    }
  };

  // Check saved session and verify with backend
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_PASS_KEY);
    if (saved) {
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: saved }),
      })
        .then((res) => {
          if (res.ok) {
            setAdminPassword(saved);
            setIsAuth(true);
          } else {
            sessionStorage.removeItem(ADMIN_PASS_KEY);
            setIsAuth(false);
            setAuthError('Your saved admin session is invalid or server password changed. Please log in again.');
          }
        })
        .catch(() => {
          setAdminPassword(saved);
          setIsAuth(true);
        });
    }
  }, []);

  // Fetch data on auth
  useEffect(() => {
    if (isAuth) {
      fetchPlaces();
      fetchSlides();
      fetchRegionData();
      fetchReviews();
      fetchLogs();
    }
  }, [isAuth]);

  const fetchPlaces = async () => {
    setLoadingPlaces(true);
    try {
      const res = await fetch('/api/places');
      const data = await res.json();
      setPlaces(data.places || []);
    } catch {
      toast.error('Failed to load places');
    } finally {
      setLoadingPlaces(false);
    }
  };

  const fetchSlides = async () => {
    setLoadingSlides(true);
    try {
      const res = await fetch('/api/hero-slides');
      const data = await res.json();
      setSlides(data.slides || []);
    } catch {
      toast.error('Failed to load hero slides');
    } finally {
      setLoadingSlides(false);
    }
  };

  const fetchRegionData = async () => {
    setLoadingRegion(true);
    try {
      const [slidesRes, settingsRes] = await Promise.all([
        fetch('/api/region-slides'),
        fetch('/api/site-settings'),
      ]);
      const slidesData = await slidesRes.json();
      const settingsData = await settingsRes.json();
      if (slidesData.slides) setRegionSlides(slidesData.slides);
      if (settingsData.settings) {
        setRegionSettings((prev) => ({ ...prev, ...settingsData.settings }));
      }
    } catch {
      toast.error('Failed to load region banner data');
    } finally {
      setLoadingRegion(false);
    }
  };

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews?admin=true');
      const data = await res.json();
      setAdminReviews(data.reviews || []);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/logs?limit=100');
      const data = await res.json();
      setActivityLogs(data.logs || []);
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleUpdateReviewStatus = async (reviewId: number, newStatus: 'approved' | 'pending' | 'spam') => {
    setUpdatingReviewId(reviewId);
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review status');

      toast.success(
        newStatus === 'approved'
          ? 'Review approved and published!'
          : newStatus === 'spam'
          ? 'Review marked as spam'
          : 'Review moved to pending'
      );
      setAdminReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
      );
      fetchPlaces(); // Refresh places ratings & counts
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating review');
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setDeletingReviewId(reviewId);
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');

      toast.success('Review permanently deleted.');
      setAdminReviews((prev) => prev.filter((r) => r.id !== reviewId));
      fetchPlaces(); // Refresh places ratings & counts
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Please enter the admin password.');
      return;
    }

    setIsLoggingIn(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Incorrect admin password. Please try again.');
        toast.error('Incorrect admin password!');
        return;
      }

      setAdminPassword(passwordInput.trim());
      sessionStorage.setItem(ADMIN_PASS_KEY, passwordInput.trim());
      setIsAuth(true);
      toast.success('Admin authorized successfully!');
    } catch {
      setAuthError('Connection error while verifying password. Please check your network.');
      toast.error('Verification failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Toggle Featured Status directly from table
  const toggleFeaturedStatus = async (place: Place) => {
    const updatedFeatured = place.featured === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/places/${place.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...place,
          featured: updatedFeatured,
          password: adminPassword,
        }),
      });
      if (res.ok) {
        setPlaces((prev) =>
          prev.map((p) => (p.id === place.id ? { ...p, featured: updatedFeatured } : p))
        );
        toast.success(
          updatedFeatured === 1
            ? `⭐ ${place.name} set as Featured!`
            : `${place.name} set to Standard.`
        );
      }
    } catch {
      toast.error('Failed to toggle featured status');
    }
  };

  // Single Item Delete Confirmation
  const confirmSingleDelete = async () => {
    if (!deleteModalPlace) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/places/${deleteModalPlace.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete place');
      }

      toast.success(`${deleteModalPlace.name} deleted.`);
      setPlaces((prev) => prev.filter((p) => p.id !== deleteModalPlace.id));
      setSelectedIds((prev) => prev.filter((id) => id !== deleteModalPlace.id));
      setDeleteModalPlace(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting place');
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Delete Confirmation
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    setIsDeleting(true);
    try {
      const res = await fetch('/api/places/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          action: 'delete',
          ids: selectedIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      toast.success(`${data.count || selectedIds.length} destinations deleted successfully.`);
      setPlaces((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Some destinations could not be deleted.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk Category Change
  const handleBulkChangeCategory = async () => {
    if (selectedIds.length === 0) return;
    if (!bulkCategory) {
      toast.error('Please select a category first.');
      return;
    }

    setIsApplyingBulkCategory(true);
    try {
      const res = await fetch('/api/places/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          action: 'change_category',
          ids: selectedIds,
          category: bulkCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update category');

      toast.success(`Moved ${data.count || selectedIds.length} destinations to "${bulkCategory}" 🏷️`);
      setPlaces((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, category: bulkCategory } : p))
      );
      setSelectedIds([]);
      fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change category.';
      toast.error(msg);
    } finally {
      setIsApplyingBulkCategory(false);
    }
  };

  // One-click Database Backup & Download
  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const res = await fetch(`/api/admin/backup?password=${encodeURIComponent(adminPassword)}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Backup download failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `uncoverceylon-backup-${dateStr}.db`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Database backup downloaded successfully! 💾');
      fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Database backup failed.';
      toast.error(msg);
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  // Clear Activity Logs
  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all activity logs?')) return;
    setIsClearingLogs(true);
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (!res.ok) throw new Error('Failed to clear logs');
      toast.success('Activity logs cleared');
      fetchLogs();
    } catch {
      toast.error('Could not clear logs');
    } finally {
      setIsClearingLogs(false);
    }
  };

  // Submit new hero slide
  const handleSubmitSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.image_url || !slideForm.location) {
      toast.error('Image and location name are required.');
      return;
    }

    if (isWebpageUrl(slideForm.image_url)) {
      toast.error('That looks like a webpage URL! Right click the photo and choose "Copy Image Address", or upload from PC.');
      return;
    }

    setSubmittingSlide(true);
    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...slideForm,
          password: adminPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Invalid password. Please re-login.');
          sessionStorage.removeItem(ADMIN_PASS_KEY);
          setIsAuth(false);
        } else {
          throw new Error(data.error || 'Failed to add slide');
        }
        return;
      }

      toast.success('Slide added to Hero section! 🖼️');
      setSlideForm(emptySlideForm);
      setShowSlideForm(false);
      fetchSlides();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error adding slide');
    } finally {
      setSubmittingSlide(false);
    }
  };

  // Delete hero slide
  const handleDeleteSlide = async (id: number) => {
    if (!confirm('Are you sure you want to remove this slide?')) return;

    setDeletingSlideId(id);
    try {
      const res = await fetch('/api/hero-slides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete slide');
      }

      toast.success('Slide removed successfully.');
      setSlides((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting slide');
    } finally {
      setDeletingSlideId(null);
    }
  };

  // ━━━ REGION SECTION HANDLERS ━━━
  const handleSaveRegionSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: regionSettings,
          password: adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      toast.success('Region banner texts saved successfully! 🎉');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddRegionSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionSlideForm.title.trim()) {
      toast.error('Please enter a title for the region slide');
      return;
    }
    if (!regionSlideForm.image_url.trim()) {
      toast.error('Please provide an image URL or upload a photo');
      return;
    }

    if (isWebpageUrl(regionSlideForm.image_url)) {
      toast.error('That looks like a webpage URL! Right click the photo and choose "Copy Image Address", or upload from PC.');
      return;
    }

    setSubmittingRegionSlide(true);
    try {
      const res = await fetch('/api/region-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...regionSlideForm,
          password: adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add slide');

      toast.success('Region slide added! ✨');
      setRegionSlideForm({ title: '', region: 'Southern Province', image_url: '' });
      setShowRegionSlideForm(false);
      fetchRegionData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add slide');
    } finally {
      setSubmittingRegionSlide(false);
    }
  };

  const handleDeleteRegionSlide = async (id: number) => {
    if (!confirm('Are you sure you want to remove this region slide?')) return;

    setDeletingRegionSlideId(id);
    try {
      const res = await fetch('/api/region-slides', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      toast.success('Region slide deleted!');
      fetchRegionData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingRegionSlideId(null);
    }
  };

  // ━━━ FILTERING & SORTING DATA FOR TABLE ━━━
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (selectedProvince !== 'All' && p.province !== selectedProvince) return false;
      if (selectedFeatured === 'Featured' && p.featured !== 1) return false;
      if (selectedFeatured === 'Standard' && p.featured === 1) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchProv = p.province.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchProv) return false;
      }
      return true;
    });
  }, [places, searchQuery, selectedCategory, selectedProvince, selectedFeatured]);

  const sortedPlaces = useMemo(() => {
    return [...filteredPlaces].sort((a, b) => {
      let result = 0;
      if (sortField === 'name') result = a.name.localeCompare(b.name);
      else if (sortField === 'category') result = a.category.localeCompare(b.category);
      else if (sortField === 'province') result = a.province.localeCompare(b.province);
      else if (sortField === 'rating') result = a.rating - b.rating;
      else if (sortField === 'featured') result = (a.featured || 0) - (b.featured || 0);
      else if (sortField === 'id') result = a.id - b.id;

      return sortDirection === 'asc' ? result : -result;
    });
  }, [filteredPlaces, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedPlaces.length / pageSize) || 1;
  const paginatedPlaces = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPlaces.slice(start, start + pageSize);
  }, [sortedPlaces, currentPage, pageSize]);

  // Filtered reviews calculation
  const filteredReviews = useMemo(() => {
    return adminReviews.filter((r) => {
      if (reviewFilter === 'pending' && r.status !== 'pending') return false;
      if (reviewFilter === 'approved' && r.status !== 'approved' && r.status !== undefined && r.status !== null) return false;
      if (reviewFilter === 'spam' && r.status !== 'spam') return false;

      if (reviewSearchQuery.trim()) {
        const q = reviewSearchQuery.toLowerCase();
        const authorMatch = r.author?.toLowerCase().includes(q);
        const commentMatch = r.comment?.toLowerCase().includes(q);
        const placeMatch = r.place_name?.toLowerCase().includes(q);
        if (!authorMatch && !commentMatch && !placeMatch) return false;
      }

      return true;
    });
  }, [adminReviews, reviewFilter, reviewSearchQuery]);

  // Filtered activity logs calculation
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (logFilter !== 'all' && log.entity_type !== logFilter) {
        return false;
      }
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase();
        return (
          log.details.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activityLogs, logFilter, logSearchQuery]);

  // Adjust page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Bulk selection handlers
  const toggleSelectAll = () => {
    const pageIds = paginatedPlaces.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const totalDestinations = places.length;
    const totalCategories = new Set(places.map((p) => p.category)).size;
    const totalProvinces = new Set(places.map((p) => p.province)).size;
    const totalReviews = places.reduce((sum, p) => sum + (p.review_count || 0), 0);
    const totalFeatured = places.filter((p) => p.featured === 1).length;

    return {
      totalDestinations,
      totalCategories: Math.max(totalCategories, CATEGORIES.length),
      totalProvinces: Math.max(totalProvinces, 9),
      totalReviews,
      totalFeatured,
    };
  }, [places]);

  // Category badge styling map
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Beaches': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Waterfalls': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Mountains': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Ancient Sites': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Wildlife': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Historical': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Religious Places': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // ━━━ 1. LOGIN SCREEN ━━━
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-sky-950/10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-4 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-sky-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
                Admin Workspace
              </h1>
              <p className="text-slate-500 text-sm text-center">
                Enter your administrator credentials to manage UncoverCeylon
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3.5 text-slate-900 placeholder-slate-400 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all shadow-xs"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <p className="text-rose-600 text-xs flex items-center gap-1.5 font-semibold">
                  <X className="w-3.5 h-3.5" />
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-sky-600/25 active:scale-95 cursor-pointer"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                <span>{isLoggingIn ? 'Verifying Password...' : 'Authorize & Enter'}</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <Link href="/" className="text-sky-600 hover:underline flex items-center gap-1 font-semibold">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to live site
              </Link>
              <span className="text-[11px] font-medium text-slate-400">Serandib Co. Admin Portal</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ━━━ 2. MODERN DASHBOARD ━━━
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* ━━━ SAAS TOP HEADER ━━━ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Workspace Tag */}
          <div className="flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-1 group">
              <span className="text-slate-900 font-extrabold text-xl tracking-tight">
                Uncover<span className="text-sky-600">Ceylon</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded-full border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Admin Workspace
            </span>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Live Website</span>
            </Link>

            <button
              onClick={() => {
                fetchPlaces();
                fetchSlides();
                fetchRegionData();
                fetchReviews();
                fetchLogs();
                toast.success('Dashboard data synced!');
              }}
              title="Refresh Data"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            {/* Database One-Click Backup */}
            <button
              onClick={handleDownloadBackup}
              disabled={isDownloadingBackup}
              title="Download one-click full uncoverceylon.db backup file"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isDownloadingBackup ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Database className="w-4 h-4 text-emerald-600" />
              )}
              <span className="hidden sm:inline">{isDownloadingBackup ? 'Backing Up...' : 'Backup DB'}</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem(ADMIN_PASS_KEY);
                setIsAuth(false);
                setAdminPassword('');
                toast('Signed out from admin session');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs sm:text-sm font-bold transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ━━━ MAIN DASHBOARD CONTENT ━━━ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* ━━━ DASHBOARD STATISTICS (5 MODERN CARDS) ━━━ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-500/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Total Places
              </span>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {loadingPlaces ? <Loader2 className="w-6 h-6 animate-spin text-sky-600" /> : stats.totalDestinations}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Active destinations
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-500/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Categories
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalCategories}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Beaches, Peaks, Wildlife
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-cyan-500/40 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Provinces
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center">
                <Map className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalProvinces}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              All 9 provinces covered
            </span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Reviews
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalReviews.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Traveler ratings log
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-400/50 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                Featured
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalFeatured}
            </div>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Homepage spotlights
            </span>
          </div>
        </div>

        {/* ━━━ TAB SWITCHER & ACTION CONTROLS ━━━ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          
          <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full xl:w-auto gap-1">
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'places'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Destinations ({places.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'approvals'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Approvals</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('slides')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'slides'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Slides Manager</span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Media Optimizer</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Reviews</span>
              {adminReviews.filter((r) => r.status === 'pending').length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-xs">
                  {adminReviews.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('folders')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'folders'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Folders</span>
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('filemap')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'filemap'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileCode2 className="w-4 h-4" />
              <span>File Map</span>
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'trash'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Trash className="w-4 h-4" />
              <span>Trash & Requests</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'ads'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Ads &amp; Sponsors</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-white text-sky-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Activity</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'places' && (
              <button
                onClick={() => {
                  setEditingPlace(null);
                  setIsEditorOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-sky-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Destination</span>
              </button>
            )}
            {activeTab === 'reviews' && (
              <button
                onClick={fetchReviews}
                disabled={loadingReviews}
                className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-sky-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingReviews ? 'animate-spin' : ''}`} />
                <span>Refresh Reviews</span>
              </button>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 1: PROFESSIONAL DATA TABLE (DESTINATIONS)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'places' && (
          <div className="space-y-6">

            {/* ━━━ DATA TABLE TOOLBAR (SEARCH & FILTERS) ━━━ */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by destination name, location or province..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:bg-white outline-none shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-sky-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Province:</span>
                    <select
                      value={selectedProvince}
                      onChange={(e) => {
                        setSelectedProvince(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-sky-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Provinces</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Featured Filter */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedFeatured}
                      onChange={(e) => {
                        setSelectedFeatured(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-sky-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Featured">⭐ Featured Only</option>
                      <option value="Standard">Standard Only</option>
                    </select>
                  </div>

                  {/* Reset filters button */}
                  {(searchQuery || selectedCategory !== 'All' || selectedProvince !== 'All' || selectedFeatured !== 'All') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedProvince('All');
                        setSelectedFeatured('All');
                        setCurrentPage(1);
                      }}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-2 rounded-xl"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* ━━━ BULK ACTIONS FLOATING BAR (Appears when rows selected) ━━━ */}
              {selectedIds.length > 0 && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 sm:px-4 flex flex-wrap items-center justify-between gap-3 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                      {selectedIds.length}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {selectedIds.length === 1 ? 'destination selected' : 'destinations selected'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Bulk Change Category */}
                    <div className="flex items-center gap-1.5 bg-white border border-sky-200 rounded-xl px-2.5 py-1 shadow-xs">
                      <Tag className="w-3.5 h-3.5 text-sky-600" />
                      <select
                        value={bulkCategory}
                        onChange={(e) => setBulkCategory(e.target.value)}
                        className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-1"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleBulkChangeCategory}
                        disabled={isApplyingBulkCategory}
                        className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isApplyingBulkCategory ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Apply Category</span>
                      </button>
                    </div>

                    {/* Bulk Delete */}
                    <button
                      onClick={() => setIsBulkDeleteOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Bulk Delete ({selectedIds.length})</span>
                    </button>

                    {/* Clear selection */}
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ━━━ DATA TABLE ━━━ */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                      {/* Bulk Select Checkbox */}
                      <th className="py-4 px-4 w-12 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-slate-400 hover:text-sky-600"
                        >
                          {paginatedPlaces.length > 0 && paginatedPlaces.every((p) => selectedIds.includes(p.id)) ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      
                      {/* Column 1: Thumbnail */}
                      <th className="py-4 px-4 w-20">Thumbnail</th>

                      {/* Column 2: Name (Sortable) */}
                      <th
                        onClick={() => handleSort('name')}
                        className="py-4 px-4 cursor-pointer hover:text-sky-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Name & Location</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>

                      {/* Column 3: Category (Sortable) */}
                      <th
                        onClick={() => handleSort('category')}
                        className="py-4 px-4 cursor-pointer hover:text-sky-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Category</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>

                      {/* Column 4: Province (Sortable) */}
                      <th
                        onClick={() => handleSort('province')}
                        className="py-4 px-4 cursor-pointer hover:text-sky-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Province</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>

                      {/* Column 5: Rating (Sortable) */}
                      <th
                        onClick={() => handleSort('rating')}
                        className="py-4 px-4 cursor-pointer hover:text-sky-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Rating</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>

                      {/* Column 6: Featured (Sortable) */}
                      <th
                        onClick={() => handleSort('featured')}
                        className="py-4 px-4 cursor-pointer hover:text-sky-600 transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Featured</span>
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </th>

                      {/* Column 7: Status */}
                      <th className="py-4 px-4">Status</th>

                      {/* Column 8: Actions */}
                      <th className="py-4 px-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {loadingPlaces ? (
                      <tr>
                        <td colSpan={9} className="py-20 text-center text-slate-500">
                          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-2" />
                          <span className="font-bold text-slate-900">Loading destination records...</span>
                        </td>
                      </tr>
                    ) : paginatedPlaces.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center text-slate-500">
                          <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="font-bold text-slate-900">No destinations match your filters</p>
                          <p className="text-xs text-slate-500 mt-1">Try resetting the search or category filters.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedPlaces.map((place) => {
                        const isSelected = selectedIds.includes(place.id);
                        return (
                          <tr
                            key={place.id}
                            className={`transition-colors ${
                              isSelected
                                ? 'bg-sky-50/70'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => toggleSelectRow(place.id)}
                                className="text-slate-400 hover:text-sky-600"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-sky-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* 1. Thumbnail */}
                            <td className="py-3.5 px-4">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                                {isValidImageUrl(place.image_url) ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={place.image_url}
                                      alt={place.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                    <div style={{ display: 'none' }} className="w-full h-full items-center justify-center text-slate-400">
                                      <MapPin className="w-4 h-4" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* 2. Name & Location */}
                            <td className="py-3.5 px-4">
                              <Link
                                href={`/places/${place.id}`}
                                target="_blank"
                                className="font-bold text-slate-900 hover:text-sky-600 transition-colors block line-clamp-1"
                              >
                                {place.name}
                              </Link>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                <MapPin className="w-3 h-3 text-sky-600 flex-shrink-0" />
                                <span className="truncate">{place.location}</span>
                              </div>
                            </td>

                            {/* 3. Category */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(
                                  place.category
                                )}`}
                              >
                                {place.category}
                              </span>
                            </td>

                            {/* 4. Province */}
                            <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                              {place.province}
                            </td>

                            {/* 5. Rating & Reviews */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-1 bg-amber-50/70 text-slate-900 border border-amber-200/80 px-2 py-0.5 rounded-lg text-xs font-bold">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span>{place.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-[11px] text-slate-500">
                                  ({place.review_count})
                                </span>
                              </div>
                            </td>

                            {/* 6. Featured Toggle */}
                            <td className="py-3.5 px-4">
                              <button
                                onClick={() => toggleFeaturedStatus(place)}
                                title="Click to toggle featured spotlight"
                                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                  place.featured === 1
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                <Star
                                  className={`w-3 h-3 ${
                                    place.featured === 1 ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                                  }`}
                                />
                                <span>{place.featured === 1 ? 'Featured' : 'Standard'}</span>
                              </button>
                            </td>

                            {/* 7. Status */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Published
                              </span>
                            </td>

                            {/* 8. Actions (View, Edit, Delete) */}
                            <td className="py-3.5 px-4 text-right pr-6">
                              <div className="inline-flex items-center gap-1.5">
                                {/* View Live */}
                                <a
                                  href={`/places/${place.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-sky-600 transition-colors"
                                  title="View Live Page"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingPlace(place);
                                    setIsEditorOpen(true);
                                  }}
                                  className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 transition-colors"
                                  title="Edit Destination"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => setDeleteModalPlace(place)}
                                  className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                  title="Delete Destination"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ━━━ TABLE PAGINATION FOOTER ━━━ */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>
                    Showing <strong className="text-slate-900">{Math.min((currentPage - 1) * pageSize + 1, sortedPlaces.length)}</strong> to{' '}
                    <strong className="text-slate-900">{Math.min(currentPage * pageSize, sortedPlaces.length)}</strong> of{' '}
                    <strong className="text-slate-900">{sortedPlaces.length}</strong> destinations
                  </span>

                  <div className="flex items-center gap-1 pl-3 border-l border-slate-200">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-bold text-slate-900 px-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 4: REVIEWS MODERATION & ANTI-SPAM CONTROL
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* ━━━ REVIEWS STATS SUMMARY ━━━ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div
                onClick={() => setReviewFilter('all')}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                  reviewFilter === 'all'
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Total Reviews
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {adminReviews.length}
                </div>
              </div>

              <div
                onClick={() => setReviewFilter('pending')}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                  reviewFilter === 'pending'
                    ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Pending Moderation</span>
                  {adminReviews.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  )}
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {adminReviews.filter((r) => r.status === 'pending').length}
                </div>
              </div>

              <div
                onClick={() => setReviewFilter('approved')}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                  reviewFilter === 'approved'
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Approved & Active
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {adminReviews.filter((r) => r.status === 'approved' || !r.status).length}
                </div>
              </div>

              <div
                onClick={() => setReviewFilter('spam')}
                className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
                  reviewFilter === 'spam'
                    ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                  Flagged as Spam
                </div>
                <div className="text-2xl font-black text-rose-600">
                  {adminReviews.filter((r) => r.status === 'spam').length}
                </div>
              </div>
            </div>

            {/* ━━━ REVIEWS FILTER & SEARCH TOOLBAR ━━━ */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'pending', 'approved', 'spam'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setReviewFilter(filterKey)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      reviewFilter === filterKey
                        ? filterKey === 'pending'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : filterKey === 'approved'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : filterKey === 'spam'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filterKey === 'all'
                      ? `All (${adminReviews.length})`
                      : filterKey === 'pending'
                      ? `Pending (${adminReviews.filter((r) => r.status === 'pending').length})`
                      : filterKey === 'approved'
                      ? `Approved (${adminReviews.filter((r) => r.status === 'approved' || !r.status).length})`
                      : `Spam (${adminReviews.filter((r) => r.status === 'spam').length})`}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  placeholder="Search reviews, authors, places..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* ━━━ REVIEWS LIST ━━━ */}
            {loadingReviews ? (
              <div className="py-20 flex justify-center bg-white rounded-3xl border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Reviews Found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {reviewFilter === 'pending'
                    ? 'No reviews are currently pending approval. All caught up!'
                    : 'There are no reviews matching your current filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev) => {
                  const isPending = rev.status === 'pending';
                  const isSpam = rev.status === 'spam';
                  const isApproved = rev.status === 'approved' || !rev.status;

                  return (
                    <div
                      key={rev.id}
                      className={`bg-white rounded-2xl p-5 sm:p-6 border shadow-xs transition-all ${
                        isPending
                          ? 'border-amber-300 bg-amber-50/20'
                          : isSpam
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm border ${
                              isPending
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : isSpam
                                ? 'bg-rose-100 text-rose-700 border-rose-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}
                          >
                            {rev.author?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900">{rev.author}</span>
                              {rev.place_name && (
                                <Link
                                  href={`/places/${rev.place_id}`}
                                  target="_blank"
                                  className="text-xs font-semibold text-sky-600 hover:underline flex items-center gap-0.5"
                                >
                                  <span>@{rev.place_name}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                            <span className="text-xs text-slate-400">
                              {(() => {
                                try {
                                  return new Date(rev.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  });
                                } catch {
                                  return rev.created_at;
                                }
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>

                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              isPending
                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                : isSpam
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            }`}
                          >
                            {isPending
                              ? 'Pending Moderation'
                              : isSpam
                              ? 'Spam'
                              : 'Approved'}
                          </span>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 sm:ml-13 mb-4">
                        {rev.comment}
                      </p>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        {!isApproved && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, 'approved')}
                            disabled={updatingReviewId === rev.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            {updatingReviewId === rev.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve Review</span>
                          </button>
                        )}

                        {!isPending && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, 'pending')}
                            disabled={updatingReviewId === rev.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            <span>Move to Pending</span>
                          </button>
                        )}

                        {!isSpam && (
                          <button
                            onClick={() => handleUpdateReviewStatus(rev.id, 'spam')}
                            disabled={updatingReviewId === rev.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Mark as Spam</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          disabled={deletingReviewId === rev.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {deletingReviewId === rev.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            TAB 5: ADMIN ACTIVITY LOGS (AUDIT TRAIL)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Stats & Actions */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Admin Activity Logs & Audit Trail
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Track who modified destinations, hero slides, reviews, or downloaded database backups.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchLogs}
                  disabled={loadingLogs}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh Logs</span>
                </button>

                <button
                  onClick={handleClearLogs}
                  disabled={isClearingLogs || activityLogs.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Search logs by action, destination, or details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white transition-all outline-none"
                />
              </div>

              {/* Entity Type Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                {(['all', 'places', 'slides', 'reviews', 'database'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setLogFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      logFilter === cat
                        ? 'bg-white text-sky-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Logs List / Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {loadingLogs ? (
                <div className="p-12 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-sky-600" />
                  <span className="text-xs font-semibold">Loading activity logs...</span>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <History className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-sm font-bold text-slate-600">No activity logs recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Actions performed by admins will automatically appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                          log.action.includes('DELETE')
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : log.action.includes('CREATE')
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : log.action.includes('BULK')
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : log.action.includes('BACKUP')
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-sky-50 text-sky-600 border-sky-200'
                        }`}>
                          {log.action.includes('DELETE') ? (
                            <Trash2 className="w-4 h-4" />
                          ) : log.action.includes('CREATE') ? (
                            <Plus className="w-4 h-4" />
                          ) : log.action.includes('BACKUP') ? (
                            <Database className="w-4 h-4" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                              {log.details}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              log.action.includes('DELETE')
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : log.action.includes('CREATE')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : log.action.includes('BULK')
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : log.action.includes('BACKUP')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-600">Actor: {log.actor}</span>
                            <span>•</span>
                            <span className="capitalize">Target: {log.entity_type}</span>
                            {log.entity_id && (
                              <>
                                <span>•</span>
                                <span>ID: {log.entity_id}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[11px] font-mono font-medium text-slate-400 block">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ━━━ TAB: APPROVALS QUEUE (R30, T5.4) ━━━ */}
        {activeTab === 'approvals' && <ApprovalsTab />}

        {/* ━━━ TAB: CUSTOMER CHAT & SUPPORT (R03, T5.7) ━━━ */}
        {activeTab === 'chat' && <CustomerChatTab />}

        {/* ━━━ TAB: SLIDES MANAGER (T5.2) ━━━ */}
        {activeTab === 'slides' && <SlidesManagerTab />}

        {/* ━━━ TAB: MEDIA OPTIMIZER (R17, T5.3) ━━━ */}
        {activeTab === 'media' && <MediaManagerTab />}

        {/* ━━━ TAB 6: FOLDER MANAGER (SITE NODES HIERARCHY) ━━━ */}
        {activeTab === 'folders' && <FolderManagerTab />}

        {/* ━━━ TAB 7: THEME & STYLES CONTROLLER ━━━ */}
        {activeTab === 'theme' && <ThemeControllerTab />}

        {/* ━━━ TAB 8: LIVE REPOSITORY FILE MAP ━━━ */}
        {activeTab === 'filemap' && <FileMapTab />}

        {/* ━━━ TAB 9: TRASH & CHANGE REQUESTS (30-DAY GOVERNANCE) ━━━ */}
        {activeTab === 'trash' && <TrashRequestsTab />}

        {/* ━━━ TAB 10: GOVERNANCE AUDIT TRAIL ━━━ */}
        {activeTab === 'audit' && <AuditLogTab />}

        {/* ━━━ TAB 11: ANALYTICS & RECOMMENDATION METRICS (PHASE 7, T7.3) ━━━ */}
        {activeTab === 'analytics' && <AnalyticsTab />}

        {/* ━━━ TAB 12: AD & SPONSOR MANAGEMENT (PHASE 8, T8.1, T8.2) ━━━ */}
        {activeTab === 'ads' && <AdManagerTab />}
      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 1: SINGLE ITEM DELETE CONFIRMATION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {deleteModalPlace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Delete Destination?
              </h3>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-900">&quot;{deleteModalPlace.name}&quot;</strong>?
                This action will remove all reviews and coordinates from the platform and cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={confirmSingleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95 text-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Destination'}</span>
              </button>

              <button
                onClick={() => setDeleteModalPlace(null)}
                disabled={isDeleting}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 2: BULK DELETE CONFIRMATION
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-5 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Bulk Delete Destinations?
              </h3>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                You are about to permanently delete{' '}
                <strong className="text-rose-600 font-bold">{selectedIds.length}</strong> selected destinations.
                Their photos, reviews, and map markers will be permanently removed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={confirmBulkDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95 text-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? 'Deleting...' : `Delete All ${selectedIds.length} Destinations`}</span>
              </button>

              <button
                onClick={() => setIsBulkDeleteOpen(false)}
                disabled={isDeleting}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL 3: SAAS MULTI-TAB ADD / EDIT DESTINATION MODAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <DestinationEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPlace(null);
        }}
        place={editingPlace}
        adminPassword={adminPassword}
        onSuccess={() => {
          fetchPlaces();
        }}
      />

    </div>
  );
}
