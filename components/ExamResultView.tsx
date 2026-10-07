'use client';

import React, { useState, useMemo } from 'react';
import { ExamAttempt, Question } from '../lib/types';
import MathText from './MathText';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Home,
  Check,
  X,
  Minus,
  HelpCircle,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  questions: Question[];
  onRetake: () => void;
  onGoHome: () => void;
}

export default function ExamResultView({
  attempt,
  questions,
  onRetake,
  onGoHome,
}: ExamResultViewProps) {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'unattempted'>('all');
  const result = attempt.result;

  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of questions) {
      map.set(q.id, q);
    }
    return map;
  }, [questions]);

  // Question list with evaluation details (unconditional hook)
  const reviewQuestions = useMemo(() => {
    if (!result) return [];
    return attempt.questionOrder.map((qId, idx) => {
      const qObj = questionMap.get(qId);
      const evalInfo = result.perQuestion[qId];
      return {
        index: idx + 1,
        question: qObj,
        evalInfo,
      };
    }).filter((item) => {
      if (!item.evalInfo) return true;
      if (filter === 'wrong') {
        return item.evalInfo.selected.length > 0 && !item.evalInfo.isCorrect;
      }
      if (filter === 'correct') {
        return item.evalInfo.isCorrect;
      }
      if (filter === 'unattempted') {
        return item.evalInfo.selected.length === 0;
      }
      return true;
    });
  }, [attempt.questionOrder, questionMap, result, filter]);

  if (!result) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-[#A3A3A3]">
        <p>ফলাফল প্রস্তুত হচ্ছে...</p>
      </div>
    );
  }

  const isPassed = result.percentage >= 50;

  // Format time in mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1C1C1C]">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#A3A3A3] mb-1">
                <span className="text-[#FACC15] font-semibold">Examination Result</span>
                <span>·</span>
                <span>{attempt.quizTitle}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F5F5F5]">
                Performance Score Card
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onRetake}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl border border-[#262626] bg-[#000000] px-4 py-2 text-xs font-semibold text-[#F5F5F5] hover:border-[#3F3F3F] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#FACC15]" />
                <span>Retake Exam</span>
              </button>
              <button
                onClick={onGoHome}
                className="min-h-[44px] flex items-center gap-1.5 rounded-xl bg-[#FACC15] px-4 py-2 text-xs font-bold text-black hover:bg-[#EAB308] transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {/* Total Score */}
            <div className="flex flex-col rounded-xl border border-[#262626] bg-[#000000] p-4">
              <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-[#FACC15]" /> Points Scored
              </span>
              <div className="mt-2 flex items-baseline gap-1 font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#FACC15]">
                  {result.score}
                </span>
                <span className="text-xs text-[#A3A3A3]">/ {result.totalMarks}</span>
              </div>
              <span className={`mt-1 text-[11px] font-semibold ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPassed ? 'Passed' : 'Needs Practice'}
              </span>
            </div>

            {/* Accuracy */}
            <div className="flex flex-col rounded-xl border border-[#262626] bg-[#000000] p-4">
              <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-sky-400" /> Accuracy Rate
              </span>
              <div className="mt-2 flex items-baseline gap-1 font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5]">
                  {result.accuracy}%
                </span>
              </div>
              <span className="mt-1 text-[11px] text-[#A3A3A3]">
                Percentage: {result.percentage}%
              </span>
            </div>

            {/* Questions Breakdown */}
            <div className="flex flex-col rounded-xl border border-[#262626] bg-[#000000] p-4">
              <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Correct / Wrong
              </span>
              <div className="mt-2 flex items-baseline gap-2 font-mono text-base sm:text-lg">
                <span className="text-emerald-400 font-bold">✓ {result.correct}</span>
                <span className="text-red-400 font-bold">✗ {result.wrong}</span>
              </div>
              <span className="mt-1 text-[11px] text-[#A3A3A3]">
                Unattempted: {result.unattempted}
              </span>
            </div>

            {/* Time Taken */}
            <div className="flex flex-col rounded-xl border border-[#262626] bg-[#000000] p-4">
              <span className="text-xs text-[#A3A3A3] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-purple-400" /> Time Elapsed
              </span>
              <div className="mt-2 font-mono text-base sm:text-lg font-bold text-[#F5F5F5]">
                {formatTime(result.timeTakenSec)}
              </div>
              <span className="mt-1 text-[11px] text-[#A3A3A3]">
                Allocated: {attempt.durationMinutes} mins
              </span>
            </div>
          </div>

          {/* Topic-wise Breakdown */}
          {Object.keys(result.topicBreakdown).length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#1C1C1C]">
              <h4 className="text-xs font-semibold text-[#A3A3A3] mb-3">
                Topic Performance Breakdown:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(result.topicBreakdown).map(([topic, data]) => {
                  const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                  return (
                    <div
                      key={topic}
                      className="p-3 rounded-lg border border-[#262626] bg-[#000000] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-[#F5F5F5]">{topic}</span>
                        <span className="font-mono text-[#A3A3A3]">
                          {data.correct}/{data.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#FACC15] h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Review Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#FACC15]" />
              <span>Question Solutions & Explanations</span>
            </h2>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  filter === 'all' ? 'bg-[#262626] text-white' : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                All ({attempt.totalQuestions})
              </button>
              <button
                onClick={() => setFilter('wrong')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  filter === 'wrong' ? 'bg-[#262626] text-red-400' : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Wrong ({result.wrong})
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  filter === 'correct' ? 'bg-[#262626] text-emerald-400' : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Correct ({result.correct})
              </button>
              <button
                onClick={() => setFilter('unattempted')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg transition-colors font-semibold ${
                  filter === 'unattempted' ? 'bg-[#262626] text-purple-400' : 'text-[#A3A3A3] hover:text-white'
                }`}
              >
                Unattempted ({result.unattempted})
              </button>
            </div>
          </div>

          {/* Question cards */}
          <div className="space-y-4">
            {reviewQuestions.map((item) => {
              const q = item.question;
              const evalInfo = item.evalInfo;
              if (!q || !evalInfo) return null;

              const isUnattempted = evalInfo.selected.length === 0;
              const isCorrect = evalInfo.isCorrect;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 sm:p-6 transition-colors ${
                    isCorrect
                      ? 'border-emerald-950/60 bg-[#08120B]'
                      : isUnattempted
                      ? 'border-[#262626] bg-[#0A0A0A]'
                      : 'border-red-950/60 bg-[#140808]'
                  }`}
                >
                  {/* Top status bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#222]">
                    <div className="flex items-center gap-2 text-xs text-[#A3A3A3]">
                      <span className="font-bold text-[#F5F5F5]">Question #{item.index}</span>
                      <span>·</span>
                      <span>{q.subject}</span>
                      <span>·</span>
                      <span>{q.topic}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {isCorrect ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Correct (+{evalInfo.marksAwarded})
                        </span>
                      ) : isUnattempted ? (
                        <span className="text-[#A3A3A3] flex items-center gap-1">
                          <Minus className="h-4 w-4" /> Unattempted (0)
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1">
                          <X className="h-4 w-4" /> Wrong ({evalInfo.marksAwarded})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stem */}
                  <div className="text-sm sm:text-base font-medium text-[#F5F5F5] mb-4">
                    <MathText content={q.stem} />
                  </div>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, optIdx) => {
                      const isUserSelected = evalInfo.selected.includes(opt.id);
                      const isCorrectOption = evalInfo.correctOptionIds.includes(opt.id);

                      let optClasses = 'border-[#262626] bg-[#000000] text-[#A3A3A3]';
                      if (isCorrectOption) {
                        optClasses = 'border-emerald-500 bg-emerald-950/30 text-emerald-200 font-medium';
                      } else if (isUserSelected && !isCorrectOption) {
                        optClasses = 'border-red-500 bg-red-950/30 text-red-200 font-medium';
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs sm:text-sm ${optClasses}`}
                        >
                          <span className="font-mono font-bold text-xs">
                            {['A', 'B', 'C', 'D', 'E'][optIdx] || optIdx + 1}.
                          </span>
                          <div className="flex-1">
                            <MathText content={opt.text} />
                          </div>
                          {isCorrectOption && (
                            <span className="text-[11px] font-bold text-emerald-400 shrink-0">
                              (Correct Key)
                            </span>
                          )}
                          {isUserSelected && !isCorrectOption && (
                            <span className="text-[11px] font-bold text-red-400 shrink-0">
                              (Your Selection)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Block */}
                  {evalInfo.explanation && (
                    <div className="p-3.5 rounded-lg border border-[#262626] bg-[#000000] text-xs leading-relaxed text-[#D4D4D4]">
                      <strong className="text-[#FACC15] block mb-1">Solution & Explanation:</strong>
                      <MathText content={evalInfo.explanation} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
