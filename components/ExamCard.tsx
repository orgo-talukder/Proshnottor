'use client';

import React from 'react';
import { Quiz } from '../lib/types';
import { Clock, HelpCircle, Award, ArrowRight } from 'lucide-react';

interface ExamCardProps {
  quiz: Quiz;
  onStartExam: (quiz: Quiz) => void;
  onViewInstructions: (quiz: Quiz) => void;
}

export default function ExamCard({ quiz, onStartExam, onViewInstructions }: ExamCardProps) {
  const isMock = quiz.type === 'mock';

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#262626] bg-[#0A0A0A] p-5 sm:p-6 transition-all hover:border-[#3F3F3F] hover:bg-[#0E0E0E]">
      {/* Top Kicker and Title */}
      <div>
        {/* Quiet 1-line unboxed text kicker */}
        <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mb-2.5">
          <span className="font-medium text-[#FACC15]">
            {isMock ? 'মক টেস্ট (টাইমার সহ)' : 'অনুশীলন কুইজ'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{quiz.subject}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">
            {quiz.difficulty === 'easy' ? 'সহজ' : quiz.difficulty === 'medium' ? 'মাঝারি' : 'কঠিন'}
          </span>
        </div>

        {/* Card Title */}
        <h3 className="text-lg font-semibold text-[#F5F5F5] group-hover:text-white transition-colors leading-snug">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-[#A3A3A3] line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>

        {/* Clean Unboxed Metadata with Typographic Separator */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#A3A3A3] pt-3 border-t border-[#1C1C1C]">
          <span className="inline-flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-[#A3A3A3]" />
            <strong className="text-[#F5F5F5] font-semibold">{quiz.totalQuestions}</strong> টি প্রশ্ন
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#A3A3A3]" />
            <strong className="text-[#F5F5F5] font-semibold">{quiz.settings.durationMinutes}</strong> মিনিট
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-[#A3A3A3]" />
            পূর্ণমান <strong className="text-[#F5F5F5] font-semibold">{quiz.settings.totalMarks}</strong>
          </span>
          {quiz.settings.negativeRatio > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-red-400/90 font-medium">
                নেগেটিভ: -{quiz.settings.negativeRatio}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-3">
        <button
          onClick={() => onViewInstructions(quiz)}
          className="text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15] rounded px-1 py-1"
        >
          নিয়ম ও নির্দেশনা
        </button>

        <button
          onClick={() => onStartExam(quiz)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2 text-xs sm:text-sm font-semibold text-black transition-all hover:bg-[#EAB308] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
        >
          <span>পরীক্ষা শুরু করুন</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
