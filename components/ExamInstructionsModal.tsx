'use client';

import React, { useState } from 'react';
import { Quiz } from '../lib/types';
import { X, CheckSquare, AlertCircle, Clock, Award, ShieldAlert, Keyboard } from 'lucide-react';

interface ExamInstructionsModalProps {
  quiz: Quiz | null;
  onClose: () => void;
  onProceedToStart: (quiz: Quiz) => void;
}

export default function ExamInstructionsModal({
  quiz,
  onClose,
  onProceedToStart,
}: ExamInstructionsModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#A3A3A3] hover:bg-[#1C1C1C] hover:text-[#F5F5F5] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="text-xs font-semibold text-[#FACC15] uppercase tracking-wider">
            পরীক্ষার নিয়ম ও দিকনির্দেশনা
          </span>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold text-[#F5F5F5]">
            {quiz.title}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#A3A3A3]">
            {quiz.description}
          </p>
        </div>

        {/* Key Parameters Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-xl border border-[#262626] bg-[#000000]">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">Total Questions</span>
            <span className="text-base font-bold text-[#F5F5F5]">{quiz.totalQuestions} Items</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">Duration</span>
            <span className="text-base font-bold text-[#F5F5F5]">{quiz.settings.durationMinutes} Minutes</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">Total Marks</span>
            <span className="text-base font-bold text-[#F5F5F5]">{quiz.settings.totalMarks}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">Negative Ratio</span>
            <span className="text-base font-bold text-red-400">
              {(quiz.settings.negativeRatio ?? 0) > 0 ? `-${quiz.settings.negativeRatio}` : 'None'}
            </span>
          </div>
        </div>

        {/* 5-State Palette Legend */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-[#A3A3A3] mb-3 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-[#FACC15]" />
            Question Matrix Palette Status Legend:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs border border-[#3F3F3F] text-[#A3A3A3]">
                1
              </span>
              <span><strong>Unvisited:</strong> Question has not been viewed yet.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs border border-[#EF4444] text-[#EF4444]">
                2
              </span>
              <span><strong>Unanswered:</strong> Question visited but no option selected.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs bg-[#22C55E] text-black">
                3
              </span>
              <span><strong>Answered:</strong> Option selected and saved.</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs bg-[#A855F7] text-white">
                4
              </span>
              <span><strong>Flagged for Review:</strong> Marked for re-verification.</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="mb-6 p-3 rounded-xl border border-[#262626] bg-[#000000] text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-1.5 font-semibold text-[#F5F5F5] mb-2">
            <Keyboard className="h-4 w-4 text-[#FACC15]" />
            Desktop Keyboard Navigation Shortcuts:
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px]">
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">1 - 4</kbd> Select Option</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">N / →</kbd> Next Question</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">P / ←</kbd> Previous Question</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">M</kbd> Toggle Review</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">C</kbd> Clear Selection</span>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-[#262626] bg-[#0E0E0E] p-3.5">
          <input
            type="checkbox"
            id="agree-rules"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#3F3F3F] bg-black text-[#FACC15] focus:ring-[#FACC15] cursor-pointer"
          />
          <label htmlFor="agree-rules" className="text-xs text-[#F5F5F5] select-none cursor-pointer leading-relaxed">
            I have read and acknowledged all examination rules and negative marking terms.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-[#A3A3A3] hover:bg-[#141414] hover:text-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!agreed}
            onClick={() => onProceedToStart(quiz)}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
              agreed
                ? 'bg-[#FACC15] text-black hover:bg-[#EAB308] active:scale-[0.98]'
                : 'bg-[#262626] text-[#6B6B6B] cursor-not-allowed'
            }`}
          >
            Launch Examination
          </button>
        </div>
      </div>
    </div>
  );
}
