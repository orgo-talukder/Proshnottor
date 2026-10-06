'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  AlertTriangle,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  BookOpen,
} from 'lucide-react';
import { ExamAttempt, Question, QuestionKey, Quiz } from '../lib/types';
import MathText from './MathText';

interface HistoryAndWrongQuestionsProps {
  attempts: ExamAttempt[];
  questions: Question[];
  questionKeys: Record<string, QuestionKey>;
  activeTab: 'history_exams' | 'history_wrong';
  onSelectTab: (tab: 'history_exams' | 'history_wrong') => void;
  onViewAttemptResult: (attempt: ExamAttempt) => void;
  onRetakeQuiz: (quizId: string) => void;
  onStartCustomWrongPractice: (wrongQuestions: Question[]) => void;
}

export default function HistoryAndWrongQuestions({
  attempts,
  questions,
  questionKeys,
  activeTab,
  onSelectTab,
  onViewAttemptResult,
  onRetakeQuiz,
  onStartCustomWrongPractice,
}: HistoryAndWrongQuestionsProps) {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Evaluated attempts list
  const completedAttempts = useMemo(() => {
    return attempts
      .filter((a) => a.status === 'evaluated' && a.result)
      .sort((a, b) => (b.submittedAt || b.startedAt) - (a.submittedAt || a.startedAt));
  }, [attempts]);

  // Aggregate all wrong questions across attempts
  const wrongQuestionsData = useMemo(() => {
    const wrongMap = new Map<string, { question: Question; userAnswers: string[]; lastAttemptDate: string }>();

    completedAttempts.forEach((att) => {
      if (!att.result) return;
      Object.entries(att.result.perQuestion).forEach(([qId, detail]) => {
        if (!detail.isCorrect && detail.selected.length > 0) {
          const qObj = questions.find((q) => q.id === qId);
          if (qObj) {
            wrongMap.set(qId, {
              question: qObj,
              userAnswers: detail.selected,
              lastAttemptDate: new Date(att.submittedAt || att.startedAt).toLocaleDateString('bn-BD'),
            });
          }
        }
      });
    });

    return Array.from(wrongMap.values());
  }, [completedAttempts, questions]);

  // Unique subjects
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.subject));
    return Array.from(set);
  }, [questions]);

  // Filtered wrong questions
  const filteredWrongQuestions = useMemo(() => {
    return wrongQuestionsData.filter((item) => {
      if (subjectFilter !== 'all' && item.question.subject !== subjectFilter) return false;
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const inStem = item.question.stem.toLowerCase().includes(q);
        const inTopic = item.question.topic.toLowerCase().includes(q);
        if (!inStem && !inTopic) return false;
      }
      return true;
    });
  }, [wrongQuestionsData, subjectFilter, searchFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Sub-tabs (Spec Section 44-49) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262626] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
            History & Mistake Review
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3A3] mt-1">
            আগের পরীক্ষার ইতিহাস ও ভুল হওয়া প্রশ্নের নিবিড় পর্যালোচনা।
          </p>
        </div>

        {/* 2 Tabs: Exam History & Wrong Questions */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0A0A0A] border border-[#262626] self-start sm:self-auto">
          <button
            onClick={() => onSelectTab('history_exams')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'history_exams'
                ? 'bg-[#1C1C1C] text-[#FACC15] shadow'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Exam History ({completedAttempts.length})</span>
          </button>

          <button
            onClick={() => onSelectTab('history_wrong')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'history_wrong'
                ? 'bg-[#1C1C1C] text-[#EF4444] shadow'
                : 'text-[#A3A3A3] hover:text-white'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-[#EF4444]" />
            <span>Wrong Questions ({wrongQuestionsData.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXAM HISTORY */}
      {activeTab === 'history_exams' && (
        <div className="space-y-4">
          {completedAttempts.length === 0 ? (
            <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center max-w-md mx-auto">
              <History className="h-10 w-10 text-[#6B6B6B] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#F5F5F5]">এখনও কোনো Exam History নেই</h3>
              <p className="text-xs text-[#A3A3A3] mt-1">
                প্রথম একটি MCQ Exam শুরু করুন এবং পরীক্ষা শেষে এখানে আপনার ফলাফল সংরক্ষিত হবে।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedAttempts.map((att) => {
                const isPassed = att.result ? att.result.percentage >= 60 : false;
                const dateStr = new Date(att.submittedAt || att.startedAt).toLocaleDateString('bn-BD', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={att.id}
                    className="rounded-2xl border border-[#262626] bg-[#0A0A0A] hover:border-[#3F3F3F] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-[#FACC15]">{att.quizType === 'mock' ? 'মক টেস্ট' : 'কুইজ'}</span>
                        <span className="text-[#444]">·</span>
                        <span className="text-[#A3A3A3] flex items-center gap-1 font-mono text-[11px]">
                          <Calendar className="h-3 w-3 text-[#6B6B6B]" />
                          {dateStr}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#F5F5F5]">
                        {att.quizTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-[#A3A3A3]">
                        <span>
                          Score: <strong className="text-white">{att.result?.score}</strong>/{att.totalMarks}
                        </span>
                        <span>·</span>
                        <span>
                          Accuracy: <strong className="text-emerald-400">{att.result?.accuracy}%</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Time: {Math.floor((att.result?.timeTakenSec || 60) / 60)}m {((att.result?.timeTakenSec || 60) % 60)}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-sm font-bold font-mono px-3 py-1.5 rounded-xl border ${
                          isPassed
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                        }`}
                      >
                        {att.result?.percentage}%
                      </span>

                      <button
                        onClick={() => onViewAttemptResult(att)}
                        className="h-9 px-4 rounded-xl bg-[#141414] border border-[#262626] hover:bg-[#1E1E1E] text-xs font-semibold text-[#F5F5F5] transition-colors"
                      >
                        View Result
                      </button>

                      <button
                        onClick={() => onRetakeQuiz(att.quizId)}
                        className="h-9 px-3 rounded-xl bg-[#0A0A0A] border border-[#262626] hover:bg-[#1E1E1E] text-xs text-[#A3A3A3] hover:text-[#FACC15] transition-colors"
                        title="Retake Exam"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WRONG QUESTIONS REVIEW (Spec Section 47-49) */}
      {activeTab === 'history_wrong' && (
        <div className="space-y-6">
          {/* Top CTA Bar for practicing wrong questions */}
          <div className="rounded-2xl border border-[#EF4444]/30 bg-[#140A0A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EF4444]">
                  Mistakes Review Hub
                </span>
                <span className="text-[#555]">·</span>
                <span className="text-xs text-[#A3A3A3] font-mono">
                  {wrongQuestionsData.length} টি প্রশ্নের বিশেষ পুনর্বিবেচনা প্রয়োজন
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F5F5F5] mt-1">
                ভুল থেকেই আসল প্রস্তুতি
              </h3>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                আগের পরীক্ষাগুলোতে যে প্রশ্নগুলোর ভুল উত্তর দিয়েছিলেন, সেগুলোর নির্ভুল সমাধান ও ব্যাখ্যা দেখুন।
              </p>
            </div>

            {wrongQuestionsData.length > 0 && (
              <button
                onClick={() => onStartCustomWrongPractice(filteredWrongQuestions.map((i) => i.question))}
                className="h-10 px-5 rounded-xl bg-[#EF4444] text-white font-bold text-xs hover:bg-[#DC2626] flex items-center gap-2 transition-all shadow shrink-0"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>ভুল প্রশ্নগুলো পুনরায় প্র্যাকটিস করুন ({filteredWrongQuestions.length})</span>
              </button>
            )}
          </div>

          {/* Subject Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15]"
            >
              <option value="all">সকল বিষয় (All Subjects)</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="প্রশ্ন বা টপিক খুঁজুন..."
              className="h-9 px-3 rounded-xl border border-[#262626] bg-[#0A0A0A] text-xs text-[#F5F5F5] outline-none focus:border-[#FACC15] w-64"
            />
          </div>

          {/* List of Wrong Question Cards */}
          {filteredWrongQuestions.length === 0 ? (
            <div className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-12 text-center max-w-md mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#F5F5F5]">কোনো ভুল প্রশ্ন নেই!</h3>
              <p className="text-xs text-[#A3A3A3] mt-1">
                আপনার বাছাইকৃত ফিল্টারে কোনো ভুল প্রশ্ন পাওয়া যায়নি। দারুণ প্রস্তুতি!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWrongQuestions.map(({ question, userAnswers, lastAttemptDate }, index) => {
                const keyObj = questionKeys[question.id];
                const correctOptions = keyObj?.correctOptionIds || [];

                return (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-[#262626] bg-[#0A0A0A] p-5 space-y-4 hover:border-[#3F3F3F] transition-colors"
                  >
                    {/* Top tags */}
                    <div className="flex items-center justify-between text-xs border-b border-[#1C1C1C] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#EF4444] font-bold">
                          #{index + 1}
                        </span>
                        <span className="font-semibold text-[#FACC15]">{question.subject}</span>
                        <span className="text-[#444]">·</span>
                        <span className="text-[#A3A3A3]">{question.topic}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#6B6B6B]">
                        ভুল হয়েছিল: {lastAttemptDate}
                      </span>
                    </div>

                    {/* Question Stem with KaTeX math */}
                    <div className="text-sm text-[#F5F5F5] font-medium leading-relaxed">
                      <MathText text={question.stem} />
                    </div>

                    {/* Options list highlighting wrong vs correct */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {question.options.map((opt) => {
                        const isUserPicked = userAnswers.includes(opt.id);
                        const isCorrect = correctOptions.includes(opt.id);

                        let optStyle = 'border-[#262626] bg-[#000000] text-[#A3A3A3]';
                        if (isUserPicked && !isCorrect) {
                          optStyle = 'border-rose-800 bg-rose-950/40 text-rose-300 font-semibold';
                        } else if (isCorrect) {
                          optStyle = 'border-emerald-800 bg-emerald-950/40 text-emerald-300 font-semibold';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono uppercase font-bold text-[11px]">{opt.id}.</span>
                              <MathText text={opt.text} />
                            </div>

                            {isUserPicked && !isCorrect && (
                              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 shrink-0">
                                <XCircle className="h-3 w-3" /> আপনার উত্তর (ভুল)
                              </span>
                            )}
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="h-3 w-3" /> সঠিক উত্তর
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    {keyObj?.explanation && (
                      <div className="rounded-xl border border-[#262626] bg-[#121212] p-3.5 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#FACC15] mb-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>বিশদ সমাধান ও ব্যাখ্যা:</span>
                        </div>
                        <div className="text-[#CCCCCC] leading-relaxed">
                          <MathText text={keyObj.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
