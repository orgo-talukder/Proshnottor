'use client';

import React from 'react';
import { Quiz } from '../lib/types';
import { Clock, HelpCircle, Award, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ExamCardProps {
  quiz: Quiz;
  onStartExam: (quiz: Quiz) => void;
  onViewInstructions: (quiz: Quiz) => void;
}

export default function ExamCard({ quiz, onStartExam, onViewInstructions }: ExamCardProps) {
  const isMock = quiz.type === 'mock';

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
        isMock
          ? 'border-[#262626] bg-[#0A0A0A] hover:border-[#FACC15]/40 hover:bg-[#0E0E0E]'
          : 'border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] hover:bg-[#0E0E0E]'
      } p-5 sm:p-6`}
    >
      <div>
        {/* Unboxed Metadata Kicker with Status */}
        <div className="flex items-center justify-between text-xs text-[#A3A3A3] mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold flex items-center gap-1 ${
                isMock ? 'text-[#FACC15]' : 'text-sky-400'
              }`}
            >
              {isMock ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  মক টেস্ট (সময় নির্ধারিত)
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  অনুশীলন কুইজ
                </>
              )}
            </span>
            <span aria-hidden="true">·</span>
            <span>{quiz.subject}</span>
          </div>

          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            উপলব্ধ
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#F5F5F5] group-hover:text-white transition-colors leading-snug">
          {quiz.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs sm:text-sm text-[#A3A3A3] line-clamp-2 leading-relaxed">
          {quiz.description}
        </p>

        {/* Clean Typographic Spec Matrix */}
        <div className="mt-5 grid grid-cols-3 gap-2 py-3 border-y border-[#1C1C1C] text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3] flex items-center gap-1">
              <HelpCircle className="h-3 w-3" /> Questions
            </span>
            <span className="font-bold text-[#F5F5F5] font-mono mt-0.5">
              {quiz.totalQuestions} Items
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3] flex items-center gap-1">
              <Clock className="h-3 w-3" /> Duration
            </span>
            <span className="font-bold text-[#F5F5F5] font-mono mt-0.5">
              {quiz.settings.durationMinutes} Mins
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3] flex items-center gap-1">
              <Award className="h-3 w-3" /> Total Marks
            </span>
            <span className="font-bold text-[#FACC15] font-mono mt-0.5">
              {quiz.settings.totalMarks}
            </span>
          </div>
        </div>

        {/* Negative marking indicator if applicable */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#A3A3A3]">
          <span>
            Difficulty:{' '}
            <strong className="text-[#D4D4D4] font-semibold">
              {quiz.difficulty === 'easy' ? 'Easy' : quiz.difficulty === 'medium' ? 'Medium' : 'Hard'}
            </strong>
          </span>
          {(quiz.settings.negativeRatio ?? 0) > 0 ? (
            <span className="text-red-400/90 font-medium">
              Penalty: -{quiz.settings.negativeRatio ?? 0}
            </span>
          ) : (
            <span className="text-emerald-400/80">No Penalty</span>
          )}
        </div>
      </div>

      {/* Action Controls with minimum 44px-48px touch target */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onViewInstructions(quiz)}
          className="min-h-[44px] px-2 text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FACC15] rounded flex items-center"
        >
          Instructions
        </button>

        <button
          onClick={() => onStartExam(quiz)}
          className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] px-4 py-2.5 text-xs sm:text-sm font-bold text-black transition-all hover:bg-[#EAB308] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FACC15]"
        >
          <span>{isMock ? 'Launch Mock Test' : 'Start Practice'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
