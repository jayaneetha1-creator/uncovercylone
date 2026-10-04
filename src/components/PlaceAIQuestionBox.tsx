'use client';

import React, { useState } from 'react';
import { Sparkles, Send, ArrowRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlaceAIQuestionBoxProps {
  placeName: string;
  category: string;
}

export default function PlaceAIQuestionBox({ placeName, category }: PlaceAIQuestionBoxProps) {
  const [question, setQuestion] = useState('');

  const suggestedQuestions = [
    `What is the optimal time of day to photograph ${placeName}?`,
    `What should I wear or pack for visiting ${placeName}?`,
    `Are there family-friendly trails and facilities at ${placeName}?`,
  ];

  const handleAsk = (qText: string) => {
    // Open AI chatbot drawer with context if event listener or global handler exists
    const customEvent = new CustomEvent('open-ai-chat', {
      detail: {
        placeContext: placeName,
        initialQuery: qText,
      },
    });
    window.dispatchEvent(customEvent);
    toast(`Asking AI Assistant about ${placeName}...`, {
      icon: '✨',
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] rounded-3xl border border-[#DCE8F2] p-5 sm:p-7 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white text-[#38A9F0] flex items-center justify-center shadow-xs flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-black text-[#0F2A3D]">
            Have questions about {placeName}?
          </h4>
          <p className="text-xs text-[#5B7385]">
            Instant travel advice powered by Ceylon travel intelligence
          </p>
        </div>
      </div>

      {/* Suggested Question Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAsk(q)}
            className="text-left text-xs font-semibold px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5FAFF] text-[#0F2A3D] hover:text-[#38A9F0] border border-[#DCE8F2] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
          >
            <span>{q}</span>
            <ArrowRight className="w-3 h-3 text-[#38A9F0] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Direct Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim()) {
            handleAsk(question.trim());
            setQuestion('');
          }
        }}
        className="flex items-center gap-2 pt-1"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`e.g. Can I hire a certified guide on arrival at ${placeName}?`}
            className="w-full text-xs sm:text-sm bg-white border border-[#DCE8F2] focus:border-[#38A9F0] rounded-2xl px-4 py-3 text-[#0F2A3D] placeholder-[#5B7385] outline-none shadow-2xs"
          />
        </div>

        <button
          type="submit"
          className="min-h-[44px] px-5 bg-[#38A9F0] hover:bg-[#1E93DC] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm shadow-[#38A9F0]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
}
