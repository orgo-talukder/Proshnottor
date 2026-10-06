'use client';

import React, { useMemo } from 'react';
import { useHydrated } from '../hooks/use-hydrated';
import {
  FileQuestion,
  AlertTriangle,
  TrendingUp,
  Bookmark,
  Clock,
  Award,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Quiz, ExamAttempt, UserProfile, NavigationTab } from '../lib/types';

interface DashboardViewProps {
  profile: UserProfile;
  quizzes: Quiz[];
  attempts: ExamAttempt[];
  inProgressAttempt?: ExamAttempt;
  currentTime?: number;
  onNavigateTab: (tab: NavigationTab) => void;
  onStartExam: (quiz: Quiz) => void;
  onViewQuizDetails: (quiz: Quiz) => void;
  onViewAttemptResult: (attempt: ExamAttempt) => void;
  onDiscardAttempt: (attemptId: string) => void;
}

export default function DashboardView({
  profile,
  quizzes,
  attempts,
  inProgressAttempt,
  currentTime = 0,
  onNavigateTab,
  onStartExam,
  onViewQuizDetails,
  onViewAttemptResult,
  onDiscardAttempt,
}: DashboardViewProps) {
  // Time-aware greeting with server-safe fallback
  const isHydrated = useHydrated();
  const greeting = isHydrated
    ? (() => {
        const h = new Date().getHours();
        return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
      })()
    : 'Welcome';

  // Compute live statistics
  const stats = useMemo(() => {
    const completed = attempts.filter((a) => a.status === 'evaluated' && a.result);
    const totalExams = completed.length;

    let totalScorePct = 0;
    let totalAccuracy = 0;
    let wrongQuestionsCount = 0;

    completed.forEach((att) => {
      if (att.result) {
        totalScorePct += att.result.percentage;
        totalAccuracy += att.result.accuracy;
        wrongQuestionsCount += att.result.wrong;
      }
    });

    const avgScore = totalExams > 0 ? Math.round(totalScorePct / totalExams) : 0;
    const avgAccuracy = totalExams > 0 ? Math.round(totalAccuracy / totalExams) : 0;

    return {
      totalExams,
      avgScore,
      avgAccuracy,
      streak: profile.streak || 7,
      wrongQuestionsCount,
    };
  }, [attempts, profile]);

  // Recommended exams (up to 3)
  const recommendedExams = useMemo(() => {
    return quizzes.slice(0, 3);
  }, [quizzes]);

  // Recent completed exam results
  const recentResults = useMemo(() => {
    return attempts
      .filter((a) => a.status === 'evaluated' && a.result)
      .slice(0, 4);
  }, [attempts]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Top Greeting Section (Spec Section 13-14) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 suppressHydrationWarning className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
              {greeting}, {profile.displayName.split(' ')[0]} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            আজকের প্রস্তুতি শুরু করা যাক · {profile.targetExam || 'বিসিএস ও চাকরির প্রস্তুতি'}
          </p>
        </div>

        {/* Primary Quick Start CTA */}
        <button
          onClick={() => onNavigateTab('mcq_exam')}
          className="self-start sm:self-auto inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] active:scale-95 transition-all shadow-md"
        >
          <Play className="h-4 w-4 fill-black" />
          <span>নতুন MCQ পরীক্ষা শুরু করুন</span>
        </button>
      </div>

      {/* 2. Resume / In-Progress Exam Banner (Spec Section 17 & 42) */}
      {inProgressAttempt && (
        <div className="rounded-2xl border border-[#FACC15]/40 bg-[#0F0E09] p-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#FACC15]/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#FACC15] text-black font-extrabold flex items-center justify-center shrink-0 text-lg shadow">
                ⏳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FACC15]">
                    পরীক্ষা চলমান রয়েছে (In Progress)
                  </span>
                  <span className="text-[#555]">·</span>
                  <span className="text-xs text-[#A3A3A3] font-mono">
                    অবশিষ্ট: {Math.max(1, Math.floor((inProgressAttempt.expiresAt - (currentTime || inProgressAttempt.startedAt)) / 60000))} মিনিট
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F5F5F5] mt-0.5">
                  {inProgressAttempt.quizTitle}
                </h3>
                <p className="text-xs text-[#A3A3A3] mt-0.5">
                  মোট {inProgressAttempt.totalQuestions} টির মধ্যে উত্তর দেওয়া সম্পন্ন হয়েছে।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onDiscardAttempt(inProgressAttempt.id)}
                className="h-10 px-4 rounded-xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#141414] text-xs text-[#A3A3A3] hover:text-white transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => {
                  const q = quizzes.find((quiz) => quiz.id === inProgressAttempt.quizId);
                  if (q) onStartExam(q);
                }}
                className="h-10 px-5 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-2 transition-all shadow"
              >
                <span>পরীক্ষা চালিয়ে যান</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Summary Stats Grid (Spec Section 15: 4 Main Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Total Exams */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4 sm:p-5 flex flex-col justify-between hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A3A3A3]">Total Exams</span>
            <div className="h-8 w-8 rounded-lg bg-[#141414] border border-[#262626] text-[#F5F5F5] flex items-center justify-center">
              <FileQuestion className="h-4 w-4 text-[#FACC15]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-mono tabular-nums">
              {stats.totalExams}
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">সম্পন্ন হওয়া পরীক্ষা</p>
          </div>
        </div>

        {/* Stat 2: Avg Score */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4 sm:p-5 flex flex-col justify-between hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A3A3A3]">Average Score</span>
            <div className="h-8 w-8 rounded-lg bg-[#141414] border border-[#262626] text-sky-400 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-mono tabular-nums">
              {stats.avgScore}%
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">গড় প্রাপ্ত নম্বর</p>
          </div>
        </div>

        {/* Stat 3: Accuracy */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4 sm:p-5 flex flex-col justify-between hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A3A3A3]">Accuracy</span>
            <div className="h-8 w-8 rounded-lg bg-[#141414] border border-[#262626] text-emerald-400 flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-mono tabular-nums">
              {stats.avgAccuracy}%
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">নির্ভুলতার হার</p>
          </div>
        </div>

        {/* Stat 4: Current Streak */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-4 sm:p-5 flex flex-col justify-between hover:border-[#333] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#A3A3A3]">Current Streak</span>
            <div className="h-8 w-8 rounded-lg bg-[#141414] border border-[#262626] text-amber-500 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-mono tabular-nums flex items-center gap-1.5">
              <span>{stats.streak}</span>
              <span className="text-sm font-sans font-normal text-[#A3A3A3]">দিন</span>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-1">ধারাবাহিক পড়াশোনা</p>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Cards (Spec Section 16) */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#A3A3A3] mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: MCQ Exam */}
          <button
            onClick={() => onNavigateTab('mcq_exam')}
            className="group rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#121212] hover:border-[#3F3F3F] p-4 text-left transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-[#1A1A1A] border border-[#333] text-[#FACC15] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileQuestion className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#F5F5F5]">MCQ Exam</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">নতুন পরীক্ষা শুরু করুন</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#FACC15]">
              <span>Start</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 2: Wrong Questions */}
          <button
            onClick={() => onNavigateTab('history_wrong')}
            className="group rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#121212] hover:border-[#3F3F3F] p-4 text-left transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-[#1F1212] border border-[#3F1A1A] text-[#EF4444] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#F5F5F5]">Wrong Questions</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">
              {stats.wrongQuestionsCount > 0 ? `${stats.wrongQuestionsCount} টি প্রশ্ন রিভিউ করুন` : 'ভুল প্রশ্ন আবার অনুশীলন'}
            </p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-[#EF4444]">
              <span>Practice</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 3: Progress */}
          <button
            onClick={() => onNavigateTab('progress')}
            className="group rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#121212] hover:border-[#3F3F3F] p-4 text-left transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-[#121A1F] border border-[#1A2E3F] text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#F5F5F5]">Progress</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">পারফরম্যান্স ও অগ্রগতি</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-sky-400">
              <span>View</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 4: Bookmarks */}
          <button
            onClick={() => onNavigateTab('bookmarks')}
            className="group rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:bg-[#121212] hover:border-[#3F3F3F] p-4 text-left transition-all"
          >
            <div className="h-8 w-8 rounded-lg bg-[#1A1812] border border-[#3F381A] text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Bookmark className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-[#F5F5F5]">Bookmarks</h3>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">সংরক্ষিত গুরুত্বপূর্ণ প্রশ্ন</p>
            <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <span>Saved</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* 5. Two-Column Layout: Recommended Exams & Recent Exam Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recommended Exams (Spec Section 17 & 121) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#F5F5F5]">Recommended for You</h2>
              <p className="text-xs text-[#A3A3A3]">আপনার পরীক্ষার প্রস্তুতির জন্য প্রস্তাবিত মক টেস্ট</p>
            </div>
            <button
              onClick={() => onNavigateTab('mcq_exam')}
              className="text-xs text-[#FACC15] hover:underline font-semibold flex items-center gap-1"
            >
              <span>সকল পরীক্ষা</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {recommendedExams.map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#FACC15]">{quiz.subject}</span>
                    <span className="text-[#444]">·</span>
                    <span className="text-[#A3A3A3] capitalize">{quiz.difficulty}</span>
                    <span className="text-[#444]">·</span>
                    <span className="text-[#6B6B6B]">{quiz.type === 'mock' ? 'মক টেস্ট' : 'অনুশীলন কুইজ'}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#F5F5F5]">
                    {quiz.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A3A3A3] font-mono">
                    <span>{quiz.totalQuestions} Questions</span>
                    <span>·</span>
                    <span>{quiz.settings.durationMinutes} Minutes</span>
                    <span>·</span>
                    <span>{quiz.settings.totalMarks} Marks</span>
                    <span>·</span>
                    <span className="text-[#EF4444]">Negative: {quiz.settings.negativeRatio}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => onViewQuizDetails(quiz)}
                    className="h-9 px-3.5 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1A1A1A] text-xs text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onStartExam(quiz)}
                    className="h-9 px-4 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-1.5 transition-all shadow"
                  >
                    <span>Start</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Results & Performance Message */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#F5F5F5]">Recent Results</h2>
            <button
              onClick={() => onNavigateTab('history_exams')}
              className="text-xs text-[#FACC15] hover:underline font-semibold"
            >
              View All
            </button>
          </div>

          {recentResults.length === 0 ? (
            <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 text-center">
              <HelpCircle className="h-6 w-6 text-[#6B6B6B] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#F5F5F5]">কোনো পরীক্ষা এখনো দেওয়া হয়নি</p>
              <p className="text-[11px] text-[#A3A3A3] mt-1">
                প্রথম একটি MCQ Exam শুরু করুন এবং আপনার অগ্রগতি ট্র্যাক করুন।
              </p>
              <button
                onClick={() => onNavigateTab('mcq_exam')}
                className="mt-3.5 h-8 px-4 rounded-lg bg-[#262626] text-xs font-semibold text-white hover:bg-[#333] transition-colors"
              >
                পরীক্ষা শুরু করুন
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onViewAttemptResult(att)}
                  className="rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] p-3.5 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F5] truncate max-w-[170px]">
                      {att.quizTitle}
                    </span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        att.result && att.result.percentage >= 60
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'
                      }`}
                    >
                      {att.result?.percentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] font-mono">
                    <span>
                      Score: {att.result?.score}/{att.totalMarks}
                    </span>
                    <span>Accuracy: {att.result?.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Insight Box (Spec Section 124) */}
          <div className="rounded-2xl border border-[#262626] bg-[#0D0D0D] p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FACC15]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>প্রস্তুতি পর্যবেক্ষণ</span>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-1.5 leading-relaxed">
              নিয়মিত মক টেস্টে অংশ নিলে এবং ভুল প্রশ্নগুলো ঝালিয়ে নিলে আপনার অ্যাকুরেসি দ্রুত বৃদ্ধি পাবে।
            </p>
            <button
              onClick={() => onNavigateTab('history_wrong')}
              className="mt-3 text-xs text-[#FACC15] hover:underline font-semibold flex items-center gap-1"
            >
              <span>ভুল প্রশ্নসমূহ দেখুন</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
