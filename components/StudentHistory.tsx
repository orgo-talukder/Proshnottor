'use client';

import React from 'react';
import { ExamAttempt } from '../lib/types';
import { Award, Clock, ArrowRight, BookOpen, BarChart3, CheckCircle2, History } from 'lucide-react';

interface StudentHistoryProps {
  attempts: ExamAttempt[];
  onViewAttemptResult: (attempt: ExamAttempt) => void;
  onGoToExams: () => void;
}

export default function StudentHistory({
  attempts,
  onViewAttemptResult,
  onGoToExams,
}: StudentHistoryProps) {
  if (attempts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="h-14 w-14 rounded-2xl bg-[#141414] border border-[#262626] flex items-center justify-center text-[#FACC15] mb-4">
          <History className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-[#F5F5F5]">কোনো পরীক্ষার ইতিহাস পাওয়া যায়নি</h3>
        <p className="mt-1 text-xs text-[#A3A3A3] max-w-sm">
          আপনি এখনো কোনো মক টেস্ট বা কুইজে অংশগ্রহণ করেননি। আপনার প্রস্তুতি যাচাই করতে এখনই একটি পরীক্ষা দিন!
        </p>
        <button
          onClick={onGoToExams}
          className="mt-6 rounded-lg bg-[#FACC15] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#EAB308] transition-all"
        >
          পরীক্ষা ব্রাউজ করুন
        </button>
      </div>
    );
  }

  // Calculate high level stats
  const totalCompleted = attempts.length;
  const avgPct = Math.round(
    attempts.reduce((acc, curr) => acc + (curr.result?.percentage || 0), 0) / totalCompleted
  );
  const bestScore = Math.max(...attempts.map((a) => a.result?.percentage || 0));

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-[#262626]">
          <h1 className="text-2xl font-bold text-[#F5F5F5]">আমার পরীক্ষার ফলাফল ও ইতিহাস</h1>
          <p className="text-xs text-[#A3A3A3] mt-1">
            অংশগ্রহণকৃত মক টেস্ট এবং কুইজের পারফরম্যান্স, স্কোর এবং অর্জিত নির্ভুলতা বিশ্লেষণ।
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-4 flex flex-col">
            <span className="text-xs text-[#A3A3A3]">সম্পন্নকৃত পরীক্ষা</span>
            <span className="text-2xl font-bold font-mono text-[#F5F5F5] mt-1">{totalCompleted} টি</span>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-4 flex flex-col">
            <span className="text-xs text-[#A3A3A3]">গড় অর্জিত নম্বর</span>
            <span className="text-2xl font-bold font-mono text-[#FACC15] mt-1">{avgPct}%</span>
          </div>
          <div className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-4 flex flex-col">
            <span className="text-xs text-[#A3A3A3]">সর্বোচ্চ পারফরম্যান্স</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1">{bestScore}%</span>
          </div>
        </div>

        {/* Attempts List */}
        <div className="space-y-3">
          {attempts.map((att) => {
            const res = att.result;
            const isPassed = (res?.percentage || 0) >= 50;

            return (
              <div
                key={att.id}
                className="rounded-xl border border-[#262626] bg-[#0A0A0A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#3F3F3F]"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mb-1">
                    <span className="text-[#FACC15] font-semibold">
                      {att.quizType === 'mock' ? 'মক টেস্ট' : 'অনুশীলন কুইজ'}
                    </span>
                    <span>·</span>
                    <span className="font-mono text-[#888]">
                      {new Date(att.startedAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F5F5]">{att.quizTitle}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#A3A3A3] mt-2">
                    <span>
                      প্রাপ্ত স্কোর: <strong className="text-[#FACC15] font-mono">{res?.score || 0}</strong> / {att.totalMarks}
                    </span>
                    <span>·</span>
                    <span>
                      নির্ভুলতা: <strong className="text-[#F5F5F5] font-mono">{res?.accuracy || 0}%</strong>
                    </span>
                    <span>·</span>
                    <span>
                      সঠিক: <strong className="text-emerald-400 font-mono">{res?.correct || 0}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      ভুল: <strong className="text-red-400 font-mono">{res?.wrong || 0}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${isPassed ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-900' : 'text-red-400 bg-red-950/30 border border-red-900'}`}>
                    {isPassed ? 'পাস' : 'ফেল'}
                  </span>
                  <button
                    onClick={() => onViewAttemptResult(att)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#262626] px-4 py-2 text-xs font-semibold text-white hover:bg-[#333] transition-colors"
                  >
                    <span>বিশ্লেষণ ও সমাধান</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
