/**
 * src/components/TripItemRow.tsx
 * Individual itinerary item with interactive visited checkbox, notes, reordering, and metadata.
 */

'use client';

import React, { useState } from 'react';
import { TripItem } from '@/lib/trips/constants';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ChevronUp, ChevronDown, Trash2, Edit3, MapPin, CheckSquare, Square } from 'lucide-react';

interface TripItemRowProps {
  item: TripItem;
  index: number;
  totalItems: number;
  onToggleVisited: (itemId: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete: (itemId: number) => void;
  onSaveNotes: (itemId: number, notes: string) => void;
  readOnly?: boolean;
}

export function TripItemRow({
  item,
  index,
  totalItems,
  onToggleVisited,
  onMoveUp,
  onMoveDown,
  onDelete,
  onSaveNotes,
  readOnly = false,
}: TripItemRowProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');

  const handleNotesBlur = () => {
    setIsEditingNotes(false);
    if (notes !== item.notes) {
      onSaveNotes(item.id, notes);
    }
  };

  const isCustom = item.item_type === 'custom';

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        item.is_visited
          ? 'bg-slate-50/80 border-slate-200 opacity-80'
          : 'bg-white border-[#DCE8F2] shadow-2xs hover:border-[#38A9F0]/40 hover:shadow-xs'
      } p-3.5 sm:p-4`}
    >
      <div className="flex items-start gap-3">
        {/* Order Badge / Marker Number */}
        <div
          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center transition-colors ${
            item.is_visited
              ? 'bg-emerald-500 text-white'
              : 'bg-[#DCEFFD] text-[#0284C7]'
          }`}
        >
          {item.is_visited ? <Check className="w-4 h-4 stroke-[3]" /> : index + 1}
        </div>

        {/* Thumbnail Image for place items */}
        {!isCustom && item.place?.image_url && (
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
            <Image
              src={item.place.image_url}
              alt={item.title}
              fill
              sizes="64px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isCustom ? (
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                To-Do
              </span>
            ) : item.place?.category ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700">
                {item.place.category}
              </span>
            ) : null}

            {item.place?.province && (
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                • {item.place.province}
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-2">
            {!isCustom && item.place_id ? (
              <Link
                href={`/places/${item.place_id}`}
                className={`text-sm sm:text-base font-bold truncate transition-colors hover:text-[#0284C7] ${
                  item.is_visited ? 'line-through text-slate-400' : 'text-[#0F2A3D]'
                }`}
              >
                {item.title}
              </Link>
            ) : (
              <h4
                className={`text-sm sm:text-base font-semibold truncate ${
                  item.is_visited ? 'line-through text-slate-400' : 'text-[#0F2A3D]'
                }`}
              >
                {item.title}
              </h4>
            )}
          </div>

          {/* Notes display or editor */}
          {!readOnly ? (
            <div className="mt-1">
              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  autoFocus
                  rows={2}
                  placeholder="Add tips, booking ref, or arrival notes..."
                  className="w-full text-xs p-2 rounded-lg border border-[#38A9F0] focus:outline-hidden bg-white text-slate-800"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-left text-xs text-slate-500 hover:text-[#0284C7] flex items-center gap-1 group/note"
                >
                  <Edit3 className="w-3 h-3 opacity-60 group-hover/note:opacity-100" />
                  <span className={notes ? 'text-slate-600 italic' : 'text-slate-400'}>
                    {notes || 'Add personal note...'}
                  </span>
                </button>
              )}
            </div>
          ) : (
            notes && (
              <p className="mt-1 text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                {notes}
              </p>
            )
          )}
        </div>

        {/* Action Controls */}
        {!readOnly && (
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-center">
            {/* Mark Visited */}
            <button
              type="button"
              onClick={() => onToggleVisited(item.id)}
              title={item.is_visited ? 'Mark unvisited' : 'Mark visited'}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                item.is_visited
                  ? 'text-emerald-600 hover:bg-emerald-50'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.is_visited ? (
                <CheckSquare className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Square className="w-5 h-5 stroke-[2]" />
              )}
            </button>

            {/* Reorder Arrows */}
            <div className="hidden sm:flex flex-col">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-opacity"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalItems - 1}
                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-opacity"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Delete Stop */}
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              title="Remove stop"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
