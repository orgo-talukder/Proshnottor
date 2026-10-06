'use client';

import React from 'react';
import { useHydrated } from '../hooks/use-hydrated';
import { Quiz, ExamAttempt } from '../lib/types';
import {
  Clock,
  Award,
  AlertTriangle,
  ArrowLeft,
  Play,
  CheckCircle2,
  FileText,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface ExamDetailsViewProps {
  quiz: Quiz;
  userAttempt?: ExamAttempt;
  onBack: () => void;
  onStartExam: (quiz: Quiz) => void;
  onResumeExam?: (attempt: ExamAttempt) => void;
}

export default function ExamDetailsView({
  quiz,
  userAttempt,
  onBack,
  onStartExam,
  onResumeExam,
}: ExamDetailsViewProps) {
  const isHydrated = useHydrated();

  const isInProgress = Boolean(
    isHydrated &&
    userAttempt &&
    userAttempt.status === 'in_progress' &&
    userAttempt.expiresAt > 0
  );
  const isCompleted = userAttempt && userAttempt.status === 'evaluated';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 select-none">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-[#A3A3A3] hover:text-[#FACC15] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>সকল MCQ পরীক্ষার তালিকায় ফিরে যান</span>
      </button>

      {/* Main Details Card */}
      <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1C1C] pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#FACC15]">{quiz.subject}</span>
              <span className="text-[#444]">·</span>
              <span className="text-[#A3A3A3] capitalize">{quiz.difficulty}</span>
              <span className="text-[#444]">·</span>
              <span className="text-[#6B6B6B]">{quiz.type === 'mock' ? 'মক টেস্ট' : 'অনুশীলন কুইজ'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F5F5]">
              {quiz.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              {quiz.description || 'এই পরীক্ষার মাধ্যমে আপনার প্রস্তুতি ও গতিশীলতা যাচাই করুন।'}
            </p>
          </div>

          {/* Status badge */}
          <div className="shrink-0">
            {isInProgress ? (
              <span className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                In Progress
              </span>
            ) : isCompleted ? (
              <span className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Completed ({userAttempt?.result?.score}/{userAttempt?.totalMarks})
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl border border-[#262626] bg-[#121212] text-[#F5F5F5] font-bold text-xs">
                Available
              </span>
            )}
          </div>
        </div>

        {/* 4-Column Exam Key Parameters Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-[#262626] bg-[#000000] text-xs">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">মোট প্রশ্ন (Questions)</span>
            <span className="text-base font-bold text-[#F5F5F5] font-mono mt-0.5">
              {quiz.totalQuestions || quiz.questionIds.length} টি
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">সময়সীমা (Duration)</span>
            <span className="text-base font-bold text-[#F5F5F5] font-mono mt-0.5">
              {quiz.settings.durationMinutes} মিনিট
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">পূর্ণমান (Total Marks)</span>
            <span className="text-base font-bold text-[#F5F5F5] font-mono mt-0.5">
              {quiz.settings.totalMarks}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] text-[#A3A3A3]">নেগেটিভ মার্কিং (Negative)</span>
            <span className="text-base font-bold text-[#EF4444] font-mono mt-0.5">
              {quiz.settings.negativeRatio > 0 ? `-${quiz.settings.negativeRatio}` : 'নেই'}
            </span>
          </div>
        </div>

        {/* Instructions & Guidelines */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A3A3A3] flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-[#FACC15]" />
            <span>পরীক্ষার গুরুত্বপূর্ণ নিয়মাবলী</span>
          </h3>

          <ul className="space-y-2 text-xs text-[#A3A3A3] leading-relaxed list-disc list-inside">
            <li>পরীক্ষা শুরু করার পর স্বয়ংক্রিয় কাউন্টডাউন টাইমার চালু হবে।</li>
            <li>প্রতিটি অপশন নির্বাচনে আপনার উত্তর তাৎক্ষণিকভাবে ক্লাউডে অটো-সেভ হবে।</li>
            <li>সময় শেষ হলে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।</li>
            {quiz.settings.negativeRatio > 0 && (
              <li className="text-[#EF4444]">
                সতর্কতা: প্রতিটি ভুল উত্তরের জন্য {quiz.settings.negativeRatio} নম্বর কাটা যাবে।
              </li>
            )}
            <li>জমা দেওয়ার পর তাৎক্ষণিক সমাধান, স্কোরকার্ড ও ব্যাখ্যা দেখতে পারবেন।</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#1C1C1C]">
          <button
            onClick={onBack}
            className="h-11 px-5 rounded-xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#141414] text-xs font-semibold text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors text-center"
          >
            ফিরে যান
          </button>

          {isInProgress && userAttempt ? (
            <button
              onClick={() => onResumeExam && onResumeExam(userAttempt)}
              className="h-11 px-6 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>পরীক্ষা চালিয়ে যান (Continue Exam)</span>
            </button>
          ) : (
            <button
              onClick={() => onStartExam(quiz)}
              className="h-11 px-6 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>{isCompleted ? 'পুনরায় পরীক্ষা শুরু করুন' : 'Start MCQ Exam'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
