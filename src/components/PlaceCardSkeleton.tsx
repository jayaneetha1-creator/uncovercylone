'use client';

export default function PlaceCardSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-[#DCE8F2] bg-white shadow-xs animate-pulse">
      {/* 4:3 Image Skeleton */}
      <div className="aspect-[4/3] w-full bg-gradient-to-r from-[#EAF4FD] via-[#DCEFFD] to-[#EAF4FD]" />

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5 space-y-3">
        <div className="space-y-2">
          {/* Location & Distance row */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-24 bg-[#EAF4FD] rounded-md" />
            <div className="h-3 w-14 bg-[#EAF4FD] rounded-md" />
          </div>

          {/* Title */}
          <div className="h-4.5 w-4/5 bg-[#CBDCEB]/60 rounded-md" />

          {/* Short description */}
          <div className="space-y-1 pt-1">
            <div className="h-3 w-full bg-[#EAF4FD] rounded-md" />
            <div className="h-3 w-2/3 bg-[#EAF4FD] rounded-md" />
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between border-t border-[#DCE8F2]/60 pt-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-10 bg-[#EAF4FD] rounded-md" />
            <div className="h-4 w-14 bg-[#EAF4FD] rounded-md" />
          </div>
          <div className="h-4 w-12 bg-[#EAF4FD] rounded-md" />
        </div>
      </div>
    </div>
  );
}
