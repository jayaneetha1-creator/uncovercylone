'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Review } from '@/types';
import {
  Star, ThumbsUp, MessageSquare, ShieldCheck,
  CheckCircle2, User, CornerDownRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ExtendedReview extends Review {
  photos?: string[];
  helpful_count?: number;
  reply?: {
    id: number;
    author_name?: string;
    reply_text: string;
    created_at: string;
  };
}

interface ReviewCardProps {
  review: ExtendedReview;
  onVoteSuccess?: (reviewId: number, newCount: number) => void;
}

export default function ReviewCard({ review, onVoteSuccess }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleVote = async () => {
    if (hasVoted || isVoting) return;
    setIsVoting(true);

    try {
      const res = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHelpfulCount(data.helpful_count);
        setHasVoted(true);
        if (onVoteSuccess) onVoteSuccess(review.id, data.helpful_count);
        toast.success('Marked as helpful!');
      } else {
        toast.error(data.error || 'Failed to vote');
      }
    } catch {
      toast.error('Network error while voting');
    } finally {
      setIsVoting(false);
    }
  };

  const initial = review.author ? review.author.charAt(0).toUpperCase() : 'T';

  return (
    <div className="bg-white rounded-2xl border border-[#DCE8F2] p-5 sm:p-6 space-y-4 shadow-[0_2px_12px_rgba(15,42,61,0.02)]">
      
      {/* ━━━ REVIEW HEADER ━━━ */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EAF4FD] text-[#38A9F0] font-black text-sm flex items-center justify-center border border-[#DCEFFD] flex-shrink-0">
            {initial}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-bold text-[#0F2A3D]">
                {review.author || 'Ceylon Traveler'}
              </h4>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EAFBF3] text-[#2FB67C] text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Visit</span>
              </span>
            </div>
            <p className="text-[11px] text-[#5B7385] mt-0.5">
              {new Date(review.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 bg-[#FFF9E6] px-2.5 py-1 rounded-lg border border-[#FFE8A3] flex-shrink-0">
          <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
          <span className="text-xs font-black text-[#0F2A3D]">
            {Number(review.rating).toFixed(1)}
          </span>
        </div>
      </div>

      {/* ━━━ REVIEW COMMENT ━━━ */}
      <p className="text-xs sm:text-sm text-[#0F2A3D] leading-relaxed whitespace-pre-line">
        {review.comment}
      </p>

      {/* ━━━ REVIEW PHOTOS (IF ATTACHED) ━━━ */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
          {review.photos.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-[#DCE8F2] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Image src={photo} alt="Traveler photo" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ━━━ ACTION ROW (HELPFUL VOTE) ━━━ */}
      <div className="pt-2 flex items-center justify-between text-xs text-[#5B7385] border-t border-[#F0F5FA]">
        <button
          type="button"
          onClick={handleVote}
          disabled={hasVoted || isVoting}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
            hasVoted
              ? 'bg-[#EAFBF3] text-[#2FB67C]'
              : 'hover:bg-[#F5FAFF] hover:text-[#0F2A3D]'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-[#2FB67C]' : ''}`} />
          <span>Helpful ({helpfulCount})</span>
        </button>

        <span className="text-[11px] text-[#5B7385]">
          UncoverCeylon Traveler Review
        </span>
      </div>

      {/* ━━━ OFFICIAL STAFF REPLY (IF PRESENT) ━━━ */}
      {review.reply && (
        <div className="mt-3 pt-3 border-t border-[#DCE8F2] pl-3 sm:pl-4 bg-[#F5FAFF] rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-3.5 h-3.5 text-[#38A9F0]" />
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-[10px] font-black uppercase tracking-wider border border-[#DCEFFD]">
              <ShieldCheck className="w-3 h-3 text-[#38A9F0]" />
              <span>Official Team Reply</span>
            </div>
            <span className="text-[11px] text-[#5B7385]">
              {review.reply.author_name || 'UncoverCeylon Support'}
            </span>
          </div>
          <p className="text-xs text-[#0F2A3D] leading-relaxed pl-5 italic">
            &ldquo;{review.reply.reply_text}&rdquo;
          </p>
        </div>
      )}

      {/* Lightbox for review photo */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[80vh] w-full h-full">
            <Image src={selectedPhoto} alt="Enlarged photo" fill className="object-contain" />
          </div>
        </div>
      )}

    </div>
  );
}
