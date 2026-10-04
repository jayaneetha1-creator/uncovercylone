'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface FolderProps {
  id?: string;
  title: string;
  subtitle?: string;
  count?: number | string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export default function Folder({
  id,
  title,
  subtitle,
  count,
  icon,
  defaultOpen = true,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}: FolderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section
      id={id}
      aria-expanded={isOpen}
      className={`bg-white rounded-3xl border border-[#DCE8F2] shadow-[0_2px_16px_rgba(15,42,61,0.03)] overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* ━━━ FOLDER HEADER ━━━ */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-controls={id ? `${id}-content` : undefined}
        className={`w-full flex items-center justify-between px-5 sm:px-7 py-4.5 text-left cursor-pointer transition-colors select-none ${
          isOpen ? 'bg-white' : 'bg-white hover:bg-[#F5FAFF]'
        } ${headerClassName}`}
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-4">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-[#EAF4FD] text-[#38A9F0] flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#0F2A3D] tracking-tight truncate">
                {title}
              </h3>
              {count !== undefined && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] border border-[#DCE8F2]">
                  {count}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[#5B7385] mt-0.5 line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}

          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-[#5B7385] transition-all duration-200 ${
              isOpen ? 'bg-[#EAF4FD] text-[#38A9F0] rotate-180' : 'bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </button>

      {/* ━━━ FOLDER CONTENT (ANIMATED) ━━━ */}
      {isOpen && (
        <div
          id={id ? `${id}-content` : undefined}
          className={`px-5 sm:px-7 pb-6 pt-2 border-t border-[#DCE8F2]/60 animate-in fade-in-50 duration-200 ${bodyClassName}`}
        >
          {children}
        </div>
      )}
    </section>
  );
}
