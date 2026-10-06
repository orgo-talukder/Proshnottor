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
            <span className="text-[11px] text-[#A3A3A3]">মোট প্রশ্ন</span>
            <span className="text-base font-bold text-[#F5F5F5]">{quiz.totalQuestions} টি</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">সময়সীমা</span>
            <span className="text-base font-bold text-[#F5F5F5]">{quiz.settings.durationMinutes} মিনিট</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">মোট নম্বর</span>
            <span className="text-base font-bold text-[#F5F5F5]">{quiz.settings.totalMarks}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">নেগেটিভ মার্ক</span>
            <span className="text-base font-bold text-red-400">
              {quiz.settings.negativeRatio > 0 ? `-${quiz.settings.negativeRatio}` : 'নেই'}
            </span>
          </div>
        </div>

        {/* 5-State Palette Legend */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-[#A3A3A3] mb-3 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-[#FACC15]" />
            প্রশ্ন প্যালেট স্ট্যাটাস চিহ্নের অর্থ:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#A3A3A3]">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs border border-[#3F3F3F] text-[#A3A3A3]">
                ১
              </span>
              <span><strong>দেখা হয়নি:</strong> প্রশ্নটি এখনো ওপেন করেননি।</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs border border-[#EF4444] text-[#EF4444]">
                ২
              </span>
              <span><strong>অনুত্তরিত:</strong> প্রশ্ন দেখা হয়েছে কিন্তু উত্তর সিলেক্ট করা হয়নি।</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs bg-[#22C55E] text-black">
                ৩
              </span>
              <span><strong>উত্তর সম্পন্ন:</strong> উত্তর সেভ করা হয়েছে।</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#000000] border border-[#262626]">
              <span className="h-6 w-6 rounded flex items-center justify-center font-bold text-xs bg-[#A855F7] text-white">
                ৪
              </span>
              <span><strong>রিভিউ চিহ্নিত:</strong> পুনরায় পর্যবেক্ষণের জন্য ফ্ল্যাগ করা।</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="mb-6 p-3 rounded-xl border border-[#262626] bg-[#000000] text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-1.5 font-semibold text-[#F5F5F5] mb-2">
            <Keyboard className="h-4 w-4 text-[#FACC15]" />
            ডেস্কটপ দ্রুত কীবোর্ড শর্টকাট:
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px]">
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">1 - 4</kbd> অপশন নির্বাচন</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">N / →</kbd> পরবর্তী প্রশ্ন</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">P / ←</kbd> পূর্ববর্তী প্রশ্ন</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">M</kbd> রিভিউ মার্ক</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] rounded text-white">C</kbd> ক্লিয়ার উত্তর</span>
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
            আমি পরীক্ষার সমস্ত নিয়মাবলি ও নেগেটিভ মার্কিংয়ের শর্তাবলী পড়েছি এবং একমত হয়ে পরীক্ষা আরম্ভ করতে প্রস্তুত।
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#262626] bg-[#0A0A0A] px-4 py-2 text-xs font-medium text-[#A3A3A3] hover:bg-[#141414] hover:text-[#F5F5F5] transition-colors"
          >
            বাতিল
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
            পরীক্ষা শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
}
