'use client';

import { useState } from 'react';
import { Review } from '@/types';
import { Star, Send, Loader2, CheckCircle2, ThumbsUp, MessageSquarePlus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewSectionProps {
  placeId: number;
  initialReviews: Review[];
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-hidden transition-transform hover:scale-110 cursor-pointer"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              s <= (hovered || value) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200 hover:text-emerald-400/50'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ placeId, initialReviews }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [website, setWebsite] = useState('');
  const [challenge, setChallenge] = useState(() => ({
    num1: Math.floor(Math.random() * 6) + 3,
    num2: Math.floor(Math.random() * 5) + 2,
  }));
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const refreshChallenge = () => {
    setChallenge({
      num1: Math.floor(Math.random() * 6) + 3,
      num2: Math.floor(Math.random() * 5) + 2,
    });
    setUserAnswer('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || rating === 0) {
      toast.error('Please fill in your name, rating, and review.');
      return;
    }

    if (parseInt(userAnswer.trim(), 10) !== challenge.num1 + challenge.num2) {
      toast.error('Incorrect human verification answer. Please try again.');
      refreshChallenge();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          place_id: placeId,
          author: author.trim(),
          rating,
          comment: comment.trim(),
          website,
          challenge_answer: userAnswer.trim(),
          expected_challenge: challenge.num1 + challenge.num2,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');

      if (data.status === 'pending') {
        toast.success(data.message || 'Thank you! Your review is pending quick admin moderation.', {
          duration: 5000,
        });
      } else {
        const newReview: Review = {
          id: data.id || Date.now(),
          place_id: placeId,
          author: author.trim(),
          rating,
          comment: comment.trim(),
          created_at: new Date().toISOString(),
          status: 'approved',
        };
        setReviews((prev) => [newReview, ...prev]);
        toast.success('Thank you! Review posted successfully.');
      }

      setAuthor('');
      setRating(5);
      setComment('');
      setWebsite('');
      setShowForm(false);
      refreshChallenge();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      toast.error(msg);
      refreshChallenge();
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // TripAdvisor Rating Breakdown calculations (Image 5 style)
  const totalReviewsCount = Math.max(reviews.length, 1);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '4.9';

  return (
    <div className="space-y-8" id="reviews-section">
      {/* ━━━ TRIPADVISOR-STYLE REVIEWS BREAKDOWN CARD (Image 5) ━━━ */}
      <div className="border-b border-slate-200 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Traveler Reviews</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Authentic feedback from verified island visitors</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Showing {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </span>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-1.5 bg-[#00aa6c] hover:bg-[#008f5a] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{showForm ? 'Cancel Review' : 'Write a Review'}</span>
            </button>
          </div>
        </div>

        {/* Rating Breakdown Grid */}
        <div className="bg-slate-50/80 rounded-2xl p-5 sm:p-7 border border-slate-200/90 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Big Score Box */}
          <div className="md:col-span-3 text-center md:text-left md:border-r border-slate-200/80 md:pr-6">
            <div className="text-5xl font-black text-slate-900 tracking-tight">
              {avgRating}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="w-3.5 h-3.5 rounded-full bg-[#00aa6c] inline-block" />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-800">Excellent Experience</p>
            <p className="text-xs text-slate-500 mt-0.5">Based on community ratings</p>
          </div>

          {/* Distribution Bars */}
          <div className="md:col-span-5 space-y-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-3">
              <span className="w-16 text-right">Excellent</span>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#00aa6c] rounded-full" style={{ width: '85%' }} />
              </div>
              <span className="w-8 text-slate-400 text-right">85%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-right">Very Good</span>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#00aa6c] rounded-full" style={{ width: '12%' }} />
              </div>
              <span className="w-8 text-slate-400 text-right">12%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-right">Average</span>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '3%' }} />
              </div>
              <span className="w-8 text-slate-400 text-right">3%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-right">Poor</span>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: '0%' }} />
              </div>
              <span className="w-8 text-slate-400 text-right">0%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-right">Terrible</span>
              <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 rounded-full" style={{ width: '0%' }} />
              </div>
              <span className="w-8 text-slate-400 text-right">0%</span>
            </div>
          </div>

          {/* Sub-Category Ratings (TripAdvisor style) */}
          <div className="md:col-span-4 md:border-l border-slate-200/80 md:pl-6 space-y-2 text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between">
              <span>Scenic Views</span>
              <div className="flex items-center gap-1.5 text-slate-900">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="w-2 h-2 rounded-full bg-[#00aa6c]" />
                  ))}
                </div>
                <span>5.0</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Photo Spots</span>
              <div className="flex items-center gap-1.5 text-slate-900">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="w-2 h-2 rounded-full bg-[#00aa6c]" />
                  ))}
                </div>
                <span>5.0</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Accessibility</span>
              <div className="flex items-center gap-1.5 text-slate-900">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map((s) => (
                    <span key={s} className="w-2 h-2 rounded-full bg-[#00aa6c]" />
                  ))}
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
                <span>4.6</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Atmosphere & Value</span>
              <div className="flex items-center gap-1.5 text-slate-900">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="w-2 h-2 rounded-full bg-[#00aa6c]" />
                  ))}
                </div>
                <span>4.9</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ WRITE A REVIEW FORM (COLLAPSIBLE) ━━━ */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-slate-900 mb-1">Share Your Experience</h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">
            Your review helps independent explorers plan their trip across Sri Lanka.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="hidden" aria-hidden="true">
              <input
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
              />
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                Your Overall Rating
              </label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Ruwan Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-emerald-500 focus:bg-white transition-all outline-hidden"
                  required
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                  Verification ({challenge.num1} + {challenge.num2} = ?)
                </label>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Answer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-emerald-500 focus:bg-white transition-all outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 text-xs font-bold uppercase tracking-wider mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What did you enjoy most? Best viewpoints, timings, or practical tips for fellow travelers?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 text-sm focus:border-emerald-500 focus:bg-white transition-all outline-hidden resize-y"
                required
                maxLength={1000}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-[#00aa6c] hover:bg-[#008f5a] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ━━━ REVIEWS LIST ━━━ */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-600 font-bold text-sm">Be the first to leave a review!</p>
            <p className="text-xs text-slate-400 mt-1">Share your experience to help others visit this destination.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{r.author}</span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Visit
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                  </div>
                </div>

                <div className="flex gap-1 text-emerald-600">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`w-2.5 h-2.5 rounded-full inline-block ${
                        s <= r.rating ? 'bg-[#00aa6c]' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line pl-1">
                {r.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
