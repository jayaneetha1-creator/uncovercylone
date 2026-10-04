'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import RatingOverview from '@/components/RatingOverview';
import ReviewCard, { ExtendedReview } from '@/components/ReviewCard';
import {
  Star, MessageSquarePlus, Upload, X, Loader2,
  CheckCircle2, Filter, ArrowUpDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

interface ReviewSectionProps {
  placeId: number;
  placeName: string;
  initialReviews: Review[];
  rating: number;
  reviewCount: number;
}

export default function ReviewSection({
  placeId,
  placeName,
  initialReviews,
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ExtendedReview[]>(initialReviews as ExtendedReview[]);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [ratingScore, setRatingScore] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [subRatings, setSubRatings] = useState({
    clean: 5,
    crowd: 4,
    value: 5,
    accessibility: 4,
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [page, setPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed per review');
      return;
    }

    setUploadingPhoto(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setPhotos((prev) => [...prev, data.url]);
        } else {
          toast.error(data.error || 'Photo upload failed');
        }
      } catch {
        toast.error('Network error during photo upload');
      }
    }
    setUploadingPhoto(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          author: authorName.trim() || user?.name || 'Ceylon Traveler',
          rating: ratingScore,
          comment: commentText.trim(),
          photos,
          ratings: subRatings,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Your review has been submitted!');
        setShowModal(false);
        setCommentText('');
        setPhotos([]);
        // Re-fetch reviews or append
        const newReview: ExtendedReview = {
          id: data.id || Date.now(),
          place_id: placeId,
          author: authorName.trim() || user?.name || 'Ceylon Traveler',
          rating: ratingScore,
          comment: commentText.trim(),
          photos,
          created_at: new Date().toISOString(),
          status: 'approved',
        };
        setReviews((prev) => [newReview, ...prev]);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch {
      toast.error('Network error while submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter & sort reviews
  const displayedReviews = [...reviews]
    .filter((r) => (filterRating > 0 ? Math.round(r.rating) === filterRating : true))
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const totalPages = Math.max(1, Math.ceil(displayedReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = displayedReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  return (
    <div id="reviews" className="space-y-8">
      
      {/* ━━━ RATING OVERVIEW BLOCK ━━━ */}
      <RatingOverview
        rating={rating}
        reviewCount={reviewCount || reviews.length}
      />

      {/* ━━━ REVIEWS ACTION & FILTER BAR ━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE8F2]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5B7385]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#DCE8F2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F2A3D] focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5B7385]">Filter:</span>
            <select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-[#DCE8F2] rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F2A3D] focus:outline-none"
            >
              <option value={0}>All Stars</option>
              <option value={5}>5 Stars only</option>
              <option value={4}>4 Stars only</option>
              <option value={3}>3 Stars only</option>
            </select>
          </div>
        </div>

        {/* Write a Review Button */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* ━━━ REVIEWS LIST ━━━ */}
      {paginatedReviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#DCE8F2] p-10 text-center space-y-2">
          <p className="text-sm font-bold text-[#0F2A3D]">
            No reviews matching this filter.
          </p>
          <p className="text-xs text-[#5B7385]">
            Be the first traveler to share your authentic tips for {placeName}!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedReviews.map((rev) => (
            <ReviewCard key={rev.id} review={rev} />
          ))}
        </div>
      )}

      {/* ━━━ NUMBERED PAGINATION ━━━ */}
      {totalPages > 1 && (
        <div className="pt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl border border-[#DCE8F2] bg-white text-xs font-bold disabled:opacity-40"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                page === p
                  ? 'bg-[#38A9F0] text-white'
                  : 'bg-white border border-[#DCE8F2] text-[#0F2A3D]'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-xl border border-[#DCE8F2] bg-white text-xs font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ━━━ WRITE REVIEW MODAL ━━━ */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#DCE8F2] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8F2]">
              <div>
                <h3 className="text-base font-black text-[#0F2A3D]">
                  Review {placeName}
                </h3>
                <p className="text-xs text-[#5B7385]">
                  Help fellow travelers plan an unforgettable experience
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-[#F5FAFF] hover:bg-[#EAF4FD] text-[#5B7385] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* Star Rating Picker */}
              <div>
                <label className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider block mb-2">
                  Your Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRatingScore(s)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= ratingScore
                            ? 'fill-[#F5A623] text-[#F5A623]'
                            : 'text-[#DCE8F2] fill-[#DCE8F2]'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#0F2A3D] ml-2">
                    {ratingScore} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Author Name */}
              {!user && (
                <div>
                  <label className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Kasun Fernando"
                    className="w-full text-xs rounded-xl border border-[#DCE8F2] p-3 text-[#0F2A3D] outline-none focus:border-[#38A9F0]"
                  />
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider block mb-1">
                  Your Review &amp; Practical Tips *
                </label>
                <textarea
                  required
                  rows={4}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share details about optimal timing, trail conditions, local guides, or food options..."
                  className="w-full text-xs rounded-xl border border-[#DCE8F2] p-3 text-[#0F2A3D] outline-none focus:border-[#38A9F0]"
                />
              </div>

              {/* Photos upload */}
              <div>
                <label className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider block mb-2">
                  Attach Photos (Up to 5)
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#DCE8F2]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt="Uploaded" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label className="w-16 h-16 rounded-xl border-2 border-dashed border-[#DCE8F2] hover:border-[#38A9F0] flex flex-col items-center justify-center text-[#5B7385] cursor-pointer hover:bg-[#F5FAFF] transition-colors">
                      <Upload className="w-4 h-4 text-[#38A9F0]" />
                      <span className="text-[9px] font-bold mt-1">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingPhoto}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {uploadingPhoto && (
                  <p className="text-[11px] text-[#38A9F0] flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading photograph...
                  </p>
                )}
              </div>

              {/* Form submit bar */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE8F2]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5B7385]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#38A9F0]/25 transition-all cursor-pointer"
                >
                  {submitting ? 'Submitting...' : 'Post Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
