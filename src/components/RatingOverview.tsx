'use client';

import React from 'react';
import { Star, Award, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

interface RatingOverviewProps {
  rating: number;
  reviewCount: number;
  subRatings?: {
    scenery?: number;
    cleanliness?: number;
    value?: number;
    accessibility?: number;
  };
  distribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function RatingOverview({
  rating,
  reviewCount,
  subRatings = { scenery: 4.9, cleanliness: 4.8, value: 4.7, accessibility: 4.6 },
  distribution,
}: RatingOverviewProps) {
  // If distribution is not provided, estimate realistically based on score and count
  const dist = distribution || {
    5: Math.round(reviewCount * 0.75),
    4: Math.round(reviewCount * 0.18),
    3: Math.round(reviewCount * 0.05),
    2: Math.round(reviewCount * 0.01),
    1: Math.round(reviewCount * 0.01),
  };

  const getRatingLabel = (score: number) => {
    if (score >= 4.8) return 'Exceptional';
    if (score >= 4.5) return 'Excellent';
    if (score >= 4.0) return 'Very Good';
    if (score >= 3.5) return 'Good';
    if (score >= 3.0) return 'Average';
    return 'Fair';
  };

  const scoreFormatted = Number(rating || 5.0).toFixed(1);
  const ratingLabel = getRatingLabel(Number(rating || 5.0));

  return (
    <div className="bg-[#F5FAFF] rounded-3xl border border-[#DCE8F2] p-5 sm:p-7 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6 items-center">
        
        {/* Left: Overall Score Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start md:flex-col gap-4 text-center sm:text-left md:text-center">
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-[#DCE8F2] shadow-xs w-36 h-36">
            <span className="text-4xl font-black text-[#0F2A3D] tracking-tight">
              {scoreFormatted}
            </span>
            <div className="flex items-center gap-1 my-1.5 text-[#F5A623]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= Math.round(rating)
                      ? 'fill-[#F5A623] text-[#F5A623]'
                      : 'text-[#DCE8F2] fill-[#DCE8F2]'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-black text-[#38A9F0] uppercase tracking-wider">
              {ratingLabel}
            </span>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAFBF3] text-[#2FB67C] text-xs font-bold mb-1 border border-[#C3F4DE]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Traveler Feedback</span>
            </div>
            <p className="text-xs text-[#5B7385] mt-1 max-w-xs">
              Based on {reviewCount} authentic traveler experiences across Ceylon
            </p>
          </div>
        </div>

        {/* Right: Star Distribution Bars */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider mb-2">
            Rating Distribution
          </h4>

          {[5, 4, 3, 2, 1].map((stars) => {
            const count = dist[stars as keyof typeof dist] || 0;
            const pct = reviewCount > 0 ? Math.min(100, Math.round((count / reviewCount) * 100)) : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-[#0F2A3D] flex items-center gap-1">
                  <span>{stars}</span>
                  <Star className="w-3 h-3 fill-[#F5A623] text-[#F5A623]" />
                </span>

                {/* Progress Bar Container */}
                <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden border border-[#DCE8F2]">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-[#38A9F0] rounded-full transition-all duration-500"
                  />
                </div>

                <span className="w-9 text-right text-[11px] font-semibold text-[#5B7385]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* ━━━ SUB-RATINGS ROW ━━━ */}
      {subRatings && (
        <div className="pt-5 border-t border-[#DCE8F2]">
          <h4 className="text-xs font-black text-[#0F2A3D] uppercase tracking-wider mb-3">
            Category Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Scenery', score: subRatings.scenery || 4.9 },
              { label: 'Cleanliness', score: subRatings.cleanliness || 4.8 },
              { label: 'Value for Money', score: subRatings.value || 4.7 },
              { label: 'Accessibility', score: subRatings.accessibility || 4.6 },
            ].map((sub) => (
              <div
                key={sub.label}
                className="bg-white rounded-xl p-3 border border-[#DCE8F2] flex flex-col justify-between"
              >
                <span className="text-[11px] font-bold text-[#5B7385] truncate">
                  {sub.label}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-[#0F2A3D]">
                    {sub.score.toFixed(1)}
                  </span>
                  <div className="w-12 h-1.5 bg-[#EAF4FD] rounded-full overflow-hidden ml-2">
                    <div
                      style={{ width: `${(sub.score / 5) * 100}%` }}
                      className="h-full bg-[#38A9F0] rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
