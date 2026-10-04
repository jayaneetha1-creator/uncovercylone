'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle, MessageSquare, Send, CheckCircle2,
  ShieldCheck, Loader2, Plus, CornerDownRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export interface PlaceAnswer {
  id: number;
  question_id: number;
  user_name: string;
  user_role?: string;
  answer_text: string;
  created_at: string;
}

export interface PlaceQuestion {
  id: number;
  place_id: number;
  user_name: string;
  question_text: string;
  created_at: string;
  answers?: PlaceAnswer[];
}

interface QAListProps {
  placeId: number;
  placeName: string;
}

export default function QAList({ placeId, placeName }: QAListProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PlaceQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // New question form state
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Answering state
  const [answeringQuestionId, setAnsweringQuestionId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchQA = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/places/${placeId}/qa`);
      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQA();
  }, [placeId]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    setSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/places/${placeId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_text: newQuestionText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Your question has been posted!');
        setNewQuestionText('');
        setShowAskModal(false);
        fetchQA();
      } else {
        toast.error(data.error || 'Failed to post question');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAnswerSubmit = async (questionId: number) => {
    if (!answerText.trim()) return;

    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/qa/${questionId}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer_text: answerText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Your answer has been submitted!');
        setAnswerText('');
        setAnsweringQuestionId(null);
        fetchQA();
      } else {
        toast.error(data.error || 'Failed to submit answer');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ━━━ TOP BAR: ASK QUESTION TRIGGER ━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#F5FAFF] border border-[#DCE8F2]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF4FD] text-[#38A9F0] flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#0F2A3D]">
              Community Questions &amp; Practical Advice
            </h4>
            <p className="text-xs text-[#5B7385] mt-0.5">
              Ask real travelers and local residents anything about {placeName}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) {
              toast('Please sign in to ask a question', { icon: '🔑' });
            }
            setShowAskModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#38A9F0]/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ask a Question</span>
        </button>
      </div>

      {/* ━━━ QUESTIONS LIST ━━━ */}
      {loading ? (
        <div className="py-12 flex justify-center text-[#38A9F0]">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE8F2] p-8 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-[#5B7385] mx-auto opacity-40" />
          <h5 className="text-sm font-bold text-[#0F2A3D]">
            No questions asked yet
          </h5>
          <p className="text-xs text-[#5B7385] max-w-md mx-auto">
            Have questions about permits, opening times, hiking difficulty, or transport to {placeName}? Be the first to ask!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-[#DCE8F2] p-5 sm:p-6 space-y-3.5 shadow-xs"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#5B7385]">
                    Asked by {q.user_name || 'Traveler'} · {new Date(q.created_at).toLocaleDateString()}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-[#0F2A3D] leading-snug">
                    Q: {q.question_text}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAnsweringQuestionId(answeringQuestionId === q.id ? null : q.id);
                    setAnswerText('');
                  }}
                  className="text-xs text-[#38A9F0] hover:text-[#1E93DC] font-bold transition-colors cursor-pointer flex-shrink-0"
                >
                  {answeringQuestionId === q.id ? 'Cancel' : 'Reply'}
                </button>
              </div>

              {/* Existing Answers */}
              {q.answers && q.answers.length > 0 ? (
                <div className="space-y-2.5 pt-2 pl-3 sm:pl-4 border-l-2 border-[#DCE8F2]">
                  {q.answers.map((ans) => {
                    const isStaff = ans.user_role === 'owner' || ans.user_role === 'developer' || ans.user_role === 'uploader';
                    return (
                      <div key={ans.id} className="text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0F2A3D]">
                            {ans.user_name}
                          </span>
                          {isStaff && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EAF4FD] text-[#38A9F0] text-[10px] font-black uppercase tracking-wider">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Team</span>
                            </span>
                          )}
                          <span className="text-[11px] text-[#5B7385]">
                            {new Date(ans.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#5B7385] leading-relaxed">
                          {ans.answer_text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#5B7385] italic pl-2">
                  No answers yet. Can you answer this question?
                </p>
              )}

              {/* Inline Answer Form */}
              {answeringQuestionId === q.id && (
                <div className="pt-3 border-t border-[#F0F5FA] space-y-2.5">
                  <textarea
                    rows={2}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Write a helpful, verified answer..."
                    className="w-full text-xs rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] p-3 text-[#0F2A3D] placeholder-[#5B7385] focus:outline-none focus:border-[#38A9F0]"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setAnsweringQuestionId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#5B7385] hover:text-[#0F2A3D] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAnswerSubmit(q.id)}
                      disabled={submittingAnswer || !answerText.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      {submittingAnswer ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>Post Answer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ━━━ ASK QUESTION MODAL ━━━ */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-[#DCE8F2]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE8F2]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#38A9F0]" />
                <h4 className="text-base font-black text-[#0F2A3D]">
                  Ask About {placeName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAskModal(false)}
                className="w-8 h-8 rounded-full bg-[#F5FAFF] hover:bg-[#EAF4FD] text-[#5B7385] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0F2A3D] uppercase tracking-wider block mb-1.5">
                  Your Question *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="e.g. Is a local guide mandatory for this hike? Are there safe changing rooms near the waterfall?"
                  className="w-full text-xs sm:text-sm rounded-xl border border-[#DCE8F2] bg-[#F5FAFF] p-3.5 text-[#0F2A3D] placeholder-[#5B7385] focus:outline-none focus:border-[#38A9F0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#5B7385] hover:text-[#0F2A3D] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingQuestion || !newQuestionText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#38A9F0] hover:bg-[#1E93DC] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-[#38A9F0]/25 transition-all cursor-pointer"
                >
                  {submittingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
