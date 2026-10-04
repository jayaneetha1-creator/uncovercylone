'use client';

/**
 * src/components/FloatingAIButton.tsx
 * Floating "Plan with AI" trigger and global mount for the AI Chatbot Drawer.
 * Disappears completely when chatbot master switch is OFF in admin settings.
 */

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, Compass } from 'lucide-react';
import AIChatPanel from './AIChatPanel';

export default function FloatingAIButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [pageContext, setPageContext] = useState<{
    placeId?: number;
    placeName?: string;
    category?: string;
    path?: string;
  }>({});
  const [isEnabled, setIsEnabled] = useState(true);
  const pathname = usePathname();

  // Hide completely in Admin workspace
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    // Check if AI is enabled via API
    fetch('/api/admin/ai')
      .then((res) => {
        if (!res.ok) return;
        return res.json();
      })
      .then((data) => {
        if (data?.settings && data.settings.masterEnabled === false) {
          setIsEnabled(false);
        }
      })
      .catch(() => {});

    // Listen to open-ai-chat custom event
    const handleOpenAIChat = (e: Event) => {
      const customEvent = e as CustomEvent<{
        placeContext?: string;
        placeId?: number;
        category?: string;
        initialQuery?: string;
      }>;

      if (customEvent.detail) {
        setInitialQuery(customEvent.detail.initialQuery || '');
        setPageContext({
          placeName: customEvent.detail.placeContext,
          placeId: customEvent.detail.placeId,
          category: customEvent.detail.category,
          path: window.location.pathname,
        });
      }
      setIsOpen(true);
    };

    window.addEventListener('open-ai-chat', handleOpenAIChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenAIChat);
  }, []);

  if (isAdmin || !isEnabled) return null;

  return (
    <>
      {/* Floating Action Button on Bottom Left */}
      <button
        type="button"
        onClick={() => {
          setInitialQuery('');
          setPageContext({ path: pathname });
          setIsOpen(true);
        }}
        aria-label="Open AI Trip Assistant"
        className="fixed bottom-6 left-6 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0F2A3D] via-[#1A3A52] to-[#0F2A3D] text-white shadow-xl shadow-sky-950/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-[#38A9F0]/40 cursor-pointer"
      >
        <div className="w-6 h-6 rounded-full bg-[#38A9F0] text-white flex items-center justify-center flex-shrink-0 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-black tracking-wide group-hover:text-[#38A9F0] transition">
          Plan with AI
        </span>
      </button>

      {/* The Slide-in Drawer */}
      <AIChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialQuery={initialQuery}
        pageContext={pageContext}
      />
    </>
  );
}
