'use client';

import React, { useMemo } from 'react';
import { ExamAttempt } from '../lib/types';
import {
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  BookOpen,
} from 'lucide-react';

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
  // Compute High-Level Metrics
  const metrics = useMemo(() => {
    if (attempts.length === 0) {
      return {
        total: 0,
        avgScorePct: 0,
        bestScorePct: 0,
        overallAccuracy: 0,
        topicStats: {},
        weakTopics: [],
        strongTopics: [],
      };
    }

    const total = attempts.length;
    const avgScorePct = Math.round(
      attempts.reduce((acc, curr) => acc + (curr.result?.percentage || 0), 0) / total
    );
    const bestScorePct = Math.max(...attempts.map((a) => a.result?.percentage || 0));
    const overallAccuracy = Math.round(
      attempts.reduce((acc, curr) => acc + (curr.result?.accuracy || 0), 0) / total
    );

    // Topic aggregate
    const topicStats: Record<string, { correct: number; total: number }> = {};
    for (const att of attempts) {
      if (att.result?.topicBreakdown) {
        for (const [topic, data] of Object.entries(att.result.topicBreakdown)) {
          if (!topicStats[topic]) {
            topicStats[topic] = { correct: 0, total: 0 };
          }
          topicStats[topic].correct += data.correct;
          topicStats[topic].total += data.total;
        }
      }
    }

    const topicList = Object.entries(topicStats).map(([topic, data]) => ({
      topic,
      pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      total: data.total,
    }));

    const weakTopics = topicList.filter((t) => t.pct < 60);
    const strongTopics = topicList.filter((t) => t.pct >= 60);

    return {
      total,
      avgScorePct,
      bestScorePct,
      overallAccuracy,
      topicStats,
      weakTopics,
      strongTopics,
    };
  }, [attempts]);

  if (attempts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="h-16 w-16 rounded-3xl bg-[#0A0A0A] border border-[#262626] flex items-center justify-center text-[#FACC15] mb-5">
          <BookOpen className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-[#F5F5F5]">এখনও কোনো পরীক্ষা শুরু করেননি</h3>
        <p className="mt-2 text-xs sm:text-sm text-[#A3A3A3] max-w-md leading-relaxed">
          প্রথম মক টেস্ট বা অনুশীলন কুইজ শুরু করলে আপনার প্রস্তুতি বিশ্লেষণ, নির্ভুলতা এবং দুর্বল টপিকসমূহ এখানে প্রদর্শিত হবে।
        </p>
        <button
          onClick={onGoToExams}
          className="mt-6 min-h-[48px] rounded-xl bg-[#FACC15] px-6 py-3 text-sm font-bold text-black hover:bg-[#EAB308] transition-all shadow-lg active:scale-[0.98]"
        >
          পরীক্ষা ব্রাউজ করুন
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Student Greeting Header (Section 32) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#FACC15] font-semibold mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>শিক্ষার্থী ড্যাশবোর্ড ও বিশ্লেষণ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
              প্রস্তুতি ট্র্যাক ও পারফরম্যান্স মেট্রিক্স
            </h1>
            <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
              বিসিএস, বিশ্ববিদ্যালয় ভর্তি ও সরকারি চাকরি পরীক্ষার প্রস্তুতি পর্যালোচনা।
            </p>
          </div>

          <button
            onClick={onGoToExams}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-xl bg-[#FACC15] px-5 py-2.5 text-xs sm:text-sm font-bold text-black hover:bg-[#EAB308] transition-all self-start sm:self-auto"
          >
            <span>নতুন পরীক্ষা দিন</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* 4 Summary Progress Metric Cards (Section 32) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 flex flex-col justify-between">
            <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-sky-400" /> মোট পরীক্ষা
            </span>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F5F5]">
                {metrics.total}
              </span>
              <span className="text-xs text-[#A3A3A3] ml-1">টি</span>
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1">সম্পন্নকৃত টেস্ট</span>
          </div>

          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 flex flex-col justify-between">
            <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#FACC15]" /> গড় স্কোর
            </span>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#FACC15]">
                {metrics.avgScorePct}%
              </span>
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1">সার্বিক অর্জিত মান</span>
          </div>

          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 flex flex-col justify-between">
            <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-emerald-400" /> সামগ্রিক নির্ভুলতা
            </span>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {metrics.overallAccuracy}%
              </span>
            </div>
            <span className="text-[11px] text-[#A3A3A3] mt-1">সঠিক উত্তরের হার</span>
          </div>

          <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 flex flex-col justify-between">
            <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-purple-400" /> সর্বোচ্চ স্কোর
            </span>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F5F5F5]">
                {metrics.bestScorePct}%
              </span>
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 font-semibold">সেরা ফলাফল</span>
          </div>
        </div>

        {/* Actionable Topic Guidance: Weak Topics (Section 34, 35) */}
        {metrics.weakTopics.length > 0 && (
          <div className="rounded-2xl border border-amber-950/40 bg-amber-950/10 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-[#FACC15]" />
              <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5]">
                যেসব টপিকে উন্নতি প্রয়োজন (Needs Improvement)
              </h3>
            </div>
            <p className="text-xs text-[#A3A3A3] mb-4">
              এই টপিকগুলোতে আপনার নির্ভুলতার হার ৬০%-এর নিচে। এখনই পুনরায় অনুশীলন করে দুর্বলতা দূর করুন:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {metrics.weakTopics.map((t) => (
                <div
                  key={t.topic}
                  className="rounded-xl border border-[#262626] bg-[#000000] p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F5F5]">{t.topic}</h4>
                    <span className="text-[11px] text-red-400 font-mono mt-0.5 block">
                      সঠিকতা: {t.pct}% ({t.total} টি প্রশ্ন)
                    </span>
                  </div>
                  <button
                    onClick={onGoToExams}
                    className="min-h-[36px] px-3 rounded-lg bg-[#FACC15] text-[11px] font-bold text-black hover:bg-[#EAB308]"
                  >
                    অনুশীলন
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Results Table / Cards (Section 32, 33) */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#1C1C1C]">
            <h3 className="text-base font-bold text-[#F5F5F5]">
              সাম্প্রতিক পরীক্ষার রেকর্ড ({attempts.length} টি)
            </h3>
            <span className="text-xs text-[#A3A3A3]">
              সময়ক্রম অনুসারে সাজানো
            </span>
          </div>

          <div className="space-y-3">
            {attempts.map((att) => {
              const res = att.result;
              const isPassed = (res?.percentage || 0) >= 50;

              return (
                <div
                  key={att.id}
                  className="rounded-xl border border-[#262626] bg-[#000000] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#3F3F3F]"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mb-1">
                      <span className="text-[#FACC15] font-semibold">
                        {att.quizType === 'mock' ? 'মক টেস্ট' : 'অনুশীলন কুইজ'}
                      </span>
                      <span>·</span>
                      <span suppressHydrationWarning className="font-mono text-[#888]">
                        {new Date(att.startedAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#F5F5F5]">{att.quizTitle}</h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A3A3A3] mt-2">
                      <span>
                        স্কোর: <strong className="text-[#FACC15] font-mono">{res?.score || 0}</strong> / {att.totalMarks}
                      </span>
                      <span>·</span>
                      <span>
                        নির্ভুলতা: <strong className="text-[#F5F5F5] font-mono">{res?.accuracy || 0}%</strong>
                      </span>
                      <span>·</span>
                      <span className="text-emerald-400">
                        সঠিক: <strong className="font-mono">{res?.correct || 0}</strong>
                      </span>
                      <span>·</span>
                      <span className="text-red-400">
                        ভুল: <strong className="font-mono">{res?.wrong || 0}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        isPassed
                          ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-900'
                          : 'text-red-400 bg-red-950/40 border border-red-900'
                      }`}
                    >
                      {isPassed ? 'পাস' : 'ফেল'}
                    </span>

                    <button
                      onClick={() => onViewAttemptResult(att)}
                      className="min-h-[44px] flex items-center gap-1.5 rounded-xl bg-[#262626] px-4 py-2 text-xs font-bold text-white hover:bg-[#333] transition-colors"
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
    </div>
  );
}
