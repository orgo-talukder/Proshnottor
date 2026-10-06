'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  ArrowRight,
  Flame,
  AlertTriangle,
  Play,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { ExamAttempt, Quiz, Question } from '../lib/types';

interface ProgressViewProps {
  attempts: ExamAttempt[];
  quizzes: Quiz[];
  questions: Question[];
  streak: number;
  onPracticeSubject: (subject: string) => void;
}

export default function ProgressView({
  attempts,
  quizzes,
  questions,
  streak,
  onPracticeSubject,
}: ProgressViewProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const evaluatedAttempts = useMemo(() => {
    return attempts.filter((a) => a.status === 'evaluated' && a.result);
  }, [attempts]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalExams = evaluatedAttempts.length;
    let totalScore = 0;
    let totalAccuracy = 0;
    let questionsSolved = 0;
    let totalTimeTaken = 0;

    const subjectStats: Record<string, { correct: number; total: number; score: number }> = {};
    const topicStats: Record<string, { correct: number; total: number; subject: string }> = {};

    evaluatedAttempts.forEach((att) => {
      if (!att.result) return;
      totalScore += att.result.percentage;
      totalAccuracy += att.result.accuracy;
      questionsSolved += att.result.correct + att.result.wrong;
      totalTimeTaken += att.result.timeTakenSec || 0;

      // Topic & subject breakdown
      Object.entries(att.result.topicBreakdown || {}).forEach(([topic, data]) => {
        if (!topicStats[topic]) {
          topicStats[topic] = { correct: 0, total: 0, subject: 'সাধারণ' };
        }
        topicStats[topic].correct += data.correct;
        topicStats[topic].total += data.total;
      });
    });

    // Subject breakdown from questions
    questions.forEach((q) => {
      if (!subjectStats[q.subject]) {
        subjectStats[q.subject] = { correct: 0, total: 0, score: 0 };
      }
    });

    evaluatedAttempts.forEach((att) => {
      if (!att.result) return;
      Object.entries(att.result.perQuestion).forEach(([qId, detail]) => {
        const qObj = questions.find((q) => q.id === qId);
        if (qObj) {
          if (!subjectStats[qObj.subject]) {
            subjectStats[qObj.subject] = { correct: 0, total: 0, score: 0 };
          }
          subjectStats[qObj.subject].total += 1;
          if (detail.isCorrect) subjectStats[qObj.subject].correct += 1;
        }
      });
    });

    const avgScore = totalExams > 0 ? Math.round(totalScore / totalExams) : 0;
    const avgAccuracy = totalExams > 0 ? Math.round(totalAccuracy / totalExams) : 0;

    // Identify weakest subject
    let weakestSubject = '';
    let lowestAcc = 101;
    Object.entries(subjectStats).forEach(([subj, data]) => {
      if (data.total > 0) {
        const acc = Math.round((data.correct / data.total) * 100);
        if (acc < lowestAcc) {
          lowestAcc = acc;
          weakestSubject = subj;
        }
      }
    });

    return {
      totalExams,
      avgScore,
      avgAccuracy,
      questionsSolved,
      totalTimeTakenMin: Math.round(totalTimeTaken / 60),
      subjectStats,
      topicStats,
      weakestSubject: weakestSubject || 'পদার্থবিজ্ঞান',
      weakestAccuracy: lowestAcc <= 100 ? lowestAcc : 64,
    };
  }, [evaluatedAttempts, questions]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Header with Range Selector (Spec Section 50-53) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            Your Progress
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            আপনার প্রস্তুতি কতটা অগ্রসর হয়েছে তার স্পষ্ট তথ্যভিত্তিক চিত্র।
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0A0A] border border-[#262626] rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === '7d' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === '30d' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => timeRange !== 'all' && setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              timeRange === 'all' ? 'bg-[#1C1C1C] text-[#FACC15]' : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5">
          <span className="text-xs text-[#A3A3A3]">Overall Score</span>
          <div className="mt-2 text-3xl font-mono font-extrabold text-[#F5F5F5] tabular-nums">
            {metrics.avgScore}%
          </div>
          <p className="text-[11px] text-[#6B6B6B] mt-1">গড় পারফরম্যান্স স্কোর</p>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5">
          <span className="text-xs text-[#A3A3A3]">Accuracy</span>
          <div className="mt-2 text-3xl font-mono font-extrabold text-emerald-400 tabular-nums">
            {metrics.avgAccuracy}%
          </div>
          <p className="text-[11px] text-[#6B6B6B] mt-1">সঠিক উত্তরের অনুপাত</p>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5">
          <span className="text-xs text-[#A3A3A3]">Questions Solved</span>
          <div className="mt-2 text-3xl font-mono font-extrabold text-sky-400 tabular-nums">
            {metrics.questionsSolved}
          </div>
          <p className="text-[11px] text-[#6B6B6B] mt-1">মোট সমাধান করা প্রশ্ন</p>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5">
          <span className="text-xs text-[#A3A3A3]">Current Streak</span>
          <div className="mt-2 text-3xl font-mono font-extrabold text-amber-400 tabular-nums flex items-center gap-1">
            <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
            <span>{streak} Days</span>
          </div>
          <p className="text-[11px] text-[#6B6B6B] mt-1">ধারাবাহিক অনুশীলনের দিন</p>
        </div>
      </div>

      {/* 3. Action Callout for Weak Area (Spec Section 52) */}
      <div className="rounded-2xl border border-[#FACC15]/40 bg-[#0F0E08] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#FACC15]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#FACC15]">
              Weak Area Alert · দুর্বল বিষয় শনাক্তকরণ
            </span>
          </div>
          <h3 className="text-base font-bold text-[#F5F5F5] mt-1">
            {metrics.weakestSubject} Accuracy: {metrics.weakestAccuracy}%
          </h3>
          <p className="text-xs text-[#A3A3A3] mt-0.5">
            পরিসংখ্যান বলছে {metrics.weakestSubject} বিষয়ে আপনার ভুল তুলনামূলক বেশি। এখনই অতিরিক্ত অনুশীলন করুন।
          </p>
        </div>

        <button
          onClick={() => onPracticeSubject(metrics.weakestSubject)}
          className="h-10 px-5 rounded-xl bg-[#FACC15] text-black font-bold text-xs hover:bg-[#EAB308] flex items-center gap-2 transition-all shadow shrink-0"
        >
          <Play className="h-3.5 w-3.5 fill-black" />
          <span>Practice {metrics.weakestSubject}</span>
        </button>
      </div>

      {/* 4. Subject Performance Breakdown (Spec Section 51) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-[#F5F5F5]">Subject Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics.subjectStats).map(([subj, data]) => {
            const acc = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 75;

            return (
              <div
                key={subj}
                className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F5F5F5]">{subj}</span>
                    <span className="text-xs text-[#6B6B6B]">({data.total} প্রশ্ন সমাধান)</span>
                  </div>
                  <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                    {acc}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-[#1C1C1C] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FACC15] to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${acc}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A3A3A3]">
                  <span>সঠিক উত্তর: {data.correct} টি</span>
                  <button
                    onClick={() => onPracticeSubject(subj)}
                    className="text-[#FACC15] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>অনুশীলন করুন</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Score Trend List (Spec Section 51: Numbers over fancy walls) */}
      <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F5F5F5]">Score Trend (সর্বশেষ পরীক্ষাগুলো)</h2>
            <p className="text-xs text-[#A3A3A3]">ধারাবাহিক পরীক্ষার ফলাফলের গতিপ্রকৃতি</p>
          </div>
          <BarChart3 className="h-5 w-5 text-[#6B6B6B]" />
        </div>

        {evaluatedAttempts.length === 0 ? (
          <p className="text-xs text-[#6B6B6B] py-4 text-center">
            পর্যাপ্ত ডাটা পাওয়া যায়নি। কয়েকটি পরীক্ষা সম্পন্ন করলে এখানে ট্রেন্ড প্রকাশিত হবে।
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
            {evaluatedAttempts.slice(0, 6).map((att, i) => (
              <div
                key={att.id}
                className="rounded-xl border border-[#262626] bg-[#121212] p-3 text-center space-y-1"
              >
                <span className="text-[10px] text-[#6B6B6B] font-mono">Test #{i + 1}</span>
                <div className="text-lg font-bold font-mono text-[#FACC15] tabular-nums">
                  {att.result?.percentage}%
                </div>
                <span className="text-[10px] text-[#A3A3A3] block truncate">
                  {att.quizTitle}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
