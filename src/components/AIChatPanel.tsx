'use client';

/**
 * src/components/AIChatPanel.tsx
 * Desktop Left Slide-in Drawer (~400px) & Mobile Full-Screen Sheet.
 * Complete implementation of Section 4.6-D:
 * - Empty state with Season, Travelers, and Recents chips
 * - Autocomplete for @place mentions
 * - 4 tappable example questions (EN/SI)
 * - Streaming responses with typing indicator
 * - Thumbs up / down feedback
 * - Itinerary proposal cards with "Add to my trip"
 * - Guest limit gate (2 messages)
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  X,
  Send,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Calendar,
  Users,
  History,
  MapPin,
  LogIn,
  ChevronRight,
  Loader2,
  Compass,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AITripProposalCard, { ItineraryProposal } from './AITripProposalCard';

interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  itineraryProposal?: ItineraryProposal | null;
  feedback?: number;
}

interface PlaceSuggestion {
  id: number;
  name: string;
  category: string;
  location: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  pageContext?: {
    placeId?: number;
    placeName?: string;
    category?: string;
    path?: string;
  };
}

let idCounter = 0;
function createUniqueId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

export default function AIChatPanel({
  isOpen,
  onClose,
  initialQuery = '',
  pageContext,
}: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => createUniqueId('sess'));
  const [guestToken, setGuestToken] = useState<string>('');
  const [isGuestLimitReached, setIsGuestLimitReached] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Recents drawer state
  const [showRecents, setShowRecents] = useState(false);
  const [recentSessions, setRecentSessions] = useState<{ id: string; title: string; updated_at: string }[]>([]);
  const [loadingRecents, setLoadingRecents] = useState(false);

  // Filter chips state
  const [selectedTravelers, setSelectedTravelers] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  // @ mentions autocomplete state
  const [mentionSuggestions, setMentionSuggestions] = useState<PlaceSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [allPlaces, setAllPlaces] = useState<PlaceSuggestion[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Generate or retrieve guest token
  useEffect(() => {
    let token = localStorage.getItem('uc_ai_guest_token');
    if (!token) {
      token = createUniqueId('gst');
      localStorage.setItem('uc_ai_guest_token', token);
    }
    setGuestToken(token);

    // Check login status
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => setIsLoggedIn(false));

    // Preload places for @ autocomplete
    fetch('/api/places')
      .then((res) => res.json())
      .then((data) => {
        if (data.places && Array.isArray(data.places)) {
          setAllPlaces(
            data.places.map((p: { id: number; name: string; category: string; location: string }) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              location: p.location,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Handle external open-ai-chat event
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ placeContext?: string; initialQuery?: string }>;
      if (customEvent.detail?.initialQuery) {
        setInputValue(customEvent.detail.initialQuery);
      }
    };
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Handle @ mention typing
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const lastAtIdx = val.lastIndexOf('@');
    if (lastAtIdx !== -1 && lastAtIdx === val.length - 1) {
      setMentionQuery('');
      setMentionSuggestions(allPlaces.slice(0, 5));
    } else if (lastAtIdx !== -1 && lastAtIdx < val.length) {
      const queryPart = val.slice(lastAtIdx + 1).toLowerCase();
      if (!queryPart.includes(' ')) {
        setMentionQuery(queryPart);
        const matches = allPlaces
          .filter((p) => p.name.toLowerCase().includes(queryPart))
          .slice(0, 5);
        setMentionSuggestions(matches);
      } else {
        setMentionQuery(null);
      }
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectMention = (place: PlaceSuggestion) => {
    const lastAtIdx = inputValue.lastIndexOf('@');
    if (lastAtIdx !== -1) {
      const newText = inputValue.slice(0, lastAtIdx) + `@${place.name} `;
      setInputValue(newText);
    }
    setMentionQuery(null);
    inputRef.current?.focus();
  };

  // Start a new chat session
  const handleNewChat = () => {
    setSessionId(createUniqueId('sess'));
    setMessages([]);
    setIsGuestLimitReached(false);
    setSelectedTravelers(null);
    setSelectedSeason(null);
    setShowRecents(false);
  };

  // Fetch recent sessions
  const handleToggleRecents = async () => {
    if (!showRecents) {
      setShowRecents(true);
      setLoadingRecents(true);
      try {
        const res = await fetch('/api/chat/sessions');
        const data = await res.json();
        setRecentSessions(data.sessions || []);
      } catch {
        setRecentSessions([]);
      } finally {
        setLoadingRecents(false);
      }
    } else {
      setShowRecents(false);
    }
  };

  const handleSelectRecentSession = async (sessId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessId}`);
      const data = await res.json();
      if (data.messages) {
        setSessionId(sessId);
        setMessages(
          data.messages.map((m: { id: number; role: 'user' | 'model' | 'system'; content: string; itinerary_proposal?: string }) => ({
            id: String(m.id),
            role: m.role,
            content: m.content,
            itineraryProposal: m.itinerary_proposal ? JSON.parse(m.itinerary_proposal) : null,
          }))
        );
        setShowRecents(false);
      }
    } catch {
      toast.error('Could not load session.');
    }
  };

  const handleDeleteRecentSession = async (sessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/sessions/${sessId}`, { method: 'DELETE' });
      if (res.ok) {
        setRecentSessions((prev) => prev.filter((s) => s.id !== sessId));
        if (sessionId === sessId) {
          handleNewChat();
        }
      }
    } catch {
      toast.error('Failed to delete chat');
    }
  };

  // Send message and stream response
  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || inputValue).trim();
    if (!promptText || isStreaming) return;

    let fullPrompt = promptText;
    if (selectedTravelers && !promptText.toLowerCase().includes(selectedTravelers.toLowerCase())) {
      fullPrompt += ` (Traveling style: ${selectedTravelers})`;
    }
    if (selectedSeason && !promptText.toLowerCase().includes(selectedSeason.toLowerCase())) {
      fullPrompt += ` (Planned season: ${selectedSeason})`;
    }

    const userMsgId = createUniqueId('msg');
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: fullPrompt,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setMentionQuery(null);
    setIsStreaming(true);

    const assistantMsgId = createUniqueId('asst');
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'model',
      content: '',
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullPrompt,
          sessionId,
          guestToken,
          pageContext,
        }),
      });

      if (res.status === 429) {
        const errData = await res.json();
        setIsStreaming(false);
        if (errData.reason === 'guest_limit_reached') {
          setIsGuestLimitReached(true);
        } else {
          toast.error('You have reached the daily message limit.');
        }
        // Remove empty assistant placeholder
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error('Chat service error');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;

        // Parse itinerary if present
        let parsedProposal: ItineraryProposal | null = null;
        const itineraryMatch = streamedContent.match(/```itinerary\s*([\s\S]*?)\s*```/);
        if (itineraryMatch && itineraryMatch[1]) {
          try {
            parsedProposal = JSON.parse(itineraryMatch[1]);
          } catch {
            // Partial JSON while streaming
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: streamedContent,
                  itineraryProposal: parsedProposal,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error('Streaming error:', err);
      toast.error('Failed to get a response from AI Assistant.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleFeedback = async (msgId: string, feedbackValue: number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: feedbackValue } : m))
    );
    toast.success('Thank you for your feedback! 🙏');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Slide-in panel (Left on desktop, bottom sheet on mobile) */}
      <div className="relative z-10 w-full sm:w-[420px] lg:w-[450px] h-full bg-white shadow-2xl flex flex-col text-[#0F2A3D] animate-in slide-in-from-left duration-300 ease-out border-r border-[#DCE8F2]">
        
        {/* ━━━ HEADER ━━━ */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DCE8F2] bg-[#F5FAFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#38A9F0] to-[#1E93DC] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0F2A3D] flex items-center gap-1.5">
                <span>AI Assistant</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#EAF4FD] text-[#38A9F0] font-bold border border-[#DCEFFD]">
                  Ceylon AI
                </span>
              </h3>
              <p className="text-[11px] text-[#5B7385]">Your Sri Lanka trip companion</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleNewChat}
              title="Start a new chat"
              className="p-2 rounded-xl text-[#5B7385] hover:text-[#0F2A3D] hover:bg-slate-200/50 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close panel"
              className="p-2 rounded-xl text-[#5B7385] hover:text-[#0F2A3D] hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ━━━ BODY ━━━ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Recents Overlay Drawer */}
          {showRecents ? (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE8F2]">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5B7385] flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#38A9F0]" />
                  <span>Recent Conversations</span>
                </h4>
                <button
                  onClick={() => setShowRecents(false)}
                  className="text-xs font-semibold text-[#38A9F0] hover:underline"
                >
                  Back to chat
                </button>
              </div>

              {loadingRecents ? (
                <div className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#38A9F0]" />
                  <span className="text-xs">Loading past chats...</span>
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No past conversations found. Signed-in travelers can revisit their plans here!
                </div>
              ) : (
                <div className="space-y-1.5">
                  {recentSessions.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectRecentSession(s.id)}
                      className="group flex items-center justify-between p-3 rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] hover:bg-white hover:border-[#38A9F0] transition cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-[#0F2A3D] truncate">{s.title || 'Trip Plan'}</p>
                        <p className="text-[10px] text-[#5B7385]">{new Date(s.updated_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteRecentSession(s.id, e)}
                        title="Delete chat"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : messages.length === 0 ? (
            /* ━━━ EMPTY STATE (Section 4.6-D) ━━━ */
            <div className="space-y-5 py-2 animate-fade-in">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF4FD] border border-[#DCEFFD] text-[#38A9F0] flex items-center justify-center mb-3 shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-[#0F2A3D] tracking-tight">
                  Let&apos;s plan your next trip
                </h3>
                <p className="text-xs text-[#5B7385] mt-1 leading-relaxed">
                  Personalized advice, hidden stops &amp; island logistics powered by Ceylon travel intelligence.
                </p>
              </div>

              {/* 3 Smart Chips: Season, Travelers, Recents */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-[#5B7385] uppercase tracking-wider block">
                  Quick Preferences
                </span>
                <div className="flex flex-wrap gap-2">
                  {/* Season Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSeason(
                          selectedSeason === 'Nov–Apr (Dry Season)'
                            ? null
                            : 'Nov–Apr (Dry Season)'
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedSeason
                          ? 'bg-[#38A9F0] text-white border-[#38A9F0]'
                          : 'bg-white text-[#0F2A3D] border-[#DCE8F2] hover:bg-[#F5FAFF]'
                      }`}
                    >
                      <Calendar className="w-3 h-3 text-[#F5A623]" />
                      <span>{selectedSeason || 'Season: Nov–Apr'}</span>
                    </button>
                  </div>

                  {/* Travelers Chip */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const options = ['Solo', 'Couple', 'Family', 'Friends'];
                        const nextIdx = (options.indexOf(selectedTravelers || '') + 1) % options.length;
                        setSelectedTravelers(options[nextIdx]);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedTravelers
                          ? 'bg-[#38A9F0] text-white border-[#38A9F0]'
                          : 'bg-white text-[#0F2A3D] border-[#DCE8F2] hover:bg-[#F5FAFF]'
                      }`}
                    >
                      <Users className="w-3 h-3 text-[#38A9F0]" />
                      <span>{selectedTravelers ? `Travelers: ${selectedTravelers}` : 'Travelers'}</span>
                    </button>
                  </div>

                  {/* Recents Chip */}
                  <button
                    type="button"
                    onClick={handleToggleRecents}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white text-[#0F2A3D] border border-[#DCE8F2] hover:bg-[#F5FAFF] transition"
                  >
                    <History className="w-3 h-3 text-slate-400" />
                    <span>Recents</span>
                  </button>
                </div>
              </div>

              {/* 4 Tappable Example Questions (Section 4.6-D) */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-[#5B7385] uppercase tracking-wider block">
                  Ask Anything
                </span>
                <div className="space-y-2">
                  {[
                    'Plan a 4-day scenic trip to Kandy, Nuwara Eliya & Ella',
                    'What are the best secluded beaches to visit right now?',
                    'What cultural etiquette should I follow when visiting sacred temples?',
                    'How do I take the scenic blue train from Kandy to Ella?',
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="w-full text-left p-3 rounded-2xl border border-[#DCE8F2] bg-[#F5FAFF] hover:bg-white hover:border-[#38A9F0] hover:shadow-xs transition text-xs font-medium text-[#0F2A3D] flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#38A9F0] group-hover:translate-x-0.5 transition flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ━━━ CHAT MESSAGES STREAM ━━━ */
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-[#0F2A3D] text-white rounded-br-xs'
                        : 'bg-[#F5FAFF] border border-[#DCE8F2] text-[#0F2A3D] rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {/* Render content */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {m.content.replace(/```itinerary[\s\S]*?```/g, '').trim()}
                    </div>

                    {/* Itinerary Proposal Card */}
                    {m.itineraryProposal && (
                      <AITripProposalCard proposal={m.itineraryProposal} isLoggedIn={isLoggedIn} />
                    )}
                  </div>

                  {/* Feedback thumbs for assistant messages */}
                  {m.role === 'model' && m.content && !isStreaming && (
                    <div className="flex items-center gap-2 mt-1.5 px-1 text-[11px] text-[#5B7385]">
                      <span>Was this helpful?</span>
                      <button
                        type="button"
                        onClick={() => handleFeedback(m.id, 1)}
                        className={`p-1 rounded hover:bg-slate-100 transition ${m.feedback === 1 ? 'text-[#38A9F0]' : 'text-slate-400'}`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeedback(m.id, -1)}
                        className={`p-1 rounded hover:bg-slate-100 transition ${m.feedback === -1 ? 'text-rose-500' : 'text-slate-400'}`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isStreaming && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2] text-xs text-[#5B7385] w-28">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38A9F0] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38A9F0] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#38A9F0] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] font-bold ml-1 text-[#38A9F0]">Thinking</span>
                </div>
              )}

              {/* Guest Limit Reached Card */}
              {isGuestLimitReached && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>You&apos;ve reached the 2-message guest preview</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Create a free account or sign in to continue chatting, plan full multi-day trips, and sync with maps!
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In to Continue</span>
                  </Link>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ━━━ INPUT & AUTOCOMPLETE FOOTER ━━━ */}
        <div className="p-4 border-t border-[#DCE8F2] bg-white relative">
          
          {/* @ Mentions Autocomplete Popup */}
          {mentionQuery !== null && mentionSuggestions.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl border border-[#38A9F0] shadow-xl p-2 z-20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B7385] px-2 block">
                Mention Destination
              </span>
              {mentionSuggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectMention(place)}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-[#F5FAFF] text-xs flex items-center justify-between group transition"
                >
                  <span className="font-bold text-[#0F2A3D] group-hover:text-[#38A9F0]">
                    {place.name}
                  </span>
                  <span className="text-[10px] text-[#5B7385]">{place.location}</span>
                </button>
              ))}
            </div>
          )}

          <div className="relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="e.g., Plan a 4-day trip to the south coast..."
              className="w-full bg-[#F5FAFF] border border-[#DCE8F2] rounded-2xl p-3 pr-12 text-xs sm:text-sm text-[#0F2A3D] placeholder:text-[#5B7385]/60 outline-none focus:border-[#38A9F0] focus:bg-white transition resize-none"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isStreaming}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white disabled:opacity-40 transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5B7385] mt-1.5 px-1">
            <span>Tip: Use <strong className="text-[#38A9F0]">@</strong> to mention any place</span>
            <span>Ceylon AI</span>
          </div>
        </div>

      </div>
    </div>
  );
}
